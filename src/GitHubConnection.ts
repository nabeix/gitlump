/// <reference path="../typings/tsd.d.ts" />

import request = require("request");

import {GitRepository} from "./interfaces";

export enum ConnectionErrorCode {
    Unknown,
    AuthRequired,
    AuthFailed,
    NotFound
}

export class ConnectionError implements Error {
    name: string;
    message: string;
    code: ConnectionErrorCode;
    rawError: Error;

    constructor(arg: {code?: ConnectionErrorCode, message?: string, name?: string, rawError?: Error}) {
        this.message = arg.message;
        this.name = arg.name;
        this.code = arg.code;
        this.rawError = arg.rawError;
    }
}

export class GitHubConnection {
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
        var url = this.endpoint;
        if (type === "user") {
            url += `users/${name}/repos`;
        } else if (type === "org") {
            url += `orgs/${name}/repos`;
        }
        var option = this.createRequestOption(url);
        if (this.authData) {
            option.auth = this.authData;
        }
        return new Promise<GitRepository[]>((resolve, reject) => {
            request.get(option, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(this.convertList(body));
                } else if (!error && response.statusCode === 403) {
                    reject(new ConnectionError({code: ConnectionErrorCode.AuthRequired, message: "Authentication is required."}));
                } else if (!error && response.statusCode === 401) {
                    reject(new ConnectionError({code: ConnectionErrorCode.AuthFailed, message: "Authentication is failed."}));
                } else {
                    reject(new ConnectionError({code: ConnectionErrorCode.Unknown, message: "Failed to get repository list.", rawError: error}));
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
}
