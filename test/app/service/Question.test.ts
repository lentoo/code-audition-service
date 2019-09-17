import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import { SUCCESS } from '../../../app/constants/Code'
describe('test/app/service/Question.test.js', () => {
  let ctx: Context
  let res
  let question
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Imxhbmd1YWdlIjoiemhfQ04iLCJyb2xlIjoiYWRtaW4iLCJsaWtlU29ydHMiOlsiNWQ2ZjdjNDMyZDA5MTg1NDAxOWZlM2E1Il0sIl9pZCI6IjVkNzRhYmIyNzg5YzkyODJlNjcxN2MzZiIsIm5pY2tOYW1lIjoibGVudG9vIiwiYXZhdGFyVXJsIjoiaHR0cHM6Ly93eC5xbG9nby5jbi9tbW9wZW4vdmlfMzIvcHFFRXRzaHRWRDMxbG90Z1ViaWNDaWJZQ3ZOWDBuMUcyem5RcnY5TThoT2RDOGtSTzFpYTlLREZwOXpIUVZFQ1hsN2xrZWVCMTBNaGZDTVkxa2VpYkllWUtnLzEzMiIsImdlbmRlciI6IjEiLCJwcm92aW5jZSI6Ikd1YW5nZG9uZyIsImNvdW50cnkiOiJDaGluYSIsImNpdHkiOiJKaWV5YW5nIiwib3BlbklkIjoib1oySmQ1UmRZZEVyVmozNks3ZER1dlhUbEdGUSIsInVwZGF0ZUF0RGF0ZSI6IjIwMTktMDktMDhUMTM6MzE6NDQuMjA1WiIsImNyZWF0ZUF0RGF0ZSI6IjIwMTktMDktMDhUMDc6MjA6MTguNzg2WiIsIl9fdiI6MX0sImlhdCI6MTU2ODYzNzI1NywiZXhwIjoxNTY4ODEwMDU3fQ.gsXuBTEgThclRpn0Er8r4AcGpA1z-Y1ZKBn3PaG_cLE`
  before(async () => {
    ctx = app.mockContext()
    ctx.header.authorization = token
    // ctx.headers['header-key'] = openId
    return app.ready()
  })

  it('test fetch question list', async () => {
    const { page, items } = await ctx.service.question.index.fetchQuestionList(
      1,
      10
    )

    assert(items.length > 0)
    assert(page.page === 1)
    assert(page.limit === 10)
  })

  it('test fetch question item', async () => {
    const { items } = await ctx.service.question.index.fetchQuestionList(1, 10)

    const item = await ctx.service.question.index.fetchQuestion(items[0]._id!)

    assert(item !== null)

    assert(item!._id.toString() === items[0]._id!.toString())
  })

  it('test add question ', async () => {
    const { items } = await ctx.service.sort.findSortList()
    const sortItem = items[0]!
    question = {}
    question.title = 'test add question'
    question.answerOfmarkdown = '# test'
    question.answerOfhtml = '<h1>test</h1>'
    res = await ctx.service.question.index.addQuestion(question, [
      sortItem._id!.toString()
    ])
    question._id = res.data!.toString()
    assert(res.data!.toString() !== '')
    assert(res.code === SUCCESS)
    // 测试重复添加题目
    try {
      await ctx.service.question.index.addQuestion(question, [
        sortItem._id!.toString()
      ])
    } catch (error) {
      assert(error.message === '该标题已存在')
    }

    // 测试分类下到题目数量是否增加
    const { items: sortItems } = await ctx.service.sort.findSortList()
    assert(sortItems.length > 0)
    assert(sortItem.questionNum! + 1 === sortItems[0]!.questionNum)
  })

  it('test update question item', async () => {
    question.title = 'test update question'
    await ctx.service.question.index.updateQuestion(question, question.sort)

    const item = await ctx.service.question.index.fetchQuestion(question._id!)

    assert(item!.title === question.title)
  })

  it('test review question item', async () => {
    await ctx.service.question.index.reviewQuestion(
      question._id,
      2000,
      '测试通过'
    )
    const item = await ctx.service.question.index.fetchQuestion(question._id)
    assert(item !== null)
    assert(item!.auditStatus === 2000)
  })

  it('test remove question item', async () => {
    const { items } = await ctx.service.sort.findSortList()
    const sortItem = items[0]!
    const { code } = await ctx.service.question.index.removeQuestion(
      question._id
    )
    assert(code === SUCCESS)
    // 测试分类下到题目数量是否减少
    const { items: sortItems } = await ctx.service.sort.findSortList()
    assert(sortItems.length > 0)
    assert(sortItem.questionNum! - 1 === sortItems[0]!.questionNum)
    try {
      await ctx.service.question.index.fetchQuestion(question._id)
    } catch (error) {
      assert(error.message === '题目不存在')
    }
  })
})
