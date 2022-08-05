'use strict';

var DraftLog = require('draftlog');
var archiver = require('archiver');
var nodeSsh = require('node-ssh');
var process$1 = require('process');
var chalk = require('chalk');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var DraftLog__default = /*#__PURE__*/_interopDefaultLegacy(DraftLog);
var archiver__default = /*#__PURE__*/_interopDefaultLegacy(archiver);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

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
DraftLog__default["default"](console);
var ssh = new nodeSsh.NodeSSH();
var defaultOptions = {
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
};
var customOptions = {};
// 压缩文件
function compressZip() {
    return __awaiter(this, void 0, void 0, function () {
        var output, archive, endLoaing;
        return __generator(this, function (_a) {
            output = fs.createWriteStream('./' + customOptions.zipFileame);
            archive = archiver__default["default"]('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });
            archive.pipe(output);
            archive.directory(customOptions.distPath, false);
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
                    return [4 /*yield*/, ssh.putFile(customOptions.zipFileame, "".concat(customOptions.serverPath, "/").concat(customOptions.zipFileame))];
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
        var endLoaing, cleanExclude, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endLoaing = loadingLog('删除远程源文件');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // 进入远程部署目录
                    return [4 /*yield*/, ssh.execCommand("cd ".concat(customOptions.serverPath), { cwd: customOptions.serverPath })];
                case 2:
                    // 进入远程部署目录
                    _a.sent();
                    cleanExclude = [customOptions.pm2ConfigFileName, customOptions.cleanExclude];
                    return [4 /*yield*/, ssh.execCommand("rm `find ./* |egrep -v '" + cleanExclude.join('|') + "'` -rf", { cwd: customOptions.serverPath })];
                case 3:
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
                    return [4 /*yield*/, ssh.execCommand("cd ".concat(customOptions.serverPath), { cwd: customOptions.serverPath })];
                case 2:
                    // 进入远程部署目录
                    _a.sent();
                    // 解压压缩文件
                    return [4 /*yield*/, ssh.execCommand("unzip -o ".concat(customOptions.zipFileame, " -d ."), { cwd: customOptions.serverPath })];
                case 3:
                    // 解压压缩文件
                    _a.sent();
                    // 删除压缩文件
                    return [4 /*yield*/, ssh.execCommand("rm ".concat(customOptions.zipFileame), { cwd: customOptions.serverPath })];
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
                fs.unlink(customOptions.zipFileame, function (err) {
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
                    ssh.execCommand("cd ".concat(customOptions.serverPath), { cwd: customOptions.serverPath });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, ssh.execCommand("npm i", { cwd: customOptions.serverPath })];
                case 2:
                    _a.sent();
                    // 试着加1秒延迟
                    return [4 /*yield*/, delay(1000)];
                case 3:
                    // 试着加1秒延迟
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_4 = _a.sent();
                    console.log(e_4);
                    endLoaing(false);
                    return [3 /*break*/, 5];
                case 5:
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
            update(chalk__default["default"].rgb(92, 175, 158)("[\u221A] ".concat(str, " ")) + chalk__default["default"].whiteBright(formatNs(endTimestamp - startTimestamp)));
        }
        else {
            update(chalk__default["default"].red("[\u00D7] ".concat(str)));
            // 退出程序
            process$1.exit(1);
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
function startOrReloadPm2() {
    return __awaiter(this, void 0, void 0, function () {
        var endLoaing, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endLoaing = loadingLog('start or reload pm2 by config file');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // 进入远程部署目录
                    return [4 /*yield*/, ssh.execCommand("cd ".concat(customOptions.serverPath), { cwd: customOptions.serverPath })];
                case 2:
                    // 进入远程部署目录
                    _a.sent();
                    // 重启pm2配置
                    return [4 /*yield*/, ssh.execCommand("pm2 startOrReload ".concat(customOptions.pm2ConfigFileName), { cwd: customOptions.serverPath })];
                case 3:
                    // 重启pm2配置
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_5 = _a.sent();
                    console.log(e_5);
                    endLoaing(false);
                    return [3 /*break*/, 5];
                case 5:
                    endLoaing();
                    return [2 /*return*/];
            }
        });
    });
}
function delay(time) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(true);
                    }, time);
                })];
        });
    });
}
function deploy(options) {
    var distPath = options.distPath, serverPath = options.serverPath, installNpmPackage = options.installNpmPackage, zipFileame = options.zipFileame, cleanExclude = options.cleanExclude, pm2ConfigFileName = options.pm2ConfigFileName, sshOptions = __rest(options, ["distPath", "serverPath", "installNpmPackage", "zipFileame", "cleanExclude", "pm2ConfigFileName"]);
    customOptions = {
        distPath: distPath || defaultOptions.distPath,
        serverPath: serverPath || defaultOptions.serverPath,
        installNpmPackage: installNpmPackage !== undefined ? installNpmPackage : defaultOptions.installNpmPackage,
        zipFileame: zipFileame || defaultOptions.zipFileame,
        cleanExclude: cleanExclude || defaultOptions.cleanExclude,
        pm2ConfigFileName: pm2ConfigFileName || defaultOptions.pm2ConfigFileName
    };
    var startDeployTimestamp = process.hrtime.bigint();
    console.log(chalk__default["default"].rgb(25, 181, 255)("开始部署>>>"));
    var sshLoading = loadingLog("ssh连接服务器");
    ssh.connect(sshOptions).then(function () {
        return __awaiter(this, void 0, void 0, function () {
            var endDeployTimestamp;
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
                        if (!customOptions.installNpmPackage) return [3 /*break*/, 7];
                        return [4 /*yield*/, installPackage()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!customOptions.pm2ConfigFileName) return [3 /*break*/, 9];
                        return [4 /*yield*/, startOrReloadPm2()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        ssh.dispose(); //断开连接
                        endDeployTimestamp = process.hrtime.bigint();
                        console.log(chalk__default["default"].rgb(25, 181, 255)("<<<结束部署"));
                        console.log(chalk__default["default"].rgb(255, 189, 75)('Total time: ' + formatNs(endDeployTimestamp - startDeployTimestamp)));
                        return [2 /*return*/];
                }
            });
        });
    }).catch(function (e) {
        console.log(e);
        sshLoading(false);
    });
}

module.exports = deploy;
