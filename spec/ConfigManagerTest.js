import test from "ava";
import * as fs from "fs";
import mkdirp from "mkdirp";
import ConfigManager from "../lib/ConfigManager";
import * as  errors from "../lib/errors";

test.beforeEach(t => {
    t.context.manager = new ConfigManager();
});

test("constructor", t => {
    var m = new ConfigManager();
    t.is(m.config, undefined);
});

test("constructor with config", t => {
    var config = {foo: "foo"};
    var m = new ConfigManager(config);
    t.deepEqual(m.config, config);
});

test("createConfig", async t => {
    const config = await ConfigManager.createConfig("user", "myname");
    t.deepEqual(config, {
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        useAccessToken: false,
        repos: [],
        ignore: [],
        cloned: []
    });
});

test("load", t => {
    var config = {foo: "foo"};
    var m = new ConfigManager();
    m.load(config);
    t.deepEqual(m.config, config);
});

test("loadFromFile", async t => {
    var m = new ConfigManager();
    const config = await m.loadFromFile("./spec/data/config1.json");
    t.deepEqual(config, {
        endpoint: "https://api.github.com/",
        type: "user",
        name: "test1",
        repos: [],
        ignore: [],
        cloned: []
    });
});

test("loadFromFile - error", async t => {
    var m = new ConfigManager();
    await t.throws(m.loadFromFile("./spec/data/not-exists.json"), errors.ReadFileError);
});

test("writeToFile", async t => {
    await new Promise((resolve, reject) => {
        mkdirp("./tmp", error => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
    var file = "./tmp/writeToFileTest.json";
    try {
        fs.unlinkSync(file);
    } catch (e) {
        // nothing to do
    }
    var m = new ConfigManager();
    m.load({f: "foo", b: "bar"});
    await t.notThrows(m.writeToFile(file));
});

test("writeToFile - error", async t => {
    var m = new ConfigManager();
    m.load({f: "foo", b: "bar"});
    await t.throws(m.writeToFile("./not-exists-directory/writeToFileTest.json"), errors.WriteFileError);
});

test("repositoryConfig", t => {
    var m = new ConfigManager();
    m.load({
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        repos: [{name: "foo", protocol: "prot", directory: "foodir"},
                {name: "bar", directory: "bardir"}],
        ignore: [],
        cloned: []
    });
    t.is(m.repositoryConfig("baz"), null);
    t.deepEqual(m.repositoryConfig("foo"), {name: "foo", protocol: "prot", directory: "foodir"});
    t.deepEqual(m.repositoryConfig("bar"), {name: "bar", directory: "bardir"});
});

test("ignored", t => {
    var m = new ConfigManager();
    m.load({
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        repos: [{name: "foo", protocol: "prot", directory: "foodir"},
                {name: "bar", directory: "bardir"}],
        ignore: ["foo"],
        cloned: []
    });
    t.is(m.ignored("foo"), true);
    t.is(m.ignored("bar"), false);
});

test("cloned", t => {
    var m = new ConfigManager();
    m.load({
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        repos: [],
        ignore: [],
        cloned: ["foo", "bar"]
    });
    t.is(m.cloned("foo"), true);
    t.is(m.cloned("baz"), false);
});

test("clonedDirectories", t => {
    var m = new ConfigManager();
    m.load({
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        repos: [{name: "foo", protocol: "prot", directory: "foodir"},
                {name: "bar", directory: "bardir"}],
        ignore: [],
        cloned: ["foo", "bar", "baz"]
    });
    t.deepEqual(m.clonedDirectories(), ["foodir", "bardir", "baz"]);
});

test("useAccessToken - false", t => {
    var m = new ConfigManager();
    m.load({
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        useAccessToken: false,
        repos: [{name: "foo", protocol: "prot", directory: "foodir"},
                {name: "bar", directory: "bardir"}],
        ignore: [],
        cloned: ["foo", "bar", "baz"]
    });
    process.env["GITLUMP_ACCESS_TOKEN"] = "foo";
    t.is(m.accessToken(), null);
});

test("useAccessToken - true", t => {
    var m = new ConfigManager();
    m.load({
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        useAccessToken: true,
        repos: [{name: "foo", protocol: "prot", directory: "foodir"},
                {name: "bar", directory: "bardir"}],
        ignore: [],
        cloned: ["foo", "bar", "baz"]
    });
    process.env["GITLUMP_ACCESS_TOKEN"] = "foo";
    t.is(m.accessToken(), "foo");
});

test("useAccessToken - custom", t => {
    var m = new ConfigManager();
    m.load({
        endpoint: "https://api.github.com/",
        type: "user",
        name: "myname",
        defaultProtocol: "ssh",
        useAccessToken: "MY_ACCESS_TOKEN",
        repos: [{name: "foo", protocol: "prot", directory: "foodir"},
                {name: "bar", directory: "bardir"}],
        ignore: [],
        cloned: ["foo", "bar", "baz"]
    });
    process.env["MY_ACCESS_TOKEN"] = "mytoken";
    process.env["GITLUMP_ACCESS_TOKEN"] = "foo";
    t.is(m.accessToken(), "mytoken");
});
