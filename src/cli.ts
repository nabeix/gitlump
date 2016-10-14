import * as program from "commander";
import * as colors from "colors";
import {exec} from "child_process";

import * as utils from "./utils";
import * as commands from "./commands";

const version = require("../package.json").version;

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
        const index = process.argv.indexOf("exec");
        const opts = process.argv.slice(index + 1).join(" ");
        commands.exec(opts);
    });

program
    .command("ls")
    .description("Show cloned repositories.")
    .action(() => {
        commands.ls();
    });

program
    .command("ls-remote")
    .description("Show remote repositories.")
    .action(() => {
        commands.lsRemote();
    });

program
    .parse(process.argv);
