var ConfigManager = require('../lib/ConfigManager').default;

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
    it("loadRomFile", function(done) {
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
    it("loadRomFile - error", function(done) {
        var m = new ConfigManager();
        m.loadFromFile("./spec/data/not-exists.json").then(function(config) {
            done.fail("should be catch error.");
        }).catch(function(error) {
            done();
        });;
    });
});
