import {Command} from '@oclif/core'
import {expect, test} from '@oclif/test'

import Commands from '../../src/commands/commands.js'

abstract class TestCommand extends Command {
  public static testCustomProperty = 'test'
}

const obj: {[index: string]: unknown} = {
  foo: 'bar',
}
obj.circular = obj

class AnotherTestCommand extends TestCommand {
  public static anotherCustomProperty = [5, obj]

  public static circularObj = obj

  public async run() {
    // Do nothing
  }
}

const commandList = [
  {
    aliases: [],
    description: 'super good test command',
    flags: {},
    id: 'topic:subtopic:command',
    load: () => TestCommand,
    pluginName: 'test',
    pluginType: 'core',
    usage: 'topic:subtopic:command --json',
  },
  {
    aliases: [],
    description: 'another super good test command',
    flags: {},
    id: 'anothertopic:subtopic:command',
    load: () => AnotherTestCommand,
    pluginName: 'anothertest',
    pluginType: 'core',
    usage: 'anothertopic:subtopic:command --json',
  },
  {
    aliases: [],
    description: 'a deprecated command',
    flags: {},
    id: 'topic:subtopic:deprecated',
    load: () => TestCommand,
    pluginName: 'depTest',
    pluginType: 'core',
    state: 'deprecated',
    usage: 'topic:subtopic:deprecated --json',
  },
  {
    aliases: ['topic:subtopic:deprecated-alias'],
    description: 'a command with a deprecated alias',
    flags: {},
    id: 'topic:subtopic:dep',
    load: () => TestCommand,
    pluginName: 'depTest',
    pluginType: 'core',
    usage: 'topic:subtopic:dep --json',
  },
  {
    hidden: true,
    id: 'hidden',
  },
]

// instead of hardcoding the table formatting with spaces, etc we match id, some amount of spaces, then description
const getRegexForCommand = (index: number): RegExp =>
  new RegExp(`${commandList[index].id}\\s+${commandList[index].description}`)

describe('commands', () => {
  test
    .loadConfig({root: process.cwd()})
    .stdout()
    .command(['commands'])
    .it('runs commands', (ctx) => {
      expect(ctx.stdout).to.include('commands list all the commands')
      expect(ctx.stdout).to.include('help     Display help for oclif-example.')
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--hidden'])
    .it('runs commands --hidden', (ctx) => {
      expect(ctx.stdout).to.match(getRegexForCommand(0))
      expect(ctx.stdout).to.match(getRegexForCommand(1))
      expect(ctx.stdout).to.not.match(getRegexForCommand(2))
      expect(ctx.stdout).to.match(getRegexForCommand(3))
      expect(ctx.stdout).to.match(getRegexForCommand(4))
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Command=^topic'])
    .it('runs commands --filter="Command=^topic"', (ctx) => {
      expect(ctx.stdout).to.match(getRegexForCommand(0))
      expect(ctx.stdout).not.to.match(getRegexForCommand(1))
      expect(ctx.stdout).to.not.match(getRegexForCommand(2))
      expect(ctx.stdout).to.match(getRegexForCommand(3))
      expect(ctx.stdout).to.not.match(getRegexForCommand(4))
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Plugin=anothertest'])
    .it('runs commands --filter="Plugin=anothertest"', (ctx) => {
      expect(ctx.stdout).to.not.match(getRegexForCommand(0))
      expect(ctx.stdout).to.match(getRegexForCommand(1))
      expect(ctx.stdout).to.not.match(getRegexForCommand(2))
      expect(ctx.stdout).to.not.match(getRegexForCommand(3))
      expect(ctx.stdout).to.not.match(getRegexForCommand(4))
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Command=anothertopic:subtopic:command'])
    .it('runs commands --filter="Command=anothertopic:subtopic:command"', (ctx) => {
      expect(ctx.stdout).to.not.match(getRegexForCommand(0))
      expect(ctx.stdout).to.match(getRegexForCommand(1))
      expect(ctx.stdout).to.not.match(getRegexForCommand(2))
      expect(ctx.stdout).to.not.match(getRegexForCommand(3))
      expect(ctx.stdout).to.not.match(getRegexForCommand(4))
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--columns=Command', '--no-header'])
    .it('runs commands --filter=Command=', (ctx) => {
      expect(ctx.stdout).to.match(/ anothertopic:subtopic:command\s+/)
      expect(ctx.stdout).to.match(/ topic:subtopic:command\s+/)
      expect(ctx.stdout).to.match(/ topic:subtopic:dep\s+/)
      expect(ctx.stdout).to.not.include('topic:subtopic:deprecated')
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Command=subtopic:command'])
    .it('runs commands --filter"=Command=subtopic:command"', (ctx) => {
      expect(ctx.stdout).to.equal(
        ' Command                       Summary                         \n' +
          ' ───────────────────────────── ─────────────────────────────── \n' +
          ' anothertopic:subtopic:command another super good test command \n' +
          ' topic:subtopic:command        super good test command         \n',
      )
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Command=^topic:subtopic:command'])
    .it('runs commands --filter"=Command=^topic:subtopic:command"', (ctx) => {
      expect(ctx.stdout).to.equal(
        ' Command                Summary                 \n' +
          ' ────────────────────── ─────────────────────── \n' +
          ' topic:subtopic:command super good test command \n',
      )
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--json'])
    .it('runs commands --json', (ctx: {stdout: string}) => {
      const commands = JSON.parse(ctx.stdout)
      expect(commands[0].id).to.equal('anothertopic:subtopic:command')
      expect(commands[0].testCustomProperty).to.equal('test')
      expect(commands[0].anotherCustomProperty[0]).to.equal(5)
      expect(commands[0].anotherCustomProperty[1]).to.deep.equal({foo: 'bar'})
      expect(commands[0]).to.not.have.property('circularObj')
      expect(commands[1].id).to.equal('topic:subtopic:command')
      expect(commands[1].testCustomProperty).to.equal('test')
      expect(commands[1].anotherCustomProperty).to.equal(undefined)
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands'])
    .it('hides deprecated commands', (ctx: {stdout: string}) => {
      expect(ctx.stdout).to.not.include('topic:subtopic:deprecated')
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands'])
    .it('hides deprecated aliases', (ctx: {stdout: string}) => {
      expect(ctx.stdout).to.not.include('topic:subtopic:deprecated-alias')
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--deprecated'])
    .it('shows deprecated commands when asked', (ctx: {stdout: string}) => {
      expect(ctx.stdout).to.match(getRegexForCommand(0))
      expect(ctx.stdout).to.match(getRegexForCommand(1))
      expect(ctx.stdout).to.match(getRegexForCommand(2))
      expect(ctx.stdout).to.match(getRegexForCommand(3))
      expect(ctx.stdout).to.not.match(getRegexForCommand(4))
    })
})
