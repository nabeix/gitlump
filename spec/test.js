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
});
