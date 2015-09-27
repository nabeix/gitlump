import * as fs from "fs";
import * as async from "async";

import {ConfigJson} from "./interfaces";


export function exitWithError(message: string) {
    console.log(message);
    process.exit(1);
}

export function createConfigJson(type: string, name: string): Promise<ConfigJson> {
    return new Promise<ConfigJson>((resolve, reject) => {
        if (type !== "user" && type !== "org") {
            reject(new Error("type should be user or org."));
            return;
        }
        resolve({
            endpoint: "https://api.github.com/",
            auth: {},
            type: type,
            name: name,
            defaultProtocol: "ssh",
            repos: [],
            ignore: [],
            cloned: []
        });
    });
}

// write .gitlump.json in current directory.
export function writeConfigJson(path: string, json: ConfigJson): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path + "/.gitlump.json", JSON.stringify(json, null, "    "), (error) => {
            if (error) {
                reject("Failed to write .gitlump.json.");
            } else {
                resolve();
            }
        });
    });
}

// read .gitlump.json in current directory.
export function readConfigJson(): Promise<ConfigJson> {
    return new Promise<ConfigJson>((resolve, reject) => {
        fs.readFile("./.gitlump.json", (error: NodeJS.ErrnoException, data: Buffer) => {
            if (error) {
                reject(new Error("Failed to read .gitlump.json."));
            } else {
                resolve(JSON.parse(data.toString()));
            }
        });
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

