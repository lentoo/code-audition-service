import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import { SUCCESS } from '../../../app/constants/Code'
import { token } from '../config'
describe('test/app/service/colleciton/Index.ts', () => {
  let ctx: Context
  let newId: string = ''
  before(() => {
    ctx = app.mockContext()
    ctx.headers['header-key'] = token
    return app.ready()
  })

  it('new collection', async () => {
    const response = await ctx.service.collection.index.addCollection(
      'new collection'
    )
    assert(response.code === SUCCESS)
    assert(response.data !== null)
    newId = String(response.data!)
  })

  it('update collection name', async () => {
    const response = await ctx.service.collection.index.updateCollection(
      newId,
      'update colleciton',
      true
    )
    assert(response.code === SUCCESS)

    const item = await ctx.service.collection.index.fetchCollectionItem(newId)

    assert(item.name === 'update colleciton')
  })

  it('collection question item', async () => {
    const { items } = await ctx.service.question.index.fetchQuestionList(1, 1)

    const { code } = await ctx.service.collection.index.collectionQuestion(
      String(items[0]._id!),
      newId
    )
    assert(code === SUCCESS)
  })

  it('collection remove question item', async () => {
    const { items } = await ctx.service.question.index.fetchQuestionList(1, 1)
    const {
      code
    } = await ctx.service.collection.index.removeQuestionByCollection(
      String(items[0]._id!),
      newId
    )
    assert(code === SUCCESS)
    const item = await await ctx.service.collection.index.fetchCollectionItem(
      newId
    )

    assert(
      item.questions.findIndex(q => String(q) === String(items[0]._id)) === -1
    )
  })

  it('remove collection item', async () => {
    const response = await ctx.service.collection.index.removeCollection(newId)
    assert(response.code === SUCCESS)
  })
})
