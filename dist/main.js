var $gkUzO$draftlog = require("draftlog");
var $gkUzO$archiver = require("archiver");
var $gkUzO$nodessh = require("node-ssh");
var $gkUzO$process = require("process");
var $gkUzO$chalk = require("chalk");
var $gkUzO$fs = require("fs");
require("path");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $7b233214e46acce0$export$2e2bcd8739ae039);








(0, ($parcel$interopDefault($gkUzO$draftlog)))(console);
const $7b233214e46acce0$var$ssh = new (0, $gkUzO$nodessh.NodeSSH)();
let $7b233214e46acce0$var$defaultOptions = {
    /* 本地打包路径 */ distPath: "./dist",
    /* 服务器部署路径 */ serverPath: "/data/www/test",
    /* 是否安装npm包 */ installNpmPackage: true,
    /* 打包文件名 */ zipFileame: "_dist.zip"
};
let $7b233214e46acce0$var$customOptions = {};
// 压缩文件
async function $7b233214e46acce0$var$compressZip() {
    const output = $gkUzO$fs.createWriteStream("./" + $7b233214e46acce0$var$customOptions.zipFileame);
    const archive = (0, ($parcel$interopDefault($gkUzO$archiver)))("zip", {
        zlib: {
            level: 9
        } // Sets the compression level.
    });
    archive.pipe(output);
    archive.directory($7b233214e46acce0$var$customOptions.distPath, false);
    archive.finalize();
    // let update = console.draft("本地打包文件压缩：开始")
    let endLoaing = $7b233214e46acce0$var$loadingLog("\u672C\u5730\u6253\u5305\u6587\u4EF6\u538B\u7F29");
    return new Promise((resolve, reject)=>{
        archive.on("error", function(err) {
            console.log(err);
            reject(err);
        });
        output.on("close", function() {
            endLoaing();
            resolve(true);
        });
    });
}
// 上传压缩文件
async function $7b233214e46acce0$var$uploadZip() {
    let endLoaing = $7b233214e46acce0$var$loadingLog("\u4E0A\u4F20\u6253\u5305\u6587\u4EF6\u5230\u8FDC\u7A0B");
    try {
        await $7b233214e46acce0$var$ssh.putFile($7b233214e46acce0$var$customOptions.zipFileame, `${$7b233214e46acce0$var$customOptions.serverPath}/${$7b233214e46acce0$var$customOptions.zipFileame}`);
        endLoaing();
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
}
// 移除服务器上原有文件
async function $7b233214e46acce0$var$cleanServerDir() {
    let endLoaing = $7b233214e46acce0$var$loadingLog("\u5220\u9664\u8FDC\u7A0B\u6E90\u6587\u4EF6");
    try {
        // 进入远程部署目录
        await $7b233214e46acce0$var$ssh.execCommand(`cd ${$7b233214e46acce0$var$customOptions.serverPath}`, {
            cwd: $7b233214e46acce0$var$customOptions.serverPath
        });
        // 删除除了node_modules外的文件
        // TODO: 文件删除排除 可以配置
        await $7b233214e46acce0$var$ssh.execCommand(`rm \`find ./* |egrep -v 'node_modules'\` -rf`, {
            cwd: $7b233214e46acce0$var$customOptions.serverPath
        });
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
    endLoaing();
}
async function $7b233214e46acce0$var$uncompressZip() {
    let endLoaing = $7b233214e46acce0$var$loadingLog("\u89E3\u538B\u8FDC\u7A0B\u538B\u7F29\u6587\u4EF6\u53CA\u5220\u9664");
    try {
        // 进入远程部署目录
        await $7b233214e46acce0$var$ssh.execCommand(`cd ${$7b233214e46acce0$var$customOptions.serverPath}`, {
            cwd: $7b233214e46acce0$var$customOptions.serverPath
        });
        // 解压压缩文件
        await $7b233214e46acce0$var$ssh.execCommand(`unzip -o ${$7b233214e46acce0$var$customOptions.zipFileame} -d .`, {
            cwd: $7b233214e46acce0$var$customOptions.serverPath
        });
        // 删除压缩文件
        await $7b233214e46acce0$var$ssh.execCommand(`rm ${$7b233214e46acce0$var$customOptions.zipFileame}`, {
            cwd: $7b233214e46acce0$var$customOptions.serverPath
        });
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
    endLoaing();
}
// 删除本地打包文件
const $7b233214e46acce0$var$deleteLocalZip = async ()=>{
    return new Promise((resolve, reject)=>{
        let endLoaing = $7b233214e46acce0$var$loadingLog("\u5220\u9664\u672C\u5730zip\u5305");
        $gkUzO$fs.unlink($7b233214e46acce0$var$customOptions.zipFileame, (err)=>{
            if (err) {
                console.log(err);
                endLoaing(false);
            }
            endLoaing();
            resolve(true);
        });
    });
};
async function $7b233214e46acce0$var$installPackage() {
    let endLoaing = $7b233214e46acce0$var$loadingLog("\u8FDC\u7A0B\u5B89\u88C5npm\u5305");
    // 进入远程部署目录
    $7b233214e46acce0$var$ssh.execCommand(`cd ${$7b233214e46acce0$var$customOptions.serverPath}`, {
        cwd: $7b233214e46acce0$var$customOptions.serverPath
    });
    // package npm 安装
    try {
        await $7b233214e46acce0$var$ssh.execCommand(`npm i`, {
            cwd: $7b233214e46acce0$var$customOptions.serverPath
        });
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
    endLoaing();
}
function $7b233214e46acce0$var$loadingLog(str) {
    let startTimestamp = $gkUzO$process.hrtime.bigint();
    let frames = [
        "-",
        "\\",
        "|",
        "/"
    ];
    let index = 0;
    let update = console.draft(str + frames[index]);
    let timer = setInterval(()=>{
        index = (index + 1) % frames.length;
        update(`[${frames[index]}] ${str}`);
    }, 50);
    return function end(isSuccess = true) {
        clearInterval(timer);
        if (isSuccess) {
            let endTimestamp = $gkUzO$process.hrtime.bigint();
            update((0, ($parcel$interopDefault($gkUzO$chalk))).rgb(92, 175, 158)(`[√] ${str} `) + (0, ($parcel$interopDefault($gkUzO$chalk))).whiteBright($7b233214e46acce0$var$formatNs(endTimestamp - startTimestamp)));
        } else {
            update((0, ($parcel$interopDefault($gkUzO$chalk))).red(`[×] ${str}`));
            // 退出程序
            (0, $gkUzO$process.exit)(1);
        }
    };
}
function $7b233214e46acce0$var$formatNs(nsTime) {
    // console.log(nsTime)
    nsTime = Number(nsTime);
    // console.log(nsTime)
    // 1542 928 800
    if (nsTime < 1000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000 ** 3) return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
    else return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
}
function $7b233214e46acce0$export$2e2bcd8739ae039(options) {
    let { distPath: distPath , serverPath: serverPath , installNpmPackage: installNpmPackage , zipFileame: zipFileame , ...sshOptions } = options;
    $7b233214e46acce0$var$customOptions = {
        distPath: distPath || $7b233214e46acce0$var$defaultOptions.distPath,
        serverPath: serverPath || $7b233214e46acce0$var$defaultOptions.serverPath,
        installNpmPackage: installNpmPackage !== undefined ? installNpmPackage : $7b233214e46acce0$var$defaultOptions.installNpmPackage,
        zipFileame: zipFileame || $7b233214e46acce0$var$defaultOptions.zipFileame
    };
    let startDeployTimestamp = $gkUzO$process.hrtime.bigint();
    console.log((0, ($parcel$interopDefault($gkUzO$chalk))).rgb(25, 181, 255)("\u5F00\u59CB\u90E8\u7F72>>>"));
    let sshLoading = $7b233214e46acce0$var$loadingLog("ssh\u8FDE\u63A5\u670D\u52A1\u5668");
    $7b233214e46acce0$var$ssh.connect(sshOptions).then(async function() {
        sshLoading();
        await $7b233214e46acce0$var$cleanServerDir();
        await $7b233214e46acce0$var$compressZip();
        await $7b233214e46acce0$var$uploadZip();
        await $7b233214e46acce0$var$deleteLocalZip();
        await $7b233214e46acce0$var$uncompressZip();
        if ($7b233214e46acce0$var$customOptions.installNpmPackage) await $7b233214e46acce0$var$installPackage();
        $7b233214e46acce0$var$ssh.dispose(); //断开连接
        let endDeployTimestamp = $gkUzO$process.hrtime.bigint();
        console.log((0, ($parcel$interopDefault($gkUzO$chalk))).rgb(25, 181, 255)("<<<\u7ED3\u675F\u90E8\u7F72"));
        console.log((0, ($parcel$interopDefault($gkUzO$chalk))).rgb(255, 189, 75)("Total time: " + $7b233214e46acce0$var$formatNs(endDeployTimestamp - startDeployTimestamp)));
    }).catch((e)=>{
        console.log(e);
        sshLoading(false);
    });
} /* async function buildPackageJson() {
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


