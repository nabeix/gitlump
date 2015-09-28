/// <reference path="../typings/tsd.d.ts" />

import * as fs from "fs";
import * as colors from "ansicolors";

import * as utils from "./utils";
import {CloneConfig, ConfigJson, GitRepository, CloneArguments} from "./interfaces";
import GitHubConnection = require("./GitHubConnection");
import * as GitCommands from "./GitCommands";

function createCloneArguments(repo: GitRepository, json: ConfigJson): CloneArguments {
    var cloneConfig: CloneConfig = null;
    var protocol: string = null;
    var directory: string = null;
    json.repos.forEach((config: CloneConfig) => {
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
    if (type !== "user" && type !== "org") {
        console.log("error: type should be \"user\" or \"org\".");
        return;
    }
    fs.mkdir(name, (error) => {
        if (error) {
            if (error.code === "EEXIST") {
                utils.exitWithError(`Directory ${name} already exists.`);
            } else {
                utils.exitWithError(`Faild to create directory ${name}.`);
            }
        }
        utils.createConfigJson(type, name).then((json) => {
            return utils.writeConfigJson(`./${name}`, json);
        }).then(() => {
            console.log("done");
        }).catch((error) => {
            utils.exitWithError(error.message);
        });
    });
}

// gitlump init
export function init(type: string, name: string): void {
    if (type !== "user" && type !== "org") {
        utils.exitWithError("type should be \"user\" or \"org\".");
    }
    utils.createConfigJson(type, name).then((json) => {
        return utils.writeConfigJson(".", json);
    }).then(() => {
        console.log("done");
    }).catch((error) => {
        utils.exitWithError(error.message);
    });
}

// gitlump clone
export function clone(): void {
    var configJson: ConfigJson = null;
    var cloned: string[] = [];
    utils.readConfigJson().then((config) => {
        configJson = config;
        var gh = new GitHubConnection(config.endpoint);
        return gh.getRepositories(config.type, config.name);
    }).then((list: GitRepository[]) => {
        var clonePromises: Promise<GitCommands.ExecResult>[] = [];
        for (var i = 0; i < list.length; i++) {
            var repo = list[i];
            if (configJson.ignore.indexOf(repo.name) === -1) {
                cloned.push(repo.name);
                if (configJson.cloned.indexOf(repo.name) === -1) {
                var cloneArgs = createCloneArguments(repo, configJson);
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
        configJson.cloned = cloned;
        return utils.writeConfigJson(".", configJson);
    }).then(() => {
        // done
    }).catch((error) => {
        utils.exitWithError(error.message);
    });
}

// gitlump exec
export function exec(command: string): void {

}
