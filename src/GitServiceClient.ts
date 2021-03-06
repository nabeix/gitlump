import * as request from "request";
import * as http from "http";

import {GitRepository} from "./interfaces";

import * as errors from "./errors";

interface RequestResult {
    body: any;
    response: http.IncomingMessage;
}

interface GitServiceClient {
    auth(user: string, password: string): void;
    getRepositories(type: string, name: string): Promise<GitRepository[]>;
}

export default class GitHubClient implements GitServiceClient {
    private endpoint: string;
    private accessToken: string;
    private authData: {user: string, pass: string};

    constructor(endpoint: string, accessToken: string = null) {
        this.endpoint = endpoint;
        this.accessToken = accessToken;
        this.authData = null;
    }

    auth(user: string, password: string): void {
        this.authData = {user: user, pass: password};
    }

    getRepositories(type: string, name: string): Promise<GitRepository[]> {
        return new Promise<GitRepository[]>((resolve, reject) => {
            let url: string = null;
            let repositories: GitRepository[] = null;
            if (type === "user") {
                url = this.requestURL(`users/${name}/repos`);
            } else if (type === "org") {
                url = this.requestURL(`orgs/${name}/repos`);
            } else {
                reject(new errors.InvalidTypeError("Type `${type}` is unknown."));
            }
            const option = this.createRequestOption(url);
            this.requestGet(option).then((result) => {
                repositories = this.createRepositorytList(result.body);
                if (result.response.statusCode === 200) {
                    const pageUrls = result.response.headers["link"] ? this.createPageUrls(result.response.headers["link"] as string) : null;
                    if (pageUrls && pageUrls.length > 1 ) {
                        const nextRequests: Promise<RequestResult>[] = [];
                        // NOTE: The first url is already done in the first this.requestGet().
                        for (let i = 1; i < pageUrls.length; i++) {
                            const opt = this.createRequestOption(pageUrls[i]);
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
                for (let i = 0; i < result.length; i++) {
                    const list = this.createRepositorytList(result[i].body);
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
        const option: request.Options = {
            url: url,
            json: true,
            headers: {
                "User-Agent": "request"
            }
        };
        if (additionalHeader) {
            for (let key in additionalHeader) {
                option.headers[key] = additionalHeader[key];
            }
        }
        if (this.authData) {
            option.auth = this.authData;
        }

        if (this.accessToken) {
            option.headers["Authorization"] = `token ${this.accessToken}`;
        }
        return option;
    }

    private createPageUrls(linkText: string): string[] {
        // https://developer.github.com/guides/traversing-with-pagination/
        let totalPageNum = 0;
        let lastUrl: string = null;
        const splited = linkText.split(",");
        for (let i = 0; i < splited.length; i++) {
            const lr = splited[i].replace(/\s+/g, "").split(";"); // ["<link>", "rel="\"last\""]
            const url = lr[0].substring(1, lr[0].length - 1);
            const rel = /rel=\"(.+)\"/.exec(lr[1])[1];
            if (rel === "last") {
                const parsed = /page=(\d+)/.exec(url); // ["page=20", 20]
                totalPageNum = Number(parsed[1]);
                lastUrl = url;
                break;
            }
        }
        if (!lastUrl) {
            return null;
        }
        const result: string[] = [];
        for (let i = 1; i <= totalPageNum; i++) {
            result.push(lastUrl.replace(`page=${totalPageNum}`, `page=${i}`));
        }
        return result;
    }

    private createRepositorytList(body: any): GitRepository[] {
        const result: GitRepository[] = [];
        for (let i = 0; i < body.length; i++) {
            const repo = body[i];
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
