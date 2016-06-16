import * as fs from "fs";
import * as path from "path";
import * as ChildProcess from "child_process";
import * as errors from "./errors";

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
        fs.stat(wd, (error, stat) => {
            if (error) {
                reject(new errors.GitCommandExecError(`Directory ${wd} not found.`));
            } else {
                ChildProcess.exec(cmd, {cwd: wd}, (error: Error, stdout: string, stderr: string) => {
                    if (error) {
                        reject(new errors.GitCommandExecError(`Failed to exec: ${cmd}`, stderr.toString()));
                    } else {
                        resolve({
                            command: cmd,
                            stdout: stdout,
                            stderr: stderr
                        });
                    }
                });
            }
        });
    });
}
