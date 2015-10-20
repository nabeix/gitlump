var fs = require("fs");
var mkdirp = require("mkdirp");
var GitHubConnection = require('../lib/GitHubConnection').default;
var errors = require("../lib/errors");

describe("GitHubConnection", function() {
    var con = null;
    beforeEach(function() {
        con = new GitHubConnection("https://api.github.com/");
    });
    it("constructor", function() {
        expect(con.endpoint).toBe("https://api.github.com/");
        expect(con.authData).toBe(null);
    });
});
