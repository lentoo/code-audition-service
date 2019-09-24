import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import { token } from '../config'

describe('test/app/service/Sort.test.js', () => {
  let ctx: Context
  let s: any
  let pages = 0
  before(async () => {
    ctx = app.mockContext()
    ctx.headers['header-key'] = token
    s = {}
    return app.ready()
  })

  it('fetchSortList', async () => {
    const { items } = await ctx.service.sort.findSortList()
    assert(Array.isArray(items), 'sortList is Array')
    assert(items.length > 0, 'sortList length $lt 0')
  })

  it('fetchSortList By Pagination first page', async () => {
    const { page } = await ctx.service.sort.findSortList('', 1)
    pages = page.pages
    assert(page.page === 1, '测试第一页')
  })

  it('fetchSortList By Pagination last page', async () => {
    const { page } = await ctx.service.sort.findSortList('', pages)
    assert(page.page === pages)
    assert(page.hasMore === false)
  })

  it('fetchSortList by name ', async () => {
    const { items } = await ctx.service.sort.findSortList('vue')
    assert(Array.isArray(items), 'sortList is Array')
    assert(items.length > 0, 'sortList length $lt 0')
    assert(items.every(item => item.sortName!.toLowerCase().includes('vue')))
  })

  it('add sort ', async () => {
    s.sortName = 'sortName'
    s.icon = 'icon'
    const sort = await ctx.service.sort.saveSortItem(s)
    s = sort
    assert(sort !== undefined)
  })

  it('update sort ', async () => {
    s.sortName = 'sortName update'
    s.icon = 'icon update'
    const sort = await ctx.service.sort.saveSortItem(s)
    const { items } = await ctx.service.sort.findSortList(s.sortName)
    assert(items.length > 0)
    const _sort = items[0]
    assert(s.sortName === _sort.sortName)
    assert(s.icon === _sort.icon)
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
