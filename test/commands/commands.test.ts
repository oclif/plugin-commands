import {Command} from '@oclif/core'
import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import sinon from 'sinon'

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
  afterEach(() => {
    sinon.restore()
  })

  it('prints commands', async () => {
    const {stdout} = await runCommand(['commands'], {
      root: process.cwd(),
    })
    expect(stdout).to.include('commands list all the commands')
    expect(stdout).to.include('help     Display help for oclif-example.')
  })

  it('runs commands --hidden', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--hidden'])
    expect(stdout).to.match(getRegexForCommand(0))
    expect(stdout).to.match(getRegexForCommand(1))
    expect(stdout).to.not.match(getRegexForCommand(2))
    expect(stdout).to.match(getRegexForCommand(3))
    expect(stdout).to.match(getRegexForCommand(4))
  })

  it('runs commands --filter="Command=^topic"', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--filter=Command=^topic'])
    expect(stdout).to.match(getRegexForCommand(0))
    expect(stdout).not.to.match(getRegexForCommand(1))
    expect(stdout).to.not.match(getRegexForCommand(2))
    expect(stdout).to.match(getRegexForCommand(3))
    expect(stdout).to.not.match(getRegexForCommand(4))
  })

  it('runs commands --filter="Plugin=anothertest"', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--filter=Plugin=anothertest'])
    expect(stdout).to.not.match(getRegexForCommand(0))
    expect(stdout).to.match(getRegexForCommand(1))
    expect(stdout).to.not.match(getRegexForCommand(2))
    expect(stdout).to.not.match(getRegexForCommand(3))
    expect(stdout).to.not.match(getRegexForCommand(4))
  })

  it('runs commands --filter="Command=anothertopic:subtopic:command"', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--filter=Command=anothertopic:subtopic:command'])
    expect(stdout).to.not.match(getRegexForCommand(0))
    expect(stdout).to.match(getRegexForCommand(1))
    expect(stdout).to.not.match(getRegexForCommand(2))
    expect(stdout).to.not.match(getRegexForCommand(3))
    expect(stdout).to.not.match(getRegexForCommand(4))
  })

  it('runs commands --filter=Command=', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--columns=Command', '--no-header'])
    expect(stdout).to.match(/ anothertopic:subtopic:command\s+/)
    expect(stdout).to.match(/ topic:subtopic:command\s+/)
    expect(stdout).to.match(/ topic:subtopic:dep\s+/)
    expect(stdout).to.not.include('topic:subtopic:deprecated')
  })

  it('runs commands --filter"=Command=subtopic:command"', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--filter=Command=subtopic:command'])
    expect(stdout).to.equal(
      ' Command                       Summary                         \n' +
        ' ───────────────────────────── ─────────────────────────────── \n' +
        ' anothertopic:subtopic:command another super good test command \n' +
        ' topic:subtopic:command        super good test command         \n',
    )
  })

  it('runs commands --filter"=Command=^topic:subtopic:command"', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--filter=Command=^topic:subtopic:command'])
    expect(stdout).to.equal(
      ' Command                Summary                 \n' +
        ' ────────────────────── ─────────────────────── \n' +
        ' topic:subtopic:command super good test command \n',
    )
  })

  it('runs commands --json', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--json'])
    const commands = JSON.parse(stdout)
    expect(commands[0].id).to.equal('anothertopic:subtopic:command')
    expect(commands[0].testCustomProperty).to.equal('test')
    expect(commands[0].anotherCustomProperty[0]).to.equal(5)
    expect(commands[0].anotherCustomProperty[1]).to.deep.equal({foo: 'bar'})
    expect(commands[0]).to.not.have.property('circularObj')
    expect(commands[1].id).to.equal('topic:subtopic:command')
    expect(commands[1].testCustomProperty).to.equal('test')
    expect(commands[1].anotherCustomProperty).to.equal(undefined)
  })

  it('hides deprecated commands', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands'])
    expect(stdout).to.not.include('topic:subtopic:deprecated')
  })

  it('hides deprecated aliases', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands'])
    expect(stdout).to.not.include('topic:subtopic:deprecated-alias')
  })

  it('shows deprecated commands when asked', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {stdout} = await runCommand(['commands', '--deprecated'])
    expect(stdout).to.not.include('topic:subtopic:deprecated-alias')
    expect(stdout).to.match(getRegexForCommand(0))
    expect(stdout).to.match(getRegexForCommand(1))
    expect(stdout).to.match(getRegexForCommand(2))
    expect(stdout).to.match(getRegexForCommand(3))
    expect(stdout).to.not.match(getRegexForCommand(4))
  })
})
