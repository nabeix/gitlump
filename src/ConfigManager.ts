/// <reference path="../typings/tsd.d.ts" />

import * as fs from "fs";

import * as errors from "./errors";

import {RepositoryConfig, AppConfig} from "./interfaces";

var DEFAULT_ENDPOINT = "https://api.github.com/";

export default class ConfigManager {
    config: AppConfig;

    constructor(config?: AppConfig) {
        this.config = config;
    }

    static createConfig(type: string, name: string): Promise<AppConfig> {
        return new Promise<AppConfig>((resolve, reject) => {
            if (type !== "user" && type !== "org") {
                reject(new errors.InvalidConfigError("type should be user or org."));
                return;
            }
            resolve({
                endpoint: DEFAULT_ENDPOINT,
                type: type,
                name: name,
                defaultProtocol: "ssh",
                repos: [],
                ignore: [],
                cloned: []
            });
        });
    }

    load(config: AppConfig): void {
        this.config = config;
    }

    loadFromFile(path: string): Promise<AppConfig> {
        return new Promise<AppConfig>((resolve, reject) => {
            fs.readFile(path, (error: NodeJS.ErrnoException, data: Buffer) => {
                if (error) {
                    reject(new errors.ReadFileError(`Failed to read ${path}`, error));
                } else {
                    this.config = JSON.parse(data.toString());
                    resolve(this.config);
                }
            });
        });
    }

    writeToFile(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(this.config, null, "    "), (error) => {
                if (error) {
                    reject(new errors.WriteFileError(`Failed to write ${path}`, error));
                } else {
                    resolve();
                }
            });
        });
    }

    repositoryConfig(repoName: string): RepositoryConfig {
        if (!this.config) {
            return;
        }
        var result: RepositoryConfig = null;
        this.config.repos.forEach((config: RepositoryConfig) => {
            if (config.name !== name) {
                return;
            }
            result = config;
        });
        return result;
    }

    ignored(repoName: string): boolean {
        return this.config.ignore.indexOf(repoName) !== -1;
    }

    cloned(repoName: string): boolean {
        return this.config.cloned.indexOf(repoName) !== -1;
    }
}
