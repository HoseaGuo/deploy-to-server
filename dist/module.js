import DraftLog from 'draftlog';
import archiver from 'archiver';
import { NodeSSH } from 'node-ssh';
import { exit } from 'process';
import chalk from 'chalk';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

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
var fs = require('fs');
require('path');
DraftLog(console);
var ssh = new NodeSSH();
var defaultOptions = {
    /* 本地打包路径 */
    distPath: "./dist",
    /* 服务器部署路径 */
    serverPath: "/data/www/test",
    /* 是否安装npm包 */
    installNpmPackage: true,
    /* 打包文件名 */
    zipFileame: '_dist.zip'
};
var userOptions = {};
// 压缩文件
function compressZip() {
    return __awaiter(this, void 0, void 0, function () {
        var output, archive, endLoaing;
        return __generator(this, function (_a) {
            output = fs.createWriteStream('./' + userOptions.zipFileame);
            archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });
            archive.pipe(output);
            archive.directory(defaultOptions.distPath, false);
            archive.finalize();
            endLoaing = loadingLog('本地打包文件压缩');
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    archive.on('error', function (err) {
                        console.log(err);
                        reject(err);
                    });
                    output.on('close', function () {
                        endLoaing();
                        resolve(true);
                    });
                })];
        });
    });
}
// 上传压缩文件
function uploadZip() {
    return __awaiter(this, void 0, void 0, function () {
        var endLoaing, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endLoaing = loadingLog('上传打包文件到远程');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ssh.putFile(userOptions.zipFileame, "/data/www/test/".concat(userOptions.zipFileame))];
                case 2:
                    _a.sent();
                    endLoaing();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log(e_1);
                    endLoaing(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// 移除服务器上原有文件
function cleanServerDir() {
    return __awaiter(this, void 0, void 0, function () {
        var endLoaing, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endLoaing = loadingLog('删除远程源文件');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // 进入远程部署目录
                    return [4 /*yield*/, ssh.execCommand("cd ".concat(defaultOptions.serverPath), { cwd: defaultOptions.serverPath })];
                case 2:
                    // 进入远程部署目录
                    _a.sent();
                    // 删除除了node_modules外的文件
                    return [4 /*yield*/, ssh.execCommand("rm `find ./* |egrep -v 'node_modules'` -rf", { cwd: defaultOptions.serverPath })];
                case 3:
                    // 删除除了node_modules外的文件
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    console.log(e_2);
                    endLoaing(false);
                    return [3 /*break*/, 5];
                case 5:
                    endLoaing();
                    return [2 /*return*/];
            }
        });
    });
}
function uncompressZip() {
    return __awaiter(this, void 0, void 0, function () {
        var endLoaing, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endLoaing = loadingLog('解压远程压缩文件及删除');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    // 进入远程部署目录
                    return [4 /*yield*/, ssh.execCommand("cd ".concat(defaultOptions.serverPath), { cwd: defaultOptions.serverPath })];
                case 2:
                    // 进入远程部署目录
                    _a.sent();
                    // 解压压缩文件
                    return [4 /*yield*/, ssh.execCommand("unzip -o ".concat(userOptions.zipFileame, " -d ."), { cwd: defaultOptions.serverPath })];
                case 3:
                    // 解压压缩文件
                    _a.sent();
                    // 删除压缩文件
                    return [4 /*yield*/, ssh.execCommand("rm ".concat(userOptions.zipFileame), { cwd: defaultOptions.serverPath })];
                case 4:
                    // 删除压缩文件
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_3 = _a.sent();
                    console.log(e_3);
                    endLoaing(false);
                    return [3 /*break*/, 6];
                case 6:
                    endLoaing();
                    return [2 /*return*/];
            }
        });
    });
}
// 删除本地打包文件
var deleteLocalZip = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var endLoaing = loadingLog('删除本地zip包');
                fs.unlink(userOptions.zipFileame, function (err) {
                    if (err) {
                        console.log(err);
                        endLoaing(false);
                    }
                    endLoaing();
                    resolve(true);
                });
            })];
    });
}); };
function installPackage() {
    return __awaiter(this, void 0, void 0, function () {
        var endLoaing, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endLoaing = loadingLog('远程安装npm包');
                    // 进入远程部署目录
                    ssh.execCommand("cd ".concat(defaultOptions.serverPath), { cwd: defaultOptions.serverPath });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ssh.execCommand("npm i", { cwd: defaultOptions.serverPath })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _a.sent();
                    console.log(e_4);
                    endLoaing(false);
                    return [3 /*break*/, 4];
                case 4:
                    endLoaing();
                    return [2 /*return*/];
            }
        });
    });
}
function loadingLog(str) {
    var startTimestamp = process.hrtime.bigint();
    var frames = ['-', '\\', '|', '/'];
    var index = 0;
    var update = console.draft(str + frames[index]);
    var timer = setInterval(function () {
        index = (index + 1) % frames.length;
        update("[".concat(frames[index], "] ").concat(str));
    }, 50);
    return function end(isSuccess) {
        if (isSuccess === void 0) { isSuccess = true; }
        clearInterval(timer);
        if (isSuccess) {
            var endTimestamp = process.hrtime.bigint();
            update(chalk.green("[\u221A] ".concat(str, " ")) + chalk.whiteBright(formatNs(endTimestamp - startTimestamp)));
        }
        else {
            update(chalk.red("[\u00D7] ".concat(str)));
            // 退出程序
            exit(1);
        }
    };
}
function formatNs(nsTime) {
    // console.log(nsTime)
    nsTime = Number(nsTime);
    // console.log(nsTime)
    // 1542 928 800
    if (nsTime < 1000) { // 100n
        return "".concat((nsTime / 1000).toFixed(3), "ms");
    }
    else if (nsTime < Math.pow(1000, 2)) { // 100 000n
        return "".concat((nsTime / 1000).toFixed(3), "ms");
    }
    else if (nsTime < Math.pow(1000, 3)) { // 100s 000m 000n
        return "".concat((nsTime / (Math.pow(1000, 3))).toFixed(3), "s");
    }
    else {
        return "".concat((nsTime / (Math.pow(1000, 3))).toFixed(3), "s");
    }
}
function deploy(options) {
    var distPath = options.distPath, serverPath = options.serverPath, installNpmPackage = options.installNpmPackage, zipFileame = options.zipFileame, sshOptions = __rest(options, ["distPath", "serverPath", "installNpmPackage", "zipFileame"]);
    userOptions = {
        distPath: distPath || defaultOptions.distPath,
        serverPath: serverPath || defaultOptions.serverPath,
        installNpmPackage: installNpmPackage || defaultOptions.installNpmPackage,
        zipFileame: zipFileame || defaultOptions.zipFileame
    };
    console.log(chalk.blueBright("开始部署 >>>"));
    var sshLoading = loadingLog("ssh连接服务器");
    ssh.connect(sshOptions).then(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sshLoading();
                        return [4 /*yield*/, cleanServerDir()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, compressZip()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, uploadZip()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, deleteLocalZip()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, uncompressZip()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, installPackage()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        ssh.dispose(); //断开连接
                        console.log(chalk.blueBright("<<< 结束部署"));
                        return [2 /*return*/];
                }
            });
        });
    }).catch(function (e) {
        console.log(e);
        sshLoading(false);
    });
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

export { deploy as default };
