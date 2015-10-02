# gitlump [![Build Status](https://travis-ci.org/nabeix/gitlump.svg?branch=master)](https://travis-ci.org/nabeix/gitlump)

A command line tool to manage all repositories of GitHub user or organization.

## Install

```
$ npm install -g gitlump
```

## Usage

### Initialize

#### User repositries

```
$ gitlump create user <name>
```

#### Origanization repositories

```
$ gitlump create org <name>
```

After command finished, gitlump creates new directory named GitHub user or organization name, and creates `.gitlump.json` file in the directory.

#### Use existing directory

```
$ cd your-directory
$ gitlump init <type> <name>
```

#### .gitlump.json

`.gitlump.json` is a config file of gitlump.

```
{
  "endpoint": "https://api.github.com/",
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
* `type` user|org
* `name` Github user or organization name
* `defaultProtocol` ssh|https (default ssh)
* `repos` A list of repository specific settings (default blank)
    * Example: `[{"name": "my-repo", "protocol": "https", "directory": "my-repo-directory"}]`
        * `name` repository name
        * `protocol` (optional) used instead of `defaultProtocol`
        * `directory` (optional) clone directory name
* `ignore` A list of repository names to be ignored (default blank)
* `cloned` A list of cloned repository names (updated automatically by `gitlump clone`)

### Clone

```
$ gitlump clone
```

`gitlump clone` automatically clones all repositories.


### Pull

```
$ gitlump pull
```

`gitlump pull` runs `git pull` command in all repository directories.

This is a shorthand of `gitlump exec pull`.


### Other Git commands

Almost all git commands are available after `gitlump exec`.

The followings are examples:

```
$ gitlump exec status
```

```
$ gitlump exec checkout master
```

```
$ gitlump exec commit -m "update"
```

## Contribution

1. Fork it ( http://github.com/nabeix/gitlump )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request

## License

MIT
