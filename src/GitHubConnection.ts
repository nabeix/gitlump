/// <reference path="../typings/tsd.d.ts" />

import request = require("request");

import {GitRepository} from "./interfaces";

class GitHubConnection {
    endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    auth(user: string, password: string) {
        // TODO:
    }

    getRepositories(type: string, name: string): Promise<GitRepository[]> {
        var url = this.endpoint;
        if (type === "user") {
            url += `users/${name}/repos`;
        } else if (type === "org") {
            url += `orgs/${name}/repos`;
        }
        var options = {
            url: url,
            json: true,
            headers: {
                "User-Agent": "request"
            }
        };
        return new Promise<GitRepository[]>((resolve, reject) => {
            request.get(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(this.convertList(body));
                } else {
                    reject(new Error("Failed to get repository list."));
                }
            });
        })
    }

    private convertList(body: any): GitRepository[] {
        var result: GitRepository[] = [];
        for (var i = 0; i < body.length; i++) {
            var repo = body[i];
            result.push({
                name: repo.name,
                sshUrl: repo.git_url,
                httpsUrl: repo.clone_url
            });
        }
        return result;
    }
}

export = GitHubConnection;
