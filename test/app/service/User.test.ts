import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import { Sort } from '../../../app/model/sort/Sort'
import { token } from '../config'
import { SUCCESS } from '../../../app/constants/Code'

describe('test/app/service/User.test.js', () => {
  let openId = 'test client openid'

  let user
  let ctx: Context

  let sort: Sort
  let pages = 0

  before(async () => {
    user = {}
    ctx = app.mockContext()
    ctx.headers['header-key'] = token
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

  // it('test wxLogin', async () => {
  //   const { data: token } = await ctx.service.login.wxLogin(user)
  //   console.log('token', token)
  //   ctx.headers['header-key'] = token
  // })

  it('findUserByOpenId', async () => {
    const u = await ctx.service.userInfo.findUserByOpenId(user!.openId)
    assert(u !== undefined)
    assert(u!.openId === user!.openId)
    assert(u!.openId === user!.openId)
  })

  it('userLikeSort', async () => {
    const { items } = await ctx.service.sort.findSortList()
    assert(items.length > 0)
    sort = items[0]
    const result = await ctx.service.userInfo.userLikeSort(sort._id!)

    assert(result !== undefined)
  })

  it('userUnLikeSort', async () => {
    const result = await ctx.service.userInfo.userUnLikeSort(sort._id!)
    assert(result !== undefined)
  })
})
