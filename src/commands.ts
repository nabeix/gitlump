/// <reference path="../typings/tsd.d.ts" />

import * as fs from "fs";
import * as colors from "ansicolors";

import * as utils from "./utils";
import * as errors from "./errors";
import * as prompt from "./prompt";
import ConfigManager from "./ConfigManager";

import {AuthInfo, RepositoryConfig, AppConfig, GitRepository, CloneArguments} from "./interfaces";
import GitHubConnection from "./GitHubConnection";
import * as GitCommands from "./GitCommands";

var CONFIG_FILENAME = ".gitlump.json";

function createCloneArguments(repo: GitRepository, json: AppConfig): CloneArguments {
    var cloneConfig: RepositoryConfig = null;
    var protocol: string = null;
    var directory: string = null;
    json.repos.forEach((config: RepositoryConfig) => {
        if (config.name !== repo.name) {
            return;
        }
        cloneConfig = config;
    });
    if (cloneConfig) {
        if (cloneConfig.directory) {
            directory = cloneConfig.directory;
        }
        protocol = cloneConfig.protocol;
    }
    if (!protocol) {
        protocol = json.defaultProtocol;
    }
    if (!directory) {
        directory = repo.name;
    }
    var url = protocol === "https" ? repo.httpsUrl : repo.sshUrl;
    return {
        url: url,
        directory: directory
    }
}

// gitlump create
export function create(type: string, name: string): void {
    var manager: ConfigManager = null;
    ConfigManager.createConfig(type, name).then((config) => {
        manager = new ConfigManager(config);
        return utils.mkdir(name);
    }).then(() => {
        return manager.writeToFile(`./${name}/${CONFIG_FILENAME}`);
    }).then(() => {
        console.log("done");
    }).catch((error) => {
        utils.exitWithError(error);
    });
}

// gitlump init
export function init(type: string, name: string): void {
    var manager: ConfigManager = null;
    ConfigManager.createConfig(type, name).then((config) => {
        manager = new ConfigManager(config);
        return manager.writeToFile(`./${CONFIG_FILENAME}`);
    }).then(() => {
        console.log("done");
    }).catch((error) => {
        utils.exitWithError(error);
    });
}

// gitlump clone
export function clone(arg?: {auth: AuthInfo}): void {
    var manager = new ConfigManager();
    var config: AppConfig = null;
    var cloned: string[] = [];
    manager.loadFromFile(`./${CONFIG_FILENAME}`).then(() => {
        config = manager.config;
        var gh = new GitHubConnection(config.endpoint);
        if (arg && arg.auth) {
            gh.auth(arg.auth.username, arg.auth.password);
        }
        return gh.getRepositories(config.type, config.name);
    }).then((list: GitRepository[]) => {
        var clonePromises: Promise<GitCommands.ExecResult>[] = [];
        for (var i = 0; i < list.length; i++) {
            var repo = list[i];
            if (!manager.ignored(repo.name)) {
                cloned.push(repo.name);
                if (!manager.cloned(repo.name)) {
                    var cloneArgs = createCloneArguments(repo, config);
                    clonePromises.push(GitCommands.clone(".", cloneArgs.url, cloneArgs.directory));
                }
            }
        };
        if (clonePromises.length) {
            return Promise.all(clonePromises);
        } else {
            console.log("No new repositories.");
            process.exit();
        }
    }).then((results) => {
        results.forEach((result) => {
            console.log(result.command);
        });
        config.cloned = cloned;
        return manager.writeToFile(`./${CONFIG_FILENAME}`);
    }).then(() => {
        // done
    }).catch((error: errors.BaseError) => {
        if ((error instanceof errors.AuthFailedError)
            || (error instanceof errors.AuthRequiredError)) {
            console.log(error.message);
            prompt.auth().then((value: AuthInfo) => {
                clone({auth: value});
            }).catch((error: errors.BaseError) => {
                utils.exitWithError(error);
            });
        } else {
            utils.exitWithError(error);
        }
    });
}

// gltlump pull
export function pull(): void {
    var manager = new ConfigManager();
    var config: AppConfig = null;
    manager.loadFromFile(`./${CONFIG_FILENAME}`).then(() => {
        config = manager.config;
        config.cloned.forEach(() => {
            GitCommands.exec(".", "pull");
        });
    }).catch((error: errors.BaseError) => {
        utils.exitWithError(error);
    })
}

// gitlump exec
export function exec(command: string): void {

}
