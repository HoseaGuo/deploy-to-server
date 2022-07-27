var $g5Y9E$draftlog = require("draftlog");
var $g5Y9E$archiver = require("archiver");
var $g5Y9E$nodessh = require("node-ssh");
var $g5Y9E$chalk = require("chalk");
var $g5Y9E$process = require("process");
var $g5Y9E$fs = require("fs");
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

$parcel$export(module.exports, "default", () => $80bd448eb6ea085b$export$2e2bcd8739ae039);





var $80bd448eb6ea085b$var$__dirname = "";


(0, ($parcel$interopDefault($g5Y9E$draftlog)))(console);
const $80bd448eb6ea085b$var$ssh = new (0, $g5Y9E$nodessh.NodeSSH)();
let $80bd448eb6ea085b$var$defaultOptions = {
    /* 本地打包路径 */ distPath: "./dist",
    /* 服务器部署路径 */ serverPath: "/data/www/test",
    /* 是否安装npm包 */ installNpmPackage: true,
    /* 打包文件名 */ zipFileame: "_dist.zip"
};
let $80bd448eb6ea085b$var$userOptions = {};
// 压缩文件
async function $80bd448eb6ea085b$var$compressZip() {
    const output = $g5Y9E$fs.createWriteStream($80bd448eb6ea085b$var$__dirname + "/" + $80bd448eb6ea085b$var$userOptions.zipFileame);
    const archive = (0, ($parcel$interopDefault($g5Y9E$archiver)))("zip", {
        zlib: {
            level: 9
        } // Sets the compression level.
    });
    archive.pipe(output);
    archive.directory($80bd448eb6ea085b$var$defaultOptions.distPath, false);
    archive.finalize();
    // let update = console.draft("本地打包文件压缩：开始")
    let endLoaing = $80bd448eb6ea085b$var$loadingLog("\u672C\u5730\u6253\u5305\u6587\u4EF6\u538B\u7F29");
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
async function $80bd448eb6ea085b$var$uploadZip() {
    let endLoaing = $80bd448eb6ea085b$var$loadingLog("\u4E0A\u4F20\u6253\u5305\u6587\u4EF6\u5230\u8FDC\u7A0B");
    await $80bd448eb6ea085b$var$ssh.putFile($80bd448eb6ea085b$var$userOptions.zipFileame, `/data/www/test/${$80bd448eb6ea085b$var$userOptions.zipFileame}`);
    endLoaing();
}
// 移除服务器上原有文件
async function $80bd448eb6ea085b$var$cleanServerDir() {
    let endLoaing = $80bd448eb6ea085b$var$loadingLog("\u5220\u9664\u8FDC\u7A0B\u6E90\u6587\u4EF6");
    // 进入远程部署目录
    $80bd448eb6ea085b$var$ssh.execCommand(`cd ${$80bd448eb6ea085b$var$defaultOptions.serverPath}`, {
        cwd: $80bd448eb6ea085b$var$defaultOptions.serverPath
    });
    // 删除除了node_modules外的文件
    $80bd448eb6ea085b$var$ssh.execCommand(`rm \`find ./* |egrep -v 'node_modules'\` -rf`, {
        cwd: $80bd448eb6ea085b$var$defaultOptions.serverPath
    });
    endLoaing();
}
async function $80bd448eb6ea085b$var$uncompressZip() {
    let endLoaing = $80bd448eb6ea085b$var$loadingLog("\u89E3\u538B\u8FDC\u7A0B\u538B\u7F29\u6587\u4EF6\u53CA\u5220\u9664");
    // 进入远程部署目录
    $80bd448eb6ea085b$var$ssh.execCommand(`cd ${$80bd448eb6ea085b$var$defaultOptions.serverPath}`, {
        cwd: $80bd448eb6ea085b$var$defaultOptions.serverPath
    });
    // 解压压缩文件
    $80bd448eb6ea085b$var$ssh.execCommand(`unzip -o ${$80bd448eb6ea085b$var$userOptions.zipFileame} -d .`, {
        cwd: $80bd448eb6ea085b$var$defaultOptions.serverPath
    });
    // 删除压缩文件
    $80bd448eb6ea085b$var$ssh.execCommand(`rm ${$80bd448eb6ea085b$var$userOptions.zipFileame}`, {
        cwd: $80bd448eb6ea085b$var$defaultOptions.serverPath
    });
    endLoaing();
}
// 删除本地打包文件
const $80bd448eb6ea085b$var$deleteLocalZip = async ()=>{
    return new Promise((resolve, reject)=>{
        let endLoaing = $80bd448eb6ea085b$var$loadingLog("\u5220\u9664\u672C\u5730zip\u5305");
        $g5Y9E$fs.unlink($80bd448eb6ea085b$var$userOptions.zipFileame, (err)=>{
            if (err) {
                console.log(err);
                console.log("\u5220\u9664\u672C\u5730zip\u5931\u8D25");
                $g5Y9E$process.exit(1);
            }
            endLoaing();
            resolve(true);
        });
    });
};
async function $80bd448eb6ea085b$var$installPackage() {
    let endLoaing = $80bd448eb6ea085b$var$loadingLog("\u8FDC\u7A0B\u5B89\u88C5npm\u5305");
    // 进入远程部署目录
    $80bd448eb6ea085b$var$ssh.execCommand(`cd ${$80bd448eb6ea085b$var$defaultOptions.serverPath}`, {
        cwd: $80bd448eb6ea085b$var$defaultOptions.serverPath
    });
    // package npm 安装
    await $80bd448eb6ea085b$var$ssh.execCommand(`npm i`, {
        cwd: $80bd448eb6ea085b$var$defaultOptions.serverPath
    });
    endLoaing();
}
function $80bd448eb6ea085b$var$loadingLog(str) {
    let startTimestamp = $g5Y9E$process.hrtime.bigint();
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
            let endTimestamp = $g5Y9E$process.hrtime.bigint();
            update((0, ($parcel$interopDefault($g5Y9E$chalk))).green(`[√] ${str} `) + (0, ($parcel$interopDefault($g5Y9E$chalk))).whiteBright($80bd448eb6ea085b$var$formatNs(endTimestamp - startTimestamp)));
        } else update((0, ($parcel$interopDefault($g5Y9E$chalk))).red(`[×] ${str}`));
    };
}
function $80bd448eb6ea085b$var$formatNs(nsTime) {
    // console.log(nsTime)
    nsTime = Number(nsTime);
    // console.log(nsTime)
    // 1542 928 800
    if (nsTime < 1000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000000) return `${(nsTime / 1000).toFixed(3)}ms`;
    else if (nsTime < 1000 ** 3) return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
    else return `${(nsTime / 1000 ** 3).toFixed(3)}s`;
}
function $80bd448eb6ea085b$export$2e2bcd8739ae039(options) {
    $80bd448eb6ea085b$var$userOptions = Object.assign({}, $80bd448eb6ea085b$var$defaultOptions, options);
    console.log((0, ($parcel$interopDefault($g5Y9E$chalk))).blueBright("\u5F00\u59CB\u90E8\u7F72 >>>"));
    let sshLoading = $80bd448eb6ea085b$var$loadingLog("ssh\u8FDE\u63A5\u670D\u52A1\u5668\u6210\u529F");
    $80bd448eb6ea085b$var$ssh.connect({
        host: "8.134.82.20",
        username: "root",
        password: "GUOHXa!3579"
    }).then(async function() {
        sshLoading();
        $80bd448eb6ea085b$var$cleanServerDir();
        await $80bd448eb6ea085b$var$compressZip();
        await $80bd448eb6ea085b$var$uploadZip();
        await $80bd448eb6ea085b$var$deleteLocalZip();
        $80bd448eb6ea085b$var$uncompressZip();
        if ($80bd448eb6ea085b$var$defaultOptions.installNpmPackage) await $80bd448eb6ea085b$var$installPackage();
        $80bd448eb6ea085b$var$ssh.dispose(); //断开连接
        console.log((0, ($parcel$interopDefault($g5Y9E$chalk))).blueBright("<<< \u7ED3\u675F\u90E8\u7F72"));
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


//# sourceMappingURL=main.js.map
