import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import { Sort } from '../../../app/model/sort/Sort'

describe('test/app/service/Sort.test.js', () => {
  let ctx: Context
  const openId = '1234567'
  let s: any

  before(async () => {
    ctx = app.mockContext()
    ctx.headers['header-key'] = openId
    s = {}
    return app.ready()
  })

  it('fetchSortList', async () => {
    const sortList = await ctx.service.sort.findSortList()
    assert(Array.isArray(sortList), 'sortList is Array')
    assert(sortList.length > 0, 'sortList length $lt 0')
  })

  it('fetchSortList by name ', async () => {
    const sortList = await ctx.service.sort.findSortList('vue')
    assert(Array.isArray(sortList), 'sortList is Array')
    assert(sortList.length > 0, 'sortList length $lt 0')
    assert(sortList.every(item => item.sortName!.toLowerCase().includes('vue')))
  })

  it('添加 sort ', async () => {
    s.sortName = 'sortName'
    s.icon = 'icon'
    const sort = await ctx.service.sort.saveSortItem(s)
    s = sort
    assert(sort !== undefined)
  })

  it('Delete a non-existent sort', async () => {
    try {
      await ctx.service.sort.remoteSortItem('5d6f80618939276115e15bd7')
    } catch (error) {
      assert(error.message === '分类不存在')
    }
  })

  it('Delete a existent sort', async () => {
    const sort = ctx.service.sort.remoteSortItem(s._id)
    assert(sort !== undefined)
  })
})
