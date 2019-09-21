import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  Authorized,
  UseMiddleware
} from 'type-graphql'
import { Context } from 'egg'
import {
  PaginationCollectionResponse,
  Collection
} from '../../../model/collection/Collection'
import { PaginationProp } from '../../../model/Pagination'
import { ActionResponseModel } from '../../../model/BaseModel'
import { RequestLogRecord } from '../../middleware'

@Resolver()
export class CollectionResolver {
  @Query(of => PaginationCollectionResponse, { description: '查询收藏集' })
  @Authorized()
  public async fetchCollection(
    @Ctx() ctx: Context,
    @Arg('page') page: PaginationProp,
    @Arg('questionId', { nullable: true }) questionId?: string
  ) {
    return await ctx.service.collection.index.fetchCollection(page, questionId)
  }

  @Query(of => Collection, { description: '查询某个收藏集' })
  @Authorized()
  public async fetchCollectionItem(@Ctx() ctx: Context, @Arg('id') id: string) {
    return await ctx.service.collection.index.fetchCollectionItem(id)
  }

  @Mutation(of => ActionResponseModel, { description: '添加收藏集' })
  @Authorized()
  @UseMiddleware(RequestLogRecord)
  public async addCollection(@Ctx() ctx: Context, @Arg('name') name: string) {
    return await ctx.service.collection.index.addCollection(name)
  }

  @Mutation(of => ActionResponseModel, { description: '修改收藏集' })
  @Authorized()
  @UseMiddleware(RequestLogRecord)
  public async updateCollection(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('name') name: string
  ) {
    return await ctx.service.collection.index.updateCollection(id, name)
  }

  @Mutation(of => ActionResponseModel, { description: '删除收藏集' })
  @Authorized()
  @UseMiddleware(RequestLogRecord)
  public async removeCollection(@Ctx() ctx: Context, @Arg('id') id: string) {
    return await ctx.service.collection.index.removeCollection(id)
  }

  @Mutation(of => ActionResponseModel, { description: '收藏题目' })
  @Authorized()
  @UseMiddleware(RequestLogRecord)
  public async collectionQuestion(
    @Ctx() ctx: Context,
    @Arg('qid') qid: string,
    @Arg('cid') cid: string
  ) {
    return await ctx.service.collection.index.collectionQuestion(qid, cid)
  }

  @Mutation(of => ActionResponseModel, {
    description: '从收藏集中删除某个题目'
  })
  @Authorized()
  @UseMiddleware(RequestLogRecord)
  public async removeQuestionByCollection(
    @Ctx() ctx: Context,
    @Arg('qid') qid: string,
    @Arg('cid') cid: string
  ) {
    return await ctx.service.collection.index.removeQuestionByCollection(
      qid,
      cid
    )
  }
}
