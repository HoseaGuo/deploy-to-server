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
import { NodeSSH } from "node-ssh";
import { exit } from 'process';
import chalk from 'chalk'

DraftLog(console)

const ssh = new NodeSSH();

type Options = {
  /* 本地打包路径 */
  distPath?: string,
  /* 服务器部署路径 */
  serverPath?: string,
  /* 是否安装npm包 */
  installNpmPackage?: boolean,
  /* 打包文件名 */
  zipFileame?: string
}

let defaultOptions: Options = {
  /* 本地打包路径 */
  distPath: "./dist",
  /* 服务器部署路径 */
  serverPath: "/data/www/test",
  /* 是否安装npm包 */
  installNpmPackage: true,
  /* 打包文件名 */
  zipFileame: '_dist.zip'
}

let userOptions: Options = {};

// 压缩文件
async function compressZip() {
  const output = fs.createWriteStream(__dirname + '/' + userOptions.zipFileame);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  archive.pipe(output);

  archive.directory(defaultOptions.distPath!, false);

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
  await ssh.putFile(userOptions.zipFileame!, `/data/www/test/${userOptions.zipFileame}`)
  endLoaing()
}

// 移除服务器上原有文件
async function cleanServerDir() {
  let endLoaing = loadingLog('删除远程源文件')
  // 进入远程部署目录
  ssh.execCommand(`cd ${defaultOptions.serverPath}`, { cwd: defaultOptions.serverPath });
  // 删除除了node_modules外的文件
  ssh.execCommand(`rm \`find ./* |egrep -v 'node_modules'\` -rf`, { cwd: defaultOptions.serverPath });
  endLoaing()
}

async function uncompressZip() {

  let endLoaing = loadingLog('解压远程压缩文件及删除')
  // 进入远程部署目录
  ssh.execCommand(`cd ${defaultOptions.serverPath}`, { cwd: defaultOptions.serverPath });
  // 解压压缩文件
  ssh.execCommand(`unzip -o ${userOptions.zipFileame} -d .`, { cwd: defaultOptions.serverPath });
  // 删除压缩文件
  ssh.execCommand(`rm ${userOptions.zipFileame}`, { cwd: defaultOptions.serverPath });
  endLoaing();
}

// 删除本地打包文件
const deleteLocalZip = async () => {
  return new Promise((resolve, reject) => {
    let endLoaing = loadingLog('删除本地zip包')
    fs.unlink(userOptions.zipFileame, (err: any) => {
      if (err) {
        console.log(err);
        console.log("删除本地zip失败");
        process.exit(1);
      }

      endLoaing();
      resolve(true);
    });
  });
};

async function installPackage() {
  let endLoaing = loadingLog('远程安装npm包')
  // 进入远程部署目录
  ssh.execCommand(`cd ${defaultOptions.serverPath}`, { cwd: defaultOptions.serverPath });
  // package npm 安装
  await ssh.execCommand(`npm i`, { cwd: defaultOptions.serverPath });
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

      update(chalk.green(`[√] ${str} `) + chalk.whiteBright(formatNs(endTimestamp - startTimestamp)));
    } else {
      update(chalk.red(`[×] ${str}`));
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

export default function deploy(options: Options) {
  userOptions = Object.assign({}, defaultOptions, options);

  console.log(chalk.blueBright("开始部署 >>>"))

  let sshLoading = loadingLog("ssh连接服务器成功");

  ssh.connect({
    host: '8.134.82.20',
    username: 'root',
    password: 'GUOHXa!3579'
  }).then(async function () {
    sshLoading();
    cleanServerDir();
    await compressZip();
    await uploadZip();
    await deleteLocalZip();
    uncompressZip();
    if (defaultOptions.installNpmPackage) {
      await installPackage();
    }

    ssh.dispose(); //断开连接

    console.log(chalk.blueBright("<<< 结束部署"));
  })
}

/* async function buildPackageJson() {
  try {
    console.log("构建package.json文件开始");
    let packageJson = require("./package.json");
    let newPackageJson = {
      dependencies: packageJson.dependencies,
    };
    fs.writeFileSync("./dist/package.json", JSON.stringify(newPackageJson));
    console.log("构建package.json文件结束");
  } catch (e) {
    console.log(e);
    console.log("构建package.json文件失败");
    process.exit(1); //退出流程
  }
} */

