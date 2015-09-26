/// <reference path="../typings/tsd.d.ts" />

import fs = require("fs");

import ConfigJson = require("./ConfigJson");

function createConfigJson(type: string, name: string): ConfigJson {
    if (type !== "user" && type !== "org") {
        console.log("error: type should be user or org.");
        return;
    }
    return {
        endpoint: "https://api.github.com/",
        auth: {},
        type: type,
        name: name,
        defaultProtocol: "ssh",
        repos: [],
        ignore: [],
        cloned: []
    }
}

// write .gitlump.json in current directory.
function writeConfigJson(path: string, json: ConfigJson, callback: (error: NodeJS.ErrnoException) => void) {
    fs.writeFile(path + "/.gitlump.json", JSON.stringify(json, null, "    "), callback);
}

// read .gitlump.json in current directory.
function readConfigJson(callback: (error: NodeJS.ErrnoException, json: ConfigJson) => void) {
    fs.readFile("./.gitlump.json", (error: NodeJS.ErrnoException, data: Buffer) => {
        callback(error, JSON.parse(data.toString()));
    });
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
                console.log(`error: directory ${name} already exists.`);
            } else {
                console.log(`error: faild to create directory ${name}.`);
            }
            return;
        }
        var json = createConfigJson(type, name);
        writeConfigJson(name, json, (error) => {
            if (error) {
                console.log("error: failed to create .gitlump.json.");
            }
        });
    });
}

// gitlump init
export function init(type: string, name: string): void {
    if (type !== "user" && type !== "org") {
        console.log("error: type should be \"user\" or \"org\".");
        return;
    }
    var json = createConfigJson(type, name);
    writeConfigJson(".", json, (error) => {
        if (error) {
            console.log("error: failed to create .gitlump.json.");
        }
    });
}

// gitlump clone
export function clone(): void {
    readConfigJson((error, json) => {
        if (error) {
            console.log("error: failed to read .gitlump.json.");
            return;
        }
        console.log(json);
    });
}

// gitlump exec
export function exec(command: string): void {

}
