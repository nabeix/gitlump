/// <reference path="../typings/tsd.d.ts" />

import request = require("request");

import {GitRepository} from "./interfaces";

import * as errors from "./errors";

export default class GitHubConnection {
    endpoint: string;
    authData: {user: string, pass: string};

    constructor(endpoint: string) {
        this.endpoint = endpoint;
        this.authData = null;
    }

    // TODO: store OAuth token in .gitlump.json and use it(TBD)
    auth(user: string, password: string): void {
        this.authData = {user: user, pass: password};
    }

    getRepositories(type: string, name: string): Promise<GitRepository[]> {
        return new Promise<GitRepository[]>((resolve, reject) => {
            var url: string = null;
            if (type === "user") {
                url = this.requestURL(`users/${name}/repos`);
            } else if (type === "org") {
                url = this.requestURL(`orgs/${name}/repos`);
            } else {
                reject(new errors.InvalidTypeError("Type `${type}` is unknown."));
            }
            var option = this.createRequestOption(url);
            if (this.authData) {
                option.auth = this.authData;
            }
            request.get(option, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(this.convertList(body));
                } else if (!error && response.statusCode === 403) {
                    reject(new errors.AuthRequiredError("Authentication is required."));;
                } else if (!error && response.statusCode === 401) {
                    reject(new errors.AuthFailedError("Authentication is failed."));
                } else {
                    reject(new errors.BaseError("Failed to get repository list."));
                }
            });
        })
    }

    private createRequestOption(url: string, additionalHeader?: any): request.Options {
        var option: request.Options = {
            url: url,
            json: true,
            headers: {
                "User-Agent": "request"
            }
        };
        if (additionalHeader) {
            for (var key in additionalHeader) {
                option.headers[key] = additionalHeader[key];
            }
        }
        return option;
    }

    private convertList(body: any): GitRepository[] {
        var result: GitRepository[] = [];
        for (var i = 0; i < body.length; i++) {
            var repo = body[i];
            result.push({
                name: repo.name,
                sshUrl: repo.ssh_url,
                httpsUrl: repo.clone_url
            });
        }
        return result;
    }

    private requestURL(path: string): string {
        if (this.endpoint[this.endpoint.length - 1] === "/") {
            return this.endpoint + path;
        } else {
            return `${this.endpoint}/${path}`;
        }
    }

}
