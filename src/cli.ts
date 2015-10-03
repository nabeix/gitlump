/// <reference path="../typings/tsd.d.ts" />

import program = require("commander");
import colors = require("ansicolors");
import {exec} from "child_process";
import async = require("async");

import utils = require("./utils");
import commands = require("./commands");

var version = require("../package.json").version;

program
    .version(version);

program
    .command("create <type> <name>")
    .description("Initialize with creating new directory.")
    .action((type, name) => {
        commands.create(type, name);
    });

program
    .command("init <type> <name>")
    .description("Initialize exisiting directory.")
    .action((type, name) => {
        commands.init(type, name)
    });

program
    .command("clone")
    .description("Clone repositories.")
    .action(() => {
        commands.clone();
    });

program
    .command("pull")
    .description("Pull repositories.")
    .action(() => {
        commands.pull();
    });

program
    .command("exec")
    .description("Run git command.")
    .allowUnknownOption(true)
    .action((cmd, option) => {
        var index = process.argv.indexOf("exec");
        var opts = process.argv.slice(index + 1).join(" ");
        commands.exec(opts);
    });

program
    .command("status")
    .description("Show status.")
    .allowUnknownOption(true)
    .action(() => {
        commands.status();
    });

program
    .parse(process.argv);
