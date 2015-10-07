import * as fs from "fs";
import * as async from "async";
import * as colors from "colors";

import * as errors from "./errors";
import {AppConfig} from "./interfaces";


export function exitWithError(error: errors.BaseError) {
    console.log(colors["red"]("[ERROR] ") + error.message);
    process.exit(1);
}

export function mkdir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(path, (error) => {
            if (error) {
                if (error.code === "EEXIST") {
                    reject(new errors.CreateDirectoryError(`Directory ${path} already exists.`, error));
                } else {
                    reject(new errors.CreateDirectoryError(`Faild to create directory ${path}.`, error));
                }
            }
            resolve();
        })
    });
}

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

