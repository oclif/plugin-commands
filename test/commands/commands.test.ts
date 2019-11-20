import {expect, test} from '@oclif/test'

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
})
