import {Command, flags} from '@oclif/command'
import ux from 'cli-ux'
import * as _ from 'lodash'

type Dictionary = {[index: string]: object}
export default class Commands extends Command {
  static description = 'list all the commands'

  static flags = {
    help: flags.help({char: 'h'}),
    json: flags.boolean({char: 'j', description: 'show detailed command information in json format'}),
    hidden: flags.boolean({description: 'show hidden commands'}),
    verbose: flags.boolean({
      description: 'include extended command information; must be used with --json',
      dependsOn: ['json'],
    }),
    topic: flags.string({description: 'filter on topic'}),
    plugin: flags.string({description: 'filter on plugin'}),
    command: flags.string({description: 'filter on command name with a regular expression'}),
  }

  async run() {
    const {flags} = this.parse(Commands)
    let commands = this.getCommands()
    if (!flags.hidden) {
      commands = commands.filter(c => !c.hidden)
    }

    commands = _.sortBy(commands, 'id')

    if (flags.topic) {
      commands = _.filter(commands, command => command.id.startsWith(`${flags.topic}:`))
    }

    if (flags.plugin) {
      commands = _.filter(commands, command => command.pluginName === flags.plugin)
    }

    if (flags.command) {
      commands = _.filter(commands, command => new RegExp(flags.command || '').test(command.id))
    }

    if (flags.json) {
      if (flags.verbose) {
        ux.styledJSON(commands.map(cmd => {
          let commandClass = cmd.load()
          const obj = Object.assign({}, cmd, commandClass)

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
      } else {
        ux.styledJSON(commands)
      }
    } else {
      for (const c of commands) {
        this.log(c.id)
      }
    }
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
