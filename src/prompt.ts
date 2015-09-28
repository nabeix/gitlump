/// <reference path="../typings/tsd.d.ts" />

import * as promptly from "promptly";

import {AuthInfo} from "./interfaces";

export function auth(): Promise<AuthInfo> {
    return new Promise<AuthInfo>((resolve, reject) => {
        promptly.prompt("Name: ", (error, name) => {
            if (error) {
                reject(error);
            }
            promptly.password("Password: ", (error, password) => {
                resolve({username: name, password: password});
                if (error) {
                    reject(error);
                }
            });
        });
    });
}
