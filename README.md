@oclif/plugin-commands
======================

plugin to show the list of all the commands

[![Version](https://img.shields.io/npm/v/@oclif/plugin-commands.svg)](https://npmjs.org/package/@oclif/plugin-commands)
[![CircleCI](https://circleci.com/gh/oclif/plugin-commands/tree/master.svg?style=shield)](https://circleci.com/gh/oclif/plugin-commands/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/oclif/plugin-commands?branch=master&svg=true)](https://ci.appveyor.com/project/oclif/plugin-commands/branch/master)
[![Codecov](https://codecov.io/gh/oclif/plugin-commands/branch/master/graph/badge.svg)](https://codecov.io/gh/oclif/plugin-commands)
[![Downloads/week](https://img.shields.io/npm/dw/@oclif/plugin-commands.svg)](https://npmjs.org/package/@oclif/plugin-commands)
[![License](https://img.shields.io/npm/l/@oclif/plugin-commands.svg)](https://github.com/oclif/plugin-commands/blob/master/package.json) [![Greenkeeper badge](https://badges.greenkeeper.io/oclif/plugin-commands.svg)](https://greenkeeper.io/)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @oclif/plugin-commands
$ oclif-example COMMAND
running command...
$ oclif-example (-v|--version|version)
@oclif/plugin-commands/0.0.0 darwin-x64 node-v10.2.1
$ oclif-example --help [COMMAND]
USAGE
  $ oclif-example COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`oclif-example hello [FILE]`](#oclif-example-hello-file)

## `oclif-example hello [FILE]`

describe the command here

```
USAGE
  $ oclif-example hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ oclif-example hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/oclif/plugin-commands/blob/v0.0.0/src/commands/hello.ts)_
<!-- commandsstop -->
