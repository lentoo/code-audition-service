import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import { SUCCESS } from '../../../app/constants/Code'
import { token } from '../config'
describe('test/app/service/attention-user/Index.ts', () => {
  let ctx: Context
  let newId: string = ''
  before(() => {
    ctx = app.mockContext()
    ctx.headers['header-key'] = token
    return app.ready()
  })

  it('attention-user', async () => {
    const { items } = await ctx.service.userInfo.getUserList()
    newId = String(items[0]._id)
    const { code } = await ctx.service.attentionUser.index.attentionUser(newId)

    assert(code === SUCCESS)
  })

  it('unsubscribe user', async () => {
    const { code } = await ctx.service.attentionUser.index.unsubscribe(newId)
    assert(code === SUCCESS)
  })
})
