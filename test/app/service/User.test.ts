import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import { Sort } from '../../../app/model/sort/Sort'

describe('test/app/service/User.test.js', () => {
  let ctx: Context
  let openId = ''
  let user
  let sort: Sort
  let pages = 0
  before(async () => {
    user = {}
    ctx = app.mockContext()
    openId = `unit test ${Date.now().toString()}`
    ctx.headers['header-key'] = openId
  })

  it('fetchUserList', async () => {
    const { items } = await ctx.service.userInfo.getUserList()
    assert(items !== undefined)
  })

  it('fetchUserList length > 0', async () => {
    const { items } = await ctx.service.userInfo.getUserList()
    assert(items.length > 0)
  })

  it('getUserList By Pagination first page', async () => {
    const { page } = await ctx.service.userInfo.getUserList('', 1)
    pages = page.pages
    assert(page.page === 1, '测试第一页')
  })

  it('getUserList By Pagination last page', async () => {
    const { page } = await ctx.service.userInfo.getUserList('', pages)
    assert(page.page === pages)
    assert(page.hasMore === false)
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
    const { items } = await ctx.service.sort.findSortList()
    assert(items.length > 0)
    sort = items[0]
    const result = await ctx.service.userInfo.userLikeSort(
      openId,
      sort._id!
    )
    
    assert(result !== undefined)
  })

  it('userUnLikeSort', async () => {
    const result = await ctx.service.userInfo.userUnLikeSort(
      openId,
      sort._id!
    )
    assert(result !== undefined)
  })

  it('Remove userinfo', async () => {
    const { ok, n } = await ctx.service.userInfo.removeUserById(user._id)
    assert.ok(ok)
    assert(n === 1)
  })
})
