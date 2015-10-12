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
});
