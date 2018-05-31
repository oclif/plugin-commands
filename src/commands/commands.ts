import {Command, flags} from '@oclif/command'
import ux from 'cli-ux'
import * as _ from 'lodash'

export default class Commands extends Command {
  static description = 'list all the commands'

  static flags = {
    help: flags.help({char: 'h'}),
    json: flags.boolean({char: 'j', description: 'output in json format'}),
    hidden: flags.boolean({description: 'also show hidden commands'}),
  }

  async run() {
    const {flags} = this.parse(Commands)
    let commands = this.config.commands
    if (!flags.hidden) {
      commands = commands.filter(c => !c.hidden)
    }
    commands = _.sortBy(commands, 'id')
    if (flags.json) {
      ux.styledJSON(commands)
    } else {
      for (let c of commands) {
        this.log(c.id)
      }
    }
  }
}
