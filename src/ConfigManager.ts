import * as fs from "fs";

import * as errors from "./errors";

import {RepositoryConfig, AppConfig, GitRepository, CloneConfig} from "./interfaces";

const DEFAULT_ENDPOINT = "https://api.github.com/";
const DEFAULT_ACCESS_TOKEN_ENVVAR = "GITLUMP_ACCESS_TOKEN";

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
                useAccessToken: false,
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
            return null;
        }
        var result: RepositoryConfig = null;
        this.config.repos.forEach((config: RepositoryConfig) => {
            if (config.name !== repoName) {
                return;
            }
            result = config;
        });
        return result;
    }

    accessToken(): string {
        if (typeof this.config.useAccessToken === "string") {
            return process.env[<string>this.config.useAccessToken];
        }
        if (!this.config.useAccessToken) {
            return null;
        }
        return process.env[DEFAULT_ACCESS_TOKEN_ENVVAR];
    }

    cloneConfig(repository: GitRepository): CloneConfig {
        var protocol: string = null;
        var directory: string = null;
        var repoConfig = this.repositoryConfig(repository.name);
        if (repoConfig) {
            directory = repoConfig.directory;
            protocol = repoConfig.protocol;
        }
        if (!protocol) {
            protocol = this.config.defaultProtocol;
        }
        if (!directory) {
            directory = repository.name;
        }
        var url = protocol === "https" ? repository.httpsUrl : repository.sshUrl;
        return {
            url: url,
            directory: directory,
            name: repository.name
        }
    }

    ignored(repoName: string): boolean {
        return this.config.ignore.indexOf(repoName) !== -1;
    }

    cloned(repoName: string): boolean {
        return this.config.cloned.indexOf(repoName) !== -1;
    }

    clonedDirectories(): string[] {
        var result: string[] = [];
        this.config.cloned.forEach((repoName) => {
            if (this.ignored(repoName)) {
                return;
            }
            var c = this.repositoryConfig(repoName);
            if (c && c.directory) {
                result.push(c.directory);
            } else {
                result.push(repoName);
            }
        });
        return result;
    }
}
