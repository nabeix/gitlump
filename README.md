# gitlump [![Build Status](https://travis-ci.org/nabeix/gitlump.svg?branch=master)](https://travis-ci.org/nabeix/gitlump)

A command line tool to manage all repositories of GitHub/Github Enterprise user or organization.

***This project is WIP.***

## Install

```
npm install -g gitlump
```

## Usage

### Initialize

#### Create new directory

```
gitlump create
```

This command ask you some of questions.
After finished, gitlump creates new directory named GitHub user or organization name, and creates `.gitlump.json` file in the directory.


#### Use existing directory

```
cd your-directory
gitlump init
```

#### .gitlump.json

`.gitlump.json` is a config file of gitlump.

```
{
  "endpoint": "https://api.github.com/",
  "auth": {},
  "type": "user",
  "name": "nabeix",
  "defaultProtocol": "ssh",
  "repos": [],
  "ignore": []
}
```

* `endpoint` GitHub API Endpoint (default https://api.github.com/)
  * If use GitHub Enterprise: http(s)://hostname/api/v3/
* `auth` Authentication settings (default blank)
  * If the endpoint requires authentication: `"auth": {"token": "your token"}`
* `type` [user|orgs]
* `name` Github user or organization name
* `defaultProtocol` [ssh|https|svn] (default ssh)
* `repos` A list of repository specific settings (default blank)
  * If use non-default protocol: `"repos": [{"name": "repo-name", "protocol": "https"}]`
* `ignore` A list of repository names to be ignored (default blank)

### Clone

```
gitlump clone
```

`gitlump clone` automatically clones all repositories.


### Pull

```
gitlump pull
```

`gitlump pull` runs `git pull` command in all repository directories.


### Other Git commands

All git commands are available after `gitlump -c`.

The followings are examples:

```
gitlump -c status
```

```
gitlump -c checkout master
```

```
gitlump -c commit -m "update"
```

## Contribution

1. Fork it ( http://github.com/nabeix/gitlump )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request

## License

MIT
