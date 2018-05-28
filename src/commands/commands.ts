import {Command, flags} from '@oclif/command'
import ux from 'cli-ux'

export default class Commands extends Command {
  static description = 'list all the commands'

  static flags = {
    help: flags.help({char: 'h'}),
    json: flags.boolean({char: 'j', description: 'output in json format'}),
  }

  async run() {
    const {flags} = this.parse(Commands)
    const commands = this.config.commands
    if (flags.json) {
      ux.styledJSON(commands)
    } else {
      for (let c of commands) {
        this.log(c.id)
      }
    }
  }
}
