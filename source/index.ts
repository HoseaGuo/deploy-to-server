/* 
  部署流程

  打包后：

  通过ssh连接服务器
  对打包文件里的所有文件到文件压缩 -> 压缩文件
  上传到服务器，服务器进行解压
  删除远程文件
  删除本地文件
  远程进行package.json依赖安装
  pm2启动项目

*/
const fs = require('fs')
const path = require('path')
import DraftLog from 'draftlog';
import archiver from 'archiver';
import { NodeSSH, Config } from "node-ssh";
import { exit } from 'process';
import chalk from 'chalk'

DraftLog(console)

const ssh = new NodeSSH();

interface Options extends Config {
  /* 本地打包路径 */
  distPath?: string,
  /* 服务器部署路径 */
  serverPath?: string,
  /* 是否安装npm包 */
  installNpmPackage?: boolean,
  /* 打包文件名 */
  zipFileame?: string,
  /* 清空文件 排除 */
  cleanExclude?: string,
  /* pm2配置文件，假设存在的话，会在部署最后一步，进行 pm2 startOrReload json 配置文件，来重启pm2 服务 */
  pm2ConfigFileName?: string,
}

let defaultOptions = {
  /* 本地打包路径 */
  distPath: "./dist",
  /* 服务器部署路径 */
  serverPath: "/data/www/_test",
  /* 是否安装npm包 */
  installNpmPackage: false,
  /* 打包文件名 */
  zipFileame: '_dist.zip',
  /* 打包发送到服务器的目录，会清空服务器上文件夹的内容，可以配置清空排除 正则表达式 */
  cleanExclude: "node_modules|.*\.json",
  /* pm2配置文件，假设存在的话，会在部署最后一步，进行 "pm2 startOrReload 配置文件名"，来重启pm2 服务 */
  pm2ConfigFileName: ""
}

let customOptions: Options = {};

// 压缩文件
async function compressZip() {
  const output = fs.createWriteStream('./' + customOptions.zipFileame);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  archive.pipe(output);

  archive.directory(customOptions.distPath!, false);

  archive.finalize();

  // let update = console.draft("本地打包文件压缩：开始")

  let endLoaing = loadingLog('本地打包文件压缩')

  return new Promise((resolve, reject) => {

    archive.on('error', function (err) {
      console.log(err)
      reject(err)
    });

    output.on('close', function () {
      endLoaing()
      resolve(true)
    });
  })
}

// 上传压缩文件
async function uploadZip() {
  let endLoaing = loadingLog('上传打包文件到远程')
  try {
    await ssh.putFile(customOptions.zipFileame!, `${customOptions.serverPath}/${customOptions.zipFileame}`)
    endLoaing()
  } catch (e) {
    console.log(e);
    endLoaing(false)
  }
}

// 移除服务器上原有文件
async function cleanServerDir() {
  let endLoaing = loadingLog('删除远程源文件')
  try {
    // 进入远程部署目录
    await ssh.execCommand(`cd ${customOptions.serverPath}`, { cwd: customOptions.serverPath });
    // 排除删除的文件，除了设置的，还会加上pm2 config 文件，假设存在
    let cleanExclude = [customOptions.pm2ConfigFileName, customOptions.cleanExclude];
    await ssh.execCommand(`rm \`find ./* |egrep -v '`+ cleanExclude!.join('|') +`'\` -rf`, { cwd: customOptions.serverPath });
  } catch (e) {
    console.log(e)
    endLoaing(false);
  }
  endLoaing()
}

async function uncompressZip() {

  let endLoaing = loadingLog('解压远程压缩文件及删除')
  try {
    // 进入远程部署目录
    await ssh.execCommand(`cd ${customOptions.serverPath}`, { cwd: customOptions.serverPath });
    // 解压压缩文件
    await ssh.execCommand(`unzip -o ${customOptions.zipFileame} -d .`, { cwd: customOptions.serverPath });
    // 删除压缩文件
    await ssh.execCommand(`rm ${customOptions.zipFileame}`, { cwd: customOptions.serverPath });
  } catch (e) {
    console.log(e);
    endLoaing(false);
  }
  endLoaing();
}

// 删除本地打包文件
const deleteLocalZip = async () => {
  return new Promise((resolve, reject) => {
    let endLoaing = loadingLog('删除本地zip包')
    fs.unlink(customOptions.zipFileame, (err: any) => {
      if (err) {
        console.log(err);
        endLoaing(false)
      }

      endLoaing();
      resolve(true);
    });
  });
};

async function installPackage() {
  let endLoaing = loadingLog('远程安装npm包')
  // 进入远程部署目录
  ssh.execCommand(`cd ${customOptions.serverPath}`, { cwd: customOptions.serverPath });
  // package npm 安装
  try {
    await ssh.execCommand(`npm i`, { cwd: customOptions.serverPath });
    // 试着加1秒延迟
    await delay(1000);
  } catch (e) {
    console.log(e);
    endLoaing(false);
  }
  endLoaing();
}


function loadingLog(str: string) {
  let startTimestamp = process.hrtime.bigint();
  let frames = ['-', '\\', '|', '/']
  let index = 0;
  let update = console.draft(str + frames[index]);
  let timer = setInterval(() => {
    index = (index + 1) % frames.length
    update(`[${frames[index]}] ${str}`);
  }, 50)
  return function end(isSuccess: boolean = true) {
    clearInterval(timer);
    if (isSuccess) {
      let endTimestamp = process.hrtime.bigint();

      update(chalk.rgb(92, 175, 158)(`[√] ${str} `) + chalk.whiteBright(formatNs(endTimestamp - startTimestamp)));
    } else {
      update(chalk.red(`[×] ${str}`));
      // 退出程序
      exit(1);
    }
  }
}

function formatNs(nsTime: any) {
  // console.log(nsTime)
  nsTime = Number(nsTime);
  // console.log(nsTime)
  // 1542 928 800
  if (nsTime < 1000) { // 100n
    return `${(nsTime / 1000).toFixed(3)}ms`
  } else if (nsTime < 1000 ** 2) { // 100 000n
    return `${(nsTime / 1000).toFixed(3)}ms`
  } else if (nsTime < 1000 ** 3) { // 100s 000m 000n
    return `${(nsTime / (1000 ** 3)).toFixed(3)}s`
  } else {
    return `${(nsTime / (1000 ** 3)).toFixed(3)}s`
  }
}

async function startOrReloadPm2(){
  let endLoaing = loadingLog('start or reload pm2 by config file')
  try {
    // 进入远程部署目录
    await ssh.execCommand(`cd ${customOptions.serverPath}`, { cwd: customOptions.serverPath });
    // 重启pm2配置
    await ssh.execCommand(`pm2 startOrReload ${customOptions.pm2ConfigFileName}`, { cwd: customOptions.serverPath });
  } catch (e) {
    console.log(e);
    endLoaing(false);
  }
  endLoaing();
}

async function delay(time: number){
  return new Promise( resolve => {
    setTimeout( () => {
      resolve(true)
    }, time)
  })
}

export default function deploy(options: Options) {
  let {
    distPath,
    serverPath,
    installNpmPackage,
    zipFileame,
    cleanExclude,
    pm2ConfigFileName,
    ...sshOptions
  } = options;

  customOptions = {
    distPath: distPath || defaultOptions.distPath,
    serverPath: serverPath || defaultOptions.serverPath,
    installNpmPackage: installNpmPackage !== undefined ? installNpmPackage : defaultOptions.installNpmPackage,
    zipFileame: zipFileame || defaultOptions.zipFileame,
    cleanExclude: cleanExclude || defaultOptions.cleanExclude,
    pm2ConfigFileName: pm2ConfigFileName || defaultOptions.pm2ConfigFileName
  };

  let startDeployTimestamp = process.hrtime.bigint();
  console.log(chalk.rgb(25, 181, 255)("开始部署>>>"))

  let sshLoading = loadingLog("ssh连接服务器");

  ssh.connect(sshOptions).then(async function () {
    sshLoading();
    await cleanServerDir();
    await compressZip();
    await uploadZip();
    await deleteLocalZip();
    await uncompressZip();
    if (customOptions.installNpmPackage) {
      await installPackage();
    }

    if(customOptions.pm2ConfigFileName){
      await startOrReloadPm2();
    }

    ssh.dispose(); //断开连接
    let endDeployTimestamp = process.hrtime.bigint();
    console.log(chalk.rgb(25, 181, 255)("<<<结束部署"));
    console.log(chalk.rgb(255, 189, 75)('Total time: ' + formatNs(endDeployTimestamp - startDeployTimestamp)))
  }).catch(e => {
    console.log(e)
    sshLoading(false);
  })
}
