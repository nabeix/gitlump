/// <reference path="../typings/tsd.d.ts" />

import * as fs from "fs";
import * as path from "path";
import * as ChildProcess from "child_process";

export interface ExecResult {
    command: string;
    stdout: string;
    stderr: string;
}

export function clone(wd: string, url: string, directory: string): Promise<ExecResult> {
    return new Promise<ExecResult>((resolve, reject) => {
        var targetDir = path.resolve(`${wd}/${directory}`);
        fs.stat(targetDir, (error, stat) => {
            if (error) {
                var cmd: string = `clone ${url} ${directory}`;
                exec(wd, cmd).then((result) => {
                    resolve(result);
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error(`Directory ${directory} already exists.`));
            }
        });
    });
}

export function exec(wd: string, arg: string): Promise<ExecResult> {
    var cmd: string = `git ${arg}`;
    return new Promise<ExecResult>((resolve, reject) => {
        ChildProcess.exec(cmd, {cwd: wd}, (error: Error, stdout: Buffer, stderr: Buffer) => {
            if (error) {
                reject(new Error(`Failed to exec: ${cmd}`));
            } else {
                resolve({
                    command: cmd,
                    stdout: stdout.toString(),
                    stderr: stderr.toString()
                });
            }
        });
    });
}
