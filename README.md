# @oclif/plugin-commands

plugin to show the list of all the commands

[![Version](https://img.shields.io/npm/v/@oclif/plugin-commands.svg)](https://npmjs.org/package/@oclif/plugin-commands)
[![Downloads/week](https://img.shields.io/npm/dw/@oclif/plugin-commands.svg)](https://npmjs.org/package/@oclif/plugin-commands)
[![License](https://img.shields.io/npm/l/@oclif/plugin-commands.svg)](https://github.com/oclif/plugin-commands/blob/main/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @oclif/plugin-commands
$ oclif-example COMMAND
running command...
$ oclif-example (--version)
@oclif/plugin-commands/2.1.0 linux-x64 node-v14.19.3
$ oclif-example --help [COMMAND]
USAGE
  $ oclif-example COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [@oclif/plugin-commands](#oclifplugin-commands)
- [Usage](#usage)
- [Commands](#commands)
  - [`oclif-example commands`](#oclif-example-commands)

## `oclif-example commands`

list all the commands

```
USAGE
  $ oclif-example commands [--json] [-h] [--hidden] [--tree] [--columns <value> | -x] [--sort <value>]
    [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -h, --help         Show CLI help.
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --hidden           show hidden commands
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)
  --tree             show tree of commands

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  list all the commands
```

_See code: [src/commands/commands.ts](https://github.com/oclif/plugin-commands/blob/v2.1.0/src/commands/commands.ts)_

<!-- commandsstop -->
