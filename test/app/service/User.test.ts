import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'

describe('test/app/service/User.test.js', () => {
  let ctx: Context
  let openId = ''
  let user: any = {}
  before(async () => {
    ctx = app.mockContext()
    openId = `unit test ${Date.now().toString()}`
    ctx.headers['header-key'] = openId
  })

  it('fetchUserList', async () => {
    const userList = await ctx.service.userInfo.getUserList()
    assert(userList !== undefined)
  })

  it('fetchUserList length > 0', async () => {
    const userList = await ctx.service.userInfo.getUserList()
    assert(userList.length > 0)
  })

  it('saveUserInfo', async () => {
    user.nickName = 'unit test nickName'
    user.openId = openId
    user.gender = 1
    const u = await ctx.service.userInfo.saveUserInfo(user)
    user = u
    assert(u._id !== undefined)
  })

  it('findUserByOpenId', async () => {
    const user = await ctx.service.userInfo.findUserByOpenId(openId)
    assert(user !== undefined)
    assert(user!.openId === openId)
    assert(user!.openId === openId)
  })

  it('userLikeSort', async () => {
    const result = await ctx.service.userInfo.userLikeSort(
      openId,
      '5d6f7c432d091854019fe3a5'
    )
    assert(result !== undefined)
  })

  it('userUnLikeSort', async () => {
    const result = await ctx.service.userInfo.userUnLikeSort(
      openId,
      '5d6f7c432d091854019fe3a5'
    )
    assert(result !== undefined)
  })

  it('Remove userinfo', async () => {
    const { ok, n } = await ctx.service.userInfo.removeUserById(user._id)
    assert.ok(ok)
    assert(n === 1)
  })
})
