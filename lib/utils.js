var fs = require("fs");
var async = require("async");
function isGitDirectory(path) {
    return new Promise(function (resolve, reject) {
        if (!path) {
            reject();
        }
        fs.stat(path + "/.git", function (err, stat) {
            if (err || !stat.isDirectory()) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.isGitDirectory = isGitDirectory;
function gitDirectoryList(basePath) {
    if (!basePath) {
        basePath = process.cwd();
    }
    var result = [];
    return new Promise(function (resolve, reject) {
        fs.readdir(basePath, function (err, fileNames) {
            var finished = 0;
            if (err) {
                reject(err);
                return;
            }
            async.each(fileNames, function (fileName, callback) {
                var path = basePath + "/" + fileName;
                isGitDirectory(path).then(function (flag) {
                    finished++;
                    if (flag) {
                        result.push(fileName);
                    }
                    if (finished === fileNames.length) {
                        resolve(result);
                    }
                    callback();
                }).catch(reject);
            });
        });
    });
}
exports.gitDirectoryList = gitDirectoryList;
