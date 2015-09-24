/// <reference path="../typings/tsd.d.ts" />
var program = require("commander");
var colors = require("ansicolors");
var child_process_1 = require("child_process");
var utils = require("./utils");
var async = require("async");
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
    .action(function (cmd, option) {
    console.log(cmd);
    console.log(option);
});
program
    .command("exec")
    .description("Run git command.")
    .allowUnknownOption(true)
    .action(function (cmd, option) {
    var index = process.argv.indexOf("exec");
    var opts = process.argv.slice(index + 1).join(" ");
    utils.gitDirectoryList().then(function (dirs) {
        var cmd = "git " + opts;
        console.log(colors["red"]("Run " + cmd));
        async.each(dirs, function (dirName, callback) {
            child_process_1.exec(cmd, { cwd: dirName }, function (error, stdout, stderr) {
                console.log(colors["red"](">> " + dirName));
                console.log(stdout);
            });
        });
    });
});
program
    .parse(process.argv);
