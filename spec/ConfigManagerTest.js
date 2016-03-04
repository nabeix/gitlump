var fs = require("fs");
var mkdirp = require("mkdirp");
var ConfigManager = require('../lib/ConfigManager').default;
var errors = require("../lib/errors");

describe("ConfigManager", function() {
    var manager = null;
    beforeEach(function() {
        manager = new ConfigManager();
    });
    it("constructor", function() {
        expect(manager.config).toBe(undefined);
    });
    it("constructor with config", function() {
        var config = {foo: "foo"};
        var m = new ConfigManager(config);
        expect(m.config).toBe(config);
    });
    it("createConfig", function(done) {
        ConfigManager.createConfig("user", "myname").then(function(config) {
            expect(config).toEqual({
                endpoint: "https://api.github.com/",
                type: "user",
                name: "myname",
                defaultProtocol: "ssh",
                useAccessToken: false,
                repos: [],
                ignore: [],
                cloned: []
            });
            done();
        });
    });
    it("load", function() {
        var config = {foo: "foo"};
        var m = new ConfigManager();
        m.load(config);
        expect(m.config).toBe(config);
    });
    it("loadFromFile", function(done) {
        var m = new ConfigManager();
        m.loadFromFile("./spec/data/config1.json").then(function(config) {
            expect(config).toEqual({
                endpoint: "https://api.github.com/",
                type: "user",
                name: "test1",
                repos: [],
                ignore: [],
                cloned: []
            });
            done();
        });
    });
    it("loadFromFile - error", function(done) {
        var m = new ConfigManager();
        m.loadFromFile("./spec/data/not-exists.json").then(function(config) {
            done.fail("should be catch error.");
        }).catch(function(error) {
            expect(error instanceof errors.ReadFileError).toBe(true);
            done();
        });;
    });
    it("writeToFile", function(done) {
        mkdirp("./tmp", function(error) {
            if (error) {
                done.fail(error);
            }
            var file = "./tmp/writeToFileTest.json";
            fs.unlinkSync(file);
            var m = new ConfigManager();
            m.load({f: "foo", b: "bar"});
            m.writeToFile(file).then(function() {
                done();
            });
        });
    });
    it("writeToFile - error", function(done) {
        var m = new ConfigManager();
        m.load({f: "foo", b: "bar"});
        m.writeToFile("./not-exists-directory/writeToFileTest.json").then(function() {
            done.fail("should be catch error.");
        }).catch(function(error) {
            expect(error instanceof errors.WriteFileError).toBe(true);
            done();
        });
    });
    it("repositoryConfig", function() {
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
        expect(m.repositoryConfig("baz")).toBe(null);
        expect(m.repositoryConfig("foo")).toEqual({name: "foo", protocol: "prot", directory: "foodir"});
        expect(m.repositoryConfig("bar")).toEqual({name: "bar", directory: "bardir"});
    });
    it("ignored", function() {
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
        expect(m.ignored("foo")).toBe(true);
        expect(m.ignored("bar")).toBe(false);
    });
    it("cloned", function() {
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
        expect(m.cloned("foo")).toBe(true);
        expect(m.cloned("baz")).toBe(false);
    });
    it("clonedDirectories", function() {
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
        expect(m.clonedDirectories()).toEqual(["foodir", "bardir", "baz"]);
    });
    it("useAccessToken - false", function() {
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
        expect(m.accessToken()).toBe(null);
    });
    it("useAccessToken - true", function() {
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
        expect(m.accessToken()).toEqual("foo");
    });
    it("useAccessToken - custom", function() {
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
        expect(m.accessToken()).toEqual("mytoken");
    });
});
