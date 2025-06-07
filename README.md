# @oclif/plugin-commands

plugin to show the list of all the commands

[![Version](https://img.shields.io/npm/v/@oclif/plugin-commands.svg)](https://npmjs.org/package/@oclif/plugin-commands)
[![Downloads/week](https://img.shields.io/npm/dw/@oclif/plugin-commands.svg)](https://npmjs.org/package/@oclif/plugin-commands)
[![License](https://img.shields.io/npm/l/@oclif/plugin-commands.svg)](https://github.com/oclif/plugin-commands/blob/main/package.json)

<!-- toc -->

- [@oclif/plugin-commands](#oclifplugin-commands)
- [Usage](#usage)
- [Commands](#commands)
- [Contributing](#contributing)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @oclif/plugin-commands
$ oclif-example COMMAND
running command...
$ oclif-example (--version)
@oclif/plugin-commands/4.1.26 linux-x64 node-v20.19.2
$ oclif-example --help [COMMAND]
USAGE
  $ oclif-example COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`oclif-example commands`](#oclif-example-commands)

## `oclif-example commands`

List all oclif-example commands.

```
USAGE
  $ oclif-example commands [--json] [-c id|plugin|summary|type... | --tree] [--deprecated] [-x | ] [--hidden]
    [--no-truncate | ] [--sort id|plugin|summary|type | ]

FLAGS
  -c, --columns=<option>...  Only show provided columns (comma-separated).
                             <options: id|plugin|summary|type>
  -x, --extended             Show extra columns.
      --deprecated           Show deprecated commands.
      --hidden               Show hidden commands.
      --no-truncate          Do not truncate output.
      --sort=<option>        [default: id] Property to sort by.
                             <options: id|plugin|summary|type>
      --tree                 Show tree of commands.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List all oclif-example commands.
```

_See code: [src/commands/commands.ts](https://github.com/oclif/plugin-commands/blob/4.1.26/src/commands/commands.ts)_

<!-- commandsstop -->

# Contributing

See [contributing guide](./CONRTIBUTING.md)
