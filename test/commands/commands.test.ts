import {expect, test} from '@oclif/test'
import {Command} from '@oclif/command'
import Commands from '../../src/commands/commands'

abstract class TestCommand extends Command {
  public static testCustomProperty = 'test'
}

class AnotherTestCommand extends TestCommand {
  public static anotherCustomProperty = 5

  public async run() {
    // Do nothing
  }
}

const commandList = [{
  id: 'topic:subtopic:command',
  description: 'super good test command',
  usage: 'topic:subtopic:command --json',
  pluginName: 'test',
  pluginType: 'core',
  aliases: [],
  flags: {},
  load: () => TestCommand,
}, {
  id: 'anothertopic:subtopic:command',
  description: 'another super good test command',
  usage: 'anothertopic:subtopic:command --json',
  pluginName: 'anothertest',
  pluginType: 'core',
  aliases: [],
  flags: {},
  load: () => AnotherTestCommand,
}]

describe('commands', () => {
  test
  .stdout()
  .command(['commands'])
  .it('runs commands', ctx => {
    expect(ctx.stdout).to.equal('commands\nhelp\n')
  })

  test
  .stdout()
  .command(['commands', '-j'])
  .it('runs commands -j', ctx => {
    expect(JSON.parse(ctx.stdout)[0].id).to.equal('commands')
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--topic', 'topic'])
  .it('runs commands --topic topic', ctx => {
    expect(ctx.stdout).to.equal('topic:subtopic:command\n')
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--plugin', 'anothertest'])
  .it('runs commands --plugin anothertest', ctx => {
    expect(ctx.stdout).to.equal('anothertopic:subtopic:command\n')
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--command', 'anothertopic:subtopic:command'])
  .it('runs commands --topic topic', ctx => {
    expect(ctx.stdout).to.equal('anothertopic:subtopic:command\n')
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--command', '.*:subtopic:command'])
  .it('runs commands --command .*:subtopic:command', ctx => {
    expect(ctx.stdout).to.equal('anothertopic:subtopic:command\ntopic:subtopic:command\n')
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--topic', 'topic', '--command', '.*:subtopic:command'])
  .it('runs commands --topic topic --command .*:subtopic:command', ctx => {
    expect(ctx.stdout).to.equal('topic:subtopic:command\n')
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--verbose', '--json'])
  .it('runs commands --verbose --json', ctx => {
    const commands = JSON.parse(ctx.stdout)
    expect(commands[0].id).to.equal('anothertopic:subtopic:command')
    expect(commands[0].testCustomProperty).to.equal('test')
    expect(commands[0].anotherCustomProperty).to.equal(5)
    expect(commands[1].id).to.equal('topic:subtopic:command')
    expect(commands[1].testCustomProperty).to.equal('test')
    expect(commands[1].anotherCustomProperty).to.equal(undefined)
  })
})
