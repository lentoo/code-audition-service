import { Resolver, Query, Ctx, Arg } from 'type-graphql'
import { Context } from 'egg'
import { PaginationIdeaResponse } from '../../../model/question/Idea'
import { PaginationProp } from '../../../model/Pagination'

@Resolver()
export class IdeaResolver {
  @Query(of => PaginationIdeaResponse)
  public async fetchIdea(
    @Ctx() ctx: Context,
    @Arg('id') id: string,
    @Arg('page', { nullable: true }) page: PaginationProp
  ) {
    return await ctx.service.question.idea.fetchIdeaByQuestionId(id, page)
  }
}
