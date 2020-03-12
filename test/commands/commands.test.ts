import {expect, test} from '@oclif/test'
import {Command} from '@oclif/command'
import Commands from '../../src/commands/commands'

abstract class TestCommand extends Command {
  public static testCustomProperty = 'test'
}

const obj: {[index: string]: {}} = {}
obj.circular = obj

class AnotherTestCommand extends TestCommand {
  public static circularObj = obj

  public static anotherCustomProperty = [5, obj]

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
}, {
  id: 'hidden',
  hidden: true,
}]

describe('commands', () => {
  test
  .stdout()
  .command(['commands'])
  .it('runs commands', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'Command  Description                    \n' +
      'commands list all the commands          \n' +
      'help     display help for oclif-example \n',
    )
  })

  test
  .stdout()
  .command(['commands', '-j'])
  .it('runs commands -j', (ctx: { stdout: string }) => {
    expect(JSON.parse(ctx.stdout)[0].id).to.equal('commands')
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--hidden'])
  .it('runs commands --hidden', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'Command                       Description                     \n' +
      'anothertopic:subtopic:command another super good test command \n' +
      'hidden                                                        \n' +
      'topic:subtopic:command        super good test command         \n',
    )
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--filter=Command=^topic'])
  .it('runs commands --filter="Command=^topic"', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'Command                Description             \n' +
      'topic:subtopic:command super good test command \n',
    )
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--filter=Plugin=anothertest'])
  .it('runs commands --filter="Plugin=anothertest"', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'Command                       Description                     \n' +
      'anothertopic:subtopic:command another super good test command \n',
    )
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--filter=Command=anothertopic:subtopic:command'])
  .it('runs commands --filter="Command=anothertopic:subtopic:command"', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'Command                       Description                     \n' +
      'anothertopic:subtopic:command another super good test command \n',
    )
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--columns=Command', '--no-header'])
  .it('runs commands --filter=Command=', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'anothertopic:subtopic:command \n' +
      'topic:subtopic:command        \n',
    )
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--filter=Command=subtopic:command'])
  .it('runs commands --filter"=Command=subtopic:command"', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'Command                       Description                     \n' +
      'anothertopic:subtopic:command another super good test command \n' +
      'topic:subtopic:command        super good test command         \n',
    )
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--filter=Command=^topic:subtopic:command'])
  .it('runs commands --filter"=Command=^topic:subtopic:command"', (ctx: { stdout: any }) => {
    expect(ctx.stdout).to.equal(
      'Command                Description             \n' +
      'topic:subtopic:command super good test command \n',
    )
  })

  test
  .stub(Commands.prototype, 'getCommands', () => commandList)
  .stdout()
  .command(['commands', '--verbose', '--json'])
  .it('runs commands --verbose --json', (ctx: { stdout: string }) => {
    const commands = JSON.parse(ctx.stdout)
    expect(commands[0].id).to.equal('anothertopic:subtopic:command')
    expect(commands[0].testCustomProperty).to.equal('test')
    expect(commands[0].anotherCustomProperty[0]).to.equal(5)
    expect(commands[0].anotherCustomProperty[1]).to.equal(null)
    expect(commands[0].circularObj.circular).to.equal(undefined)
    expect(commands[1].id).to.equal('topic:subtopic:command')
    expect(commands[1].testCustomProperty).to.equal('test')
    expect(commands[1].anotherCustomProperty).to.equal(undefined)
  })
})
