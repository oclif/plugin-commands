import {ux, Command, Flags, toConfiguredId} from '@oclif/core'
import * as _ from 'lodash'
import {EOL} from 'os'
import createCommandTree from '../utils/tree'

type Dictionary = {[index: string]: object}
export default class Commands extends Command {
  static description = 'list all the commands'

  static enableJsonFlag = true

  static flags = {
    help: Flags.help({char: 'h'}),
    hidden: Flags.boolean({description: 'show hidden commands'}),
    tree: Flags.boolean({description: 'show tree of commands'}),
    ...ux.table.flags(),
  }

  async run() {
    const {flags} = await this.parse(Commands)
    let commands = this.getCommands()
    if (!flags.hidden) {
      commands = commands.filter(c => !c.hidden)
    }

    const config = this.config
    commands = _.sortBy(commands, 'id').map(command => {
      // Template supported fields.
      command.description = (typeof command.description === 'string' && _.template(command.description)({command, config})) || undefined
      command.summary = (typeof command.summary === 'string' && _.template(command.summary)({command, config})) || undefined
      command.usage = (typeof command.usage === 'string' && _.template(command.usage)({command, config})) || undefined
      command.id = toConfiguredId(command.id, this.config)
      return command
    })

    if (this.jsonEnabled() && !flags.tree) {
      const formatted = await Promise.all(commands.map(async cmd => {
        // @ts-expect-error
        let commandClass: Command.Class = {}
        try {
          commandClass = await cmd.load()
        } catch (error) {
          this.debug(error)
        }

        const obj = {...cmd, ...commandClass}

        // Load all properties on all extending classes.
        while (commandClass !== undefined) {
          commandClass = Object.getPrototypeOf(commandClass) || undefined
          Object.assign(obj, commandClass)
        }

        // The plugin property on the loaded class contains a LOT of information including all the commands again. Remove it.
        delete obj.plugin

        // If Command classes have circular references, don't break the commands command.
        return this.removeCycles(obj)
      }))
      return _.uniqBy(formatted, 'id')
    }

    if (flags.tree) {
      const tree = createCommandTree(commands, this.config.topicSeparator)

      if (!this.jsonEnabled()) {
        tree.display()
      }

      return tree
    }

    ux.table(commands.map(command => {
      // Massage some fields so it looks good in the table
      command.description = (command.description || '').split(EOL)[0]
      command.summary = (command.summary || (command.description || '').split(EOL)[0])
      command.hidden = Boolean(command.hidden)
      command.usage = (command.usage || '')
      return command as unknown as Record<string, unknown>
    }), {
      id: {
        header: 'Command',
      },
      summary: {},
      description: {
        extended: true,
      },
      usage: {
        extended: true,
      },
      pluginName: {
        extended: true,
        header: 'Plugin',
      },
      pluginType: {
        extended: true,
        header: 'Type',
      },
      hidden: {
        extended: true,
      },
    }, {
      // to-do: investigate this oclif/core error when printLine is enabled
      // printLine: this.log,
      ...flags, // parsed flags
    })
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

        if (seenObjects.has(dictionary)) {
          // Seen, return undefined to remove.
          return undefined
        }

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
