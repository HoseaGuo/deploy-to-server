import $hCgyA$draftlog from "draftlog";
import $hCgyA$archiver from "archiver";
import {NodeSSH as $hCgyA$NodeSSH} from "node-ssh";
import $hCgyA$chalk from "chalk";
import {exit as $hCgyA$exit, hrtime as $hCgyA$hrtime} from "process";
import {createWriteStream as $hCgyA$createWriteStream, unlink as $hCgyA$unlink} from "fs";
import "path";





var $c3f6c693698dc7cd$var$__dirname = "";



(0, $hCgyA$draftlog)(console);
const $c3f6c693698dc7cd$var$ssh = new (0, $hCgyA$NodeSSH)();
let $c3f6c693698dc7cd$var$defaultOptions = {
    /* 本地打包路径 */ distPath: "./dist",
    /* 服务器部署路径 */ serverPath: "/data/www/test",
    /* 是否安装npm包 */ installNpmPackage: true,
    /* 打包文件名 */ zipFileame: "_dist.zip"
};
let $c3f6c693698dc7cd$var$userOptions = {};
// 压缩文件
async function $c3f6c693698dc7cd$var$compressZip() {
    const output = $hCgyA$createWriteStream($c3f6c693698dc7cd$var$__dirname + "/" + $c3f6c693698dc7cd$var$userOptions.zipFileame);
    const archive = (0, $hCgyA$archiver)("zip", {
        zlib: {
            level: 9
        } // Sets the compression level.
    });
    archive.pipe(output);
    archive.directory($c3f6c693698dc7cd$var$defaultOptions.distPath, false);
    archive.finalize();
    // let update = console.draft("本地打包文件压缩：开始")
    let endLoaing = $c3f6c693698dc7cd$var$loadingLog("\u672C\u5730\u6253\u5305\u6587\u4EF6\u538B\u7F29");
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
async function $c3f6c693698dc7cd$var$uploadZip() {
    let endLoaing = $c3f6c693698dc7cd$var$loadingLog("\u4E0A\u4F20\u6253\u5305\u6587\u4EF6\u5230\u8FDC\u7A0B");
    await $c3f6c693698dc7cd$var$ssh.putFile($c3f6c693698dc7cd$var$userOptions.zipFileame, `/data/www/test/${$c3f6c693698dc7cd$var$userOptions.zipFileame}`);
    endLoaing();
}
// 移除服务器上原有文件
async function $c3f6c693698dc7cd$var$cleanServerDir() {
    let endLoaing = $c3f6c693698dc7cd$var$loadingLog("\u5220\u9664\u8FDC\u7A0B\u6E90\u6587\u4EF6");
    // 进入远程部署目录
    $c3f6c693698dc7cd$var$ssh.execCommand(`cd ${$c3f6c693698dc7cd$var$defaultOptions.serverPath}`, {
        cwd: $c3f6c693698dc7cd$var$defaultOptions.serverPath
    });
    // 删除除了node_modules外的文件
    $c3f6c693698dc7cd$var$ssh.execCommand(`rm \`find ./* |egrep -v 'node_modules'\` -rf`, {
        cwd: $c3f6c693698dc7cd$var$defaultOptions.serverPath
    });
    endLoaing();
}
async function $c3f6c693698dc7cd$var$uncompressZip() {
    let endLoaing = $c3f6c693698dc7cd$var$loadingLog("\u89E3\u538B\u8FDC\u7A0B\u538B\u7F29\u6587\u4EF6\u53CA\u5220\u9664");
    // 进入远程部署目录
    $c3f6c693698dc7cd$var$ssh.execCommand(`cd ${$c3f6c693698dc7cd$var$defaultOptions.serverPath}`, {
        cwd: $c3f6c693698dc7cd$var$defaultOptions.serverPath
    });
    // 解压压缩文件
    $c3f6c693698dc7cd$var$ssh.execCommand(`unzip -o ${$c3f6c693698dc7cd$var$userOptions.zipFileame} -d .`, {
        cwd: $c3f6c693698dc7cd$var$defaultOptions.serverPath
    });
    // 删除压缩文件
    $c3f6c693698dc7cd$var$ssh.execCommand(`rm ${$c3f6c693698dc7cd$var$userOptions.zipFileame}`, {
        cwd: $c3f6c693698dc7cd$var$defaultOptions.serverPath
    });
    endLoaing();
}
// 删除本地打包文件
const $c3f6c693698dc7cd$var$deleteLocalZip = async ()=>{
    return new Promise((resolve, reject)=>{
        let endLoaing = $c3f6c693698dc7cd$var$loadingLog("\u5220\u9664\u672C\u5730zip\u5305");
        $hCgyA$unlink($c3f6c693698dc7cd$var$userOptions.zipFileame, (err)=>{
            if (err) {
                console.log(err);
                console.log("\u5220\u9664\u672C\u5730zip\u5931\u8D25");
                $hCgyA$exit(1);
            }
            endLoaing();
            resolve(true);
        });
    });
};
async function $c3f6c693698dc7cd$var$installPackage() {
    let endLoaing = $c3f6c693698dc7cd$var$loadingLog("\u8FDC\u7A0B\u5B89\u88C5npm\u5305");
    // 进入远程部署目录
    $c3f6c693698dc7cd$var$ssh.execCommand(`cd ${$c3f6c693698dc7cd$var$defaultOptions.serverPath}`, {
        cwd: $c3f6c693698dc7cd$var$defaultOptions.serverPath
    });
    // package npm 安装
    await $c3f6c693698dc7cd$var$ssh.execCommand(`npm i`, {
        cwd: $c3f6c693698dc7cd$var$defaultOptions.serverPath
    });
    endLoaing();
}
function $c3f6c693698dc7cd$var$loadingLog(str) {
    let startTimestamp = $hCgyA$hrtime.bigint();
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
            let endTimestamp = $hCgyA$hrtime.bigint();
            update((0, $hCgyA$chalk).green(`[√] ${str} `) + (0, $hCgyA$chalk).whiteBright($c3f6c693698dc7cd$var$formatNs(endTimestamp - startTimestamp)));
        } else update((0, $hCgyA$chalk).red(`[×] ${str}`));
    };
}
function $c3f6c693698dc7cd$var$formatNs(nsTime) {
    // console.log(nsTime)
    nsTime = Number(nsTime);
    // console.log(nsTime)
    // 1542 928 800
    if (nsTime < 1000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000 ** 3) return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
    else return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
}
function $c3f6c693698dc7cd$export$2e2bcd8739ae039(options) {
    $c3f6c693698dc7cd$var$userOptions = Object.assign({}, $c3f6c693698dc7cd$var$defaultOptions, options);
    console.log((0, $hCgyA$chalk).blueBright("\u5F00\u59CB\u90E8\u7F72 >>>"));
    let sshLoading = $c3f6c693698dc7cd$var$loadingLog("ssh\u8FDE\u63A5\u670D\u52A1\u5668\u6210\u529F");
    $c3f6c693698dc7cd$var$ssh.connect({
        host: "8.134.82.20",
        username: "root",
        password: "GUOHXa!3579"
    }).then(async function() {
        sshLoading();
        $c3f6c693698dc7cd$var$cleanServerDir();
        await $c3f6c693698dc7cd$var$compressZip();
        await $c3f6c693698dc7cd$var$uploadZip();
        await $c3f6c693698dc7cd$var$deleteLocalZip();
        $c3f6c693698dc7cd$var$uncompressZip();
        if ($c3f6c693698dc7cd$var$defaultOptions.installNpmPackage) await $c3f6c693698dc7cd$var$installPackage();
        $c3f6c693698dc7cd$var$ssh.dispose(); //断开连接
        console.log((0, $hCgyA$chalk).blueBright("<<< \u7ED3\u675F\u90E8\u7F72"));
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


export {$c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=module.js.map
