import {Command, Flags, toConfiguredId} from '@oclif/core'
import {printTable} from '@oclif/table'
import _ from 'lodash'
// @ts-expect-error because object-treeify does not have types: https://github.com/blackflux/object-treeify/issues/1077
import treeify from 'object-treeify'

type Dictionary = {[index: string]: object}

const COLUMNS = ['id', 'plugin', 'summary', 'type'] as const
type Column = (typeof COLUMNS)[number]

interface RecursiveTree {
  [key: string]: RecursiveTree | string
}

function createTree(commands: Command.Loadable[]): RecursiveTree {
  const tree: RecursiveTree = {}
  for (const command of commands) {
    const parts = command.id.split(':')
    let current = tree
    for (const part of parts) {
      current[part] = current[part] || {}
      current = current[part] as RecursiveTree
    }
  }

  return tree
}

export default class Commands extends Command {
  static description = 'List all <%= config.bin %> commands.'

  static enableJsonFlag = true

  static flags = {
    columns: Flags.custom<Column>({
      char: 'c',
      delimiter: ',',
      description: 'Only show provided columns (comma-separated).',
      exclusive: ['tree'],
      multiple: true,
      options: COLUMNS,
    })(),
    deprecated: Flags.boolean({description: 'Show deprecated commands.'}),
    extended: Flags.boolean({char: 'x', description: 'Show extra columns.', exclusive: ['tree']}),
    hidden: Flags.boolean({description: 'Show hidden commands.'}),
    'no-truncate': Flags.boolean({description: 'Do not truncate output.', exclusive: ['tree']}),
    sort: Flags.option({
      default: 'id',
      description: 'Property to sort by.',
      exclusive: ['tree'],
      options: COLUMNS,
    })(),
    tree: Flags.boolean({description: 'Show tree of commands.'}),
  }

  async run() {
    const {flags} = await this.parse(Commands)

    let commands = this.getCommands()

    if (!flags.hidden) {
      commands = commands.filter((c) => !c.hidden)
    }

    if (!flags.deprecated) {
      const deprecatedAliases = new Set(commands.filter((c) => c.deprecateAliases).flatMap((c) => c.aliases))
      commands = commands.filter((c) => c.state !== 'deprecated' && !deprecatedAliases.has(c.id))
    }

    const {config} = this
    commands = _.sortBy(commands, flags.sort).map((command) =>
      // Template supported fields.
      ({
        ...command,
        description:
          (typeof command.description === 'string' && _.template(command.description)({command, config})) || undefined,
        summary: (typeof command.summary === 'string' && _.template(command.summary)({command, config})) || undefined,
        usage: (typeof command.usage === 'string' && _.template(command.usage)({command, config})) || undefined,
      }),
    )

    if (flags.tree) {
      const tree = createTree(commands)
      this.log(treeify(tree))
    } else if (!this.jsonEnabled()) {
      printTable({
        borderStyle: 'headers-only-with-underline',
        columns: (flags.columns ?? ['id', 'summary', ...(flags.extended ? ['plugin', 'type'] : [])]) as Column[],
        data: commands.map((c) => ({
          id: toConfiguredId(c.id, config),
          plugin: c.pluginName,
          summary: c.summary ?? c.description,
          type: c.pluginType,
        })),
        headerOptions: {
          formatter: 'capitalCase',
        },
        overflow: flags['no-truncate'] ? 'wrap' : 'truncate',
        sort: {[flags.sort]: 'asc'},
      })
    }

    const json = _.uniqBy(
      await Promise.all(
        commands.map(async (cmd) => {
          let commandClass: Command.Class | undefined
          try {
            commandClass = await cmd.load()
          } catch (error) {
            this.debug(error)
          }

          const obj = {...cmd, ...commandClass}

          // Load all properties on all extending classes.
          while (commandClass !== undefined) {
            commandClass = Object.getPrototypeOf(commandClass) ?? undefined
            // ES2022 will return all unset static properties on the prototype as undefined. This is different from ES2021
            // which only returns the static properties that are set by defaults. In order to prevent
            // Object.assign from overwriting the properties on the object, we need to filter out the undefined values.
            Object.assign(
              obj,
              _.pickBy(commandClass, (v) => v !== undefined),
            )
          }

          // The plugin property on the loaded class contains a LOT of information including all the commands again. Remove it.
          delete obj.plugin

          // If Command classes have circular references, don't break the commands command.
          return this.removeCycles(obj)
        }),
      ),
      'id',
    )

    return json
  }

  private getCommands() {
    return this.config.commands
  }

  private removeCycles(object: unknown) {
    // Keep track of seen objects.
    const seenObjects = new WeakMap<Dictionary, undefined>()

    const _removeCycles = (obj: unknown) => {
      // Use object prototype to get around type and null checks
      if (Object.prototype.toString.call(obj) === '[object Object]') {
        // We know it is a "Dictionary" because of the conditional
        const dictionary = obj as Dictionary

        // Seen, return undefined to remove.
        if (seenObjects.has(dictionary)) return

        seenObjects.set(dictionary, undefined)

        for (const key in dictionary) {
          // Delete the duplicate object if cycle found.
          if (_removeCycles(dictionary[key]) === undefined) {
            delete dictionary[key]
          }
        }
      } else if (Array.isArray(obj)) {
        for (const i in obj) {
          if (_removeCycles(obj[i]) === undefined) {
            // We don't want to delete the array, but we can replace the element with null.
            obj[i] = null
          }
        }
      }

      return obj
    }

    return _removeCycles(object)
  }
}
