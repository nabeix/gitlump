/// <reference path="../typings/tsd.d.ts" />

import program = require("commander");
import colors = require("ansicolors");
import {exec} from "child_process";
import utils = require("./utils");
import async = require("async");

var version = require("../package.json").version;

program
    .version(version);

program
    .command("create")
    .description("Create user or organization directory and initialize.");

program
    .command("init")
    .description("Initialize exisiting directory.");

program
    .command("clone")
    .description("Clone repositories.");

program
    .command("pull")
    .description("Pull repositories.")
    .action((cmd, option) => {
        console.log(cmd);
        console.log(option);
    });

program
    .command("exec")
    .description("Run git command.")
    .allowUnknownOption(true)
    .action((cmd, option) => {
        var index = process.argv.indexOf("exec");
        var opts = process.argv.slice(index + 1).join(" ");
        utils.gitDirectoryList().then((dirs) => {
            var cmd = `git ${opts}`;
            console.log(colors["red"](`Run ${cmd}`));
            async.each(dirs, (dirName, callback) => {
                exec(cmd, {cwd: dirName}, (error, stdout, stderr) => {
                    console.log(colors["red"](`>> ${dirName}`));
                    console.log(stdout);
                });
            });
        })
    });

program
    .parse(process.argv);
