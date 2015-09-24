import fs = require("fs");
import async = require("async");

export function isGitDirectory(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        if (!path) {
            reject();
        }
        fs.stat(`${path}/.git`, (err, stat) => {
            if (err || !stat.isDirectory()) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

export function gitDirectoryList(basePath?: string): Promise<string[]> {
    if (!basePath) {
        basePath = process.cwd();
    }
    var result: string[] = [];
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(basePath, (err, fileNames) => {
            var finished = 0;
            if (err) {
                reject(err);
                return;
            }
            async.each(fileNames, (fileName,  callback) => {
                var path = `${basePath}/${fileName}`;
                isGitDirectory(path).then((flag) => {
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

