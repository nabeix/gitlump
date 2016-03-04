/// <reference path="../typings/tsd.d.ts" />

import request = require("request");
import http = require("http");

import {GitRepository} from "./interfaces";

import * as errors from "./errors";

interface RequestResult {
    body: any;
    response: http.IncomingMessage;
}

export default class GitHubConnection {
    endpoint: string;
    accessToken: string;
    authData: {user: string, pass: string};

    constructor(endpoint: string, accessToken: string) {
        this.endpoint = endpoint;
        this.accessToken = accessToken;
        this.authData = null;
    }

    // TODO: store OAuth token in .gitlump.json and use it(TBD)
    auth(user: string, password: string): void {
        this.authData = {user: user, pass: password};
    }

    getRepositories(type: string, name: string): Promise<GitRepository[]> {
        return new Promise<GitRepository[]>((resolve, reject) => {
            var url: string = null;
            var repositories: GitRepository[] = null;
            if (type === "user") {
                url = this.requestURL(`users/${name}/repos`);
            } else if (type === "org") {
                url = this.requestURL(`orgs/${name}/repos`);
            } else {
                reject(new errors.InvalidTypeError("Type `${type}` is unknown."));
            }
            var option = this.createRequestOption(url);
            this.requestGet(option).then((result) => {
                repositories = this.createRepositorytList(result.body);
                if (result.response.statusCode === 200) {
                    var pageUrls = result.response.headers["link"] ? this.createPageUrls(result.response.headers["link"]) : null;
                    if (pageUrls && pageUrls.length > 1 ) {
                        var nextRequests: Promise<RequestResult>[] = [];
                        // NOTE: The first url is already done in the first this.requestGet().
                        for (var i = 1; i < pageUrls.length; i++) {
                            var opt = this.createRequestOption(pageUrls[i]);
                            nextRequests.push(this.requestGet(opt));
                        }
                        return Promise.all(nextRequests);
                    } else {
                        resolve(repositories);
                    }
                } else if (result.response.statusCode === 403) {
                    reject(new errors.AuthRequiredError("Authentication is required."));;
                } else if (result.response.statusCode === 401) {
                    reject(new errors.AuthFailedError("Authentication is failed."));
                } else {
                    reject(new errors.BaseError("Failed to get repository list."));
                }
            }).then((result) => {
                for (var i = 0; i < result.length; i++) {
                    var list = this.createRepositorytList(result[i].body);
                    Array.prototype.push.apply(repositories, list);
                }
                resolve(repositories);
            }).catch((error) => {
                reject(new errors.BaseError("Failed to get repository list."));
            });
        })
    }

    private requestGet(option: request.Options): Promise<RequestResult> {
        return new Promise<RequestResult>((resolve, reject) => {
            request.get(option, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({body: body, response: response});
                }
            });
        });
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
        if (this.authData) {
            option.auth = this.authData;
        }
        return option;
    }

    private createPageUrls(linkText: string): string[] {
        // https://developer.github.com/guides/traversing-with-pagination/
        var totalPageNum = 0;
        var lastUrl: string = null;
        var splited = linkText.split(",");
        for (var i = 0; i < splited.length; i++) {
            var lr = splited[i].replace(/\s+/g, "").split(";"); // ["<link>", "rel="\"last\""]
            var url = lr[0].substring(1, lr[0].length - 1);
            var rel = /rel=\"(.+)\"/.exec(lr[1])[1];
            if (rel === "last") {
                var parsed = /page=(\d+)/.exec(url); // ["page=20", 20]
                totalPageNum = Number(parsed[1]);
                lastUrl = url;
                break;
            }
        }
        if (!lastUrl) {
            return null;
        }
        var result: string[] = [];
        for (var i = 1; i <= totalPageNum; i++) {
            result.push(lastUrl.replace(`page=${totalPageNum}`, `page=${i}`));
        }
        return result;
    }

    private createRepositorytList(body: any): GitRepository[] {
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
