import {Args, Command} from '@oclif/core'
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
  public static args = {
    arg1: Args.string(),
  }
  public static circularObj = obj
  public static enableJsonFlag = true

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

describe('commands', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('prints commands', async () => {
    const {stdout} = await runCommand(['commands'])
    // pro tip: don't assert the entire table output since the width of the table can differ between CI and local
    expect(stdout).include('Id')
    expect(stdout).include('Summary')
    expect(stdout).include('commands')
    expect(stdout).include('List all oclif-example commands.')
    expect(stdout).include('help')
    expect(stdout).include('Display help for oclif-example.')
  })

  it('runs commands --hidden', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {result} = await runCommand<Array<{id: string}>>(['commands', '--hidden'])
    expect(result?.map((c) => c.id)).to.include('hidden')
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
    expect(commands[0].args).to.have.property('arg1')
    expect(commands[0].enableJsonFlag).to.be.true
    expect(commands[0]).to.not.have.property('circularObj')
    expect(commands[1].id).to.equal('topic:subtopic:command')
    expect(commands[1].testCustomProperty).to.equal('test')
    expect(commands[1].anotherCustomProperty).to.equal(undefined)
  })

  it('hides deprecated commands', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {result} = await runCommand<Array<{id: string}>>(['commands'])
    expect(result?.map((c) => c.id)).to.not.include('topic:subtopic:deprecated')
  })

  it('hides deprecated aliases', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {result} = await runCommand<Array<{id: string}>>(['commands'])
    expect(result?.map((c) => c.id)).to.not.include('topic:subtopic:deprecated-alias')
  })

  it('shows deprecated commands when asked', async () => {
    // @ts-expect-error type mismatch
    sinon.stub(Commands.prototype, 'getCommands').returns(commandList)
    const {result} = await runCommand<Array<{id: string}>>(['commands', '--deprecated'])
    expect(result?.map((c) => c.id)).to.include('topic:subtopic:deprecated')
  })
})
