import $7NwGm$draftlog from "draftlog";
import $7NwGm$archiver from "archiver";
import {NodeSSH as $7NwGm$NodeSSH} from "node-ssh";
import {hrtime as $7NwGm$hrtime, exit as $7NwGm$exit} from "process";
import $7NwGm$chalk from "chalk";
import {createWriteStream as $7NwGm$createWriteStream, unlink as $7NwGm$unlink} from "fs";
import "path";









(0, $7NwGm$draftlog)(console);
const $cc32ae507243a800$var$ssh = new (0, $7NwGm$NodeSSH)();
let $cc32ae507243a800$var$defaultOptions = {
    /* 本地打包路径 */ distPath: "./dist",
    /* 服务器部署路径 */ serverPath: "/data/www/test",
    /* 是否安装npm包 */ installNpmPackage: true,
    /* 打包文件名 */ zipFileame: "_dist.zip"
};
let $cc32ae507243a800$var$customOptions = {};
// 压缩文件
async function $cc32ae507243a800$var$compressZip() {
    const output = $7NwGm$createWriteStream("./" + $cc32ae507243a800$var$customOptions.zipFileame);
    const archive = (0, $7NwGm$archiver)("zip", {
        zlib: {
            level: 9
        } // Sets the compression level.
    });
    archive.pipe(output);
    archive.directory($cc32ae507243a800$var$customOptions.distPath, false);
    archive.finalize();
    // let update = console.draft("本地打包文件压缩：开始")
    let endLoaing = $cc32ae507243a800$var$loadingLog("\u672C\u5730\u6253\u5305\u6587\u4EF6\u538B\u7F29");
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
async function $cc32ae507243a800$var$uploadZip() {
    let endLoaing = $cc32ae507243a800$var$loadingLog("\u4E0A\u4F20\u6253\u5305\u6587\u4EF6\u5230\u8FDC\u7A0B");
    try {
        await $cc32ae507243a800$var$ssh.putFile($cc32ae507243a800$var$customOptions.zipFileame, `${$cc32ae507243a800$var$customOptions.serverPath}/${$cc32ae507243a800$var$customOptions.zipFileame}`);
        endLoaing();
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
}
// 移除服务器上原有文件
async function $cc32ae507243a800$var$cleanServerDir() {
    let endLoaing = $cc32ae507243a800$var$loadingLog("\u5220\u9664\u8FDC\u7A0B\u6E90\u6587\u4EF6");
    try {
        // 进入远程部署目录
        await $cc32ae507243a800$var$ssh.execCommand(`cd ${$cc32ae507243a800$var$customOptions.serverPath}`, {
            cwd: $cc32ae507243a800$var$customOptions.serverPath
        });
        // 删除除了node_modules外的文件
        // TODO: 文件删除排除 可以配置
        await $cc32ae507243a800$var$ssh.execCommand(`rm \`find ./* |egrep -v 'node_modules'\` -rf`, {
            cwd: $cc32ae507243a800$var$customOptions.serverPath
        });
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
    endLoaing();
}
async function $cc32ae507243a800$var$uncompressZip() {
    let endLoaing = $cc32ae507243a800$var$loadingLog("\u89E3\u538B\u8FDC\u7A0B\u538B\u7F29\u6587\u4EF6\u53CA\u5220\u9664");
    try {
        // 进入远程部署目录
        await $cc32ae507243a800$var$ssh.execCommand(`cd ${$cc32ae507243a800$var$customOptions.serverPath}`, {
            cwd: $cc32ae507243a800$var$customOptions.serverPath
        });
        // 解压压缩文件
        await $cc32ae507243a800$var$ssh.execCommand(`unzip -o ${$cc32ae507243a800$var$customOptions.zipFileame} -d .`, {
            cwd: $cc32ae507243a800$var$customOptions.serverPath
        });
        // 删除压缩文件
        await $cc32ae507243a800$var$ssh.execCommand(`rm ${$cc32ae507243a800$var$customOptions.zipFileame}`, {
            cwd: $cc32ae507243a800$var$customOptions.serverPath
        });
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
    endLoaing();
}
// 删除本地打包文件
const $cc32ae507243a800$var$deleteLocalZip = async ()=>{
    return new Promise((resolve, reject)=>{
        let endLoaing = $cc32ae507243a800$var$loadingLog("\u5220\u9664\u672C\u5730zip\u5305");
        $7NwGm$unlink($cc32ae507243a800$var$customOptions.zipFileame, (err)=>{
            if (err) {
                console.log(err);
                endLoaing(false);
            }
            endLoaing();
            resolve(true);
        });
    });
};
async function $cc32ae507243a800$var$installPackage() {
    let endLoaing = $cc32ae507243a800$var$loadingLog("\u8FDC\u7A0B\u5B89\u88C5npm\u5305");
    // 进入远程部署目录
    $cc32ae507243a800$var$ssh.execCommand(`cd ${$cc32ae507243a800$var$customOptions.serverPath}`, {
        cwd: $cc32ae507243a800$var$customOptions.serverPath
    });
    // package npm 安装
    try {
        await $cc32ae507243a800$var$ssh.execCommand(`npm i`, {
            cwd: $cc32ae507243a800$var$customOptions.serverPath
        });
    } catch (e) {
        console.log(e);
        endLoaing(false);
    }
    endLoaing();
}
function $cc32ae507243a800$var$loadingLog(str) {
    let startTimestamp = $7NwGm$hrtime.bigint();
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
            let endTimestamp = $7NwGm$hrtime.bigint();
            update((0, $7NwGm$chalk).rgb(92, 175, 158)(`[√] ${str} `) + (0, $7NwGm$chalk).whiteBright($cc32ae507243a800$var$formatNs(endTimestamp - startTimestamp)));
        } else {
            update((0, $7NwGm$chalk).red(`[×] ${str}`));
            // 退出程序
            (0, $7NwGm$exit)(1);
        }
    };
}
function $cc32ae507243a800$var$formatNs(nsTime) {
    // console.log(nsTime)
    nsTime = Number(nsTime);
    // console.log(nsTime)
    // 1542 928 800
    if (nsTime < 1000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000 ** 3) return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
    else return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
}
function $cc32ae507243a800$export$2e2bcd8739ae039(options) {
    let { distPath: distPath , serverPath: serverPath , installNpmPackage: installNpmPackage , zipFileame: zipFileame , ...sshOptions } = options;
    $cc32ae507243a800$var$customOptions = {
        distPath: distPath || $cc32ae507243a800$var$defaultOptions.distPath,
        serverPath: serverPath || $cc32ae507243a800$var$defaultOptions.serverPath,
        installNpmPackage: installNpmPackage !== undefined ? installNpmPackage : $cc32ae507243a800$var$defaultOptions.installNpmPackage,
        zipFileame: zipFileame || $cc32ae507243a800$var$defaultOptions.zipFileame
    };
    let startDeployTimestamp = $7NwGm$hrtime.bigint();
    console.log((0, $7NwGm$chalk).rgb(25, 181, 255)("\u5F00\u59CB\u90E8\u7F72>>>"));
    let sshLoading = $cc32ae507243a800$var$loadingLog("ssh\u8FDE\u63A5\u670D\u52A1\u5668");
    $cc32ae507243a800$var$ssh.connect(sshOptions).then(async function() {
        sshLoading();
        await $cc32ae507243a800$var$cleanServerDir();
        await $cc32ae507243a800$var$compressZip();
        await $cc32ae507243a800$var$uploadZip();
        await $cc32ae507243a800$var$deleteLocalZip();
        await $cc32ae507243a800$var$uncompressZip();
        if ($cc32ae507243a800$var$customOptions.installNpmPackage) await $cc32ae507243a800$var$installPackage();
        $cc32ae507243a800$var$ssh.dispose(); //断开连接
        let endDeployTimestamp = $7NwGm$hrtime.bigint();
        console.log((0, $7NwGm$chalk).rgb(25, 181, 255)("<<<\u7ED3\u675F\u90E8\u7F72"));
        console.log((0, $7NwGm$chalk).rgb(255, 189, 75)("Total time: " + $cc32ae507243a800$var$formatNs(endDeployTimestamp - startDeployTimestamp)));
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


export {$cc32ae507243a800$export$2e2bcd8739ae039 as default};
