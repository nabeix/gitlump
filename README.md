# gitlump [![Build Status](https://travis-ci.org/nabeix/gitlump.svg?branch=master)](https://travis-ci.org/nabeix/gitlump)

A command line tool to manage all repositories of GitHub user or organization.

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

This command asks you some of questions.
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
  "ignore": [],
  "cloned": []
}
```

* `endpoint` GitHub API Endpoint (default https://api.github.com/)
  * If use GitHub Enterprise: http(s)://hostname/api/v3/
* `auth` Authentication settings (default blank)
  * If the endpoint requires authentication: `"auth": {"token": "your token"}`
* `type` user|orgs
* `name` Github user or organization name
* `defaultProtocol` ssh|https|svn (default ssh)
* `repos` A list of repository specific settings (default blank)
  * `name` repository name
  * `protocol` used instead of `defaultProtocol`
  * `directory` clone directory name
* `ignore` A list of repository names to be ignored (default blank)
* `cloned` A list of cloned repository names (updated automatically by `gitlump clone`)

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

Almost all git commands are available after `gitlump exec`.

The followings are examples:

```
gitlump exec status
```

```
gitlump exec checkout master
```

```
gitlump exec commit -m "update"
```

## Contribution

1. Fork it ( http://github.com/nabeix/gitlump )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request

## License

MIT
