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
    hidden: true,
    id: 'hidden',
  },
]

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
      expect(ctx.stdout).to.equal(
        ' Command                       Summary                         \n' +
          ' ───────────────────────────── ─────────────────────────────── \n' +
          ' anothertopic:subtopic:command another super good test command \n' +
          ' hidden                                                        \n' +
          ' topic:subtopic:command        super good test command         \n',
      )
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Command=^topic'])
    .it('runs commands --filter="Command=^topic"', (ctx) => {
      expect(ctx.stdout).to.equal(
        ' Command                Summary                 \n' +
          ' ────────────────────── ─────────────────────── \n' +
          ' topic:subtopic:command super good test command \n',
      )
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Plugin=anothertest'])
    .it('runs commands --filter="Plugin=anothertest"', (ctx) => {
      expect(ctx.stdout).to.equal(
        ' Command                       Summary                         \n' +
          ' ───────────────────────────── ─────────────────────────────── \n' +
          ' anothertopic:subtopic:command another super good test command \n',
      )
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--filter=Command=anothertopic:subtopic:command'])
    .it('runs commands --filter="Command=anothertopic:subtopic:command"', (ctx) => {
      expect(ctx.stdout).to.equal(
        ' Command                       Summary                         \n' +
          ' ───────────────────────────── ─────────────────────────────── \n' +
          ' anothertopic:subtopic:command another super good test command \n',
      )
    })

  test
    .stub(Commands.prototype, 'getCommands', (stub) => stub.returns(commandList))
    .stdout()
    .command(['commands', '--columns=Command', '--no-header'])
    .it('runs commands --filter=Command=', (ctx) => {
      // eslint-disable-next-line no-useless-concat
      expect(ctx.stdout).to.equal(' anothertopic:subtopic:command \n' + ' topic:subtopic:command        \n')
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
})
