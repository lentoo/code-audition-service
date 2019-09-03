import { Resolver, Query, Ctx } from 'type-graphql'
import { Sort } from '../../../model/sort/Sort'
import { Context } from 'egg'

@Resolver(of => Sort)
export class SortResolver {
  @Query(of => [Sort], { name: 'sorts', description: '查询分类列表' })
  async fetchSortList(@Ctx() ctx: Context) {
    return ctx.service.sort.findSortList('name')
  }
}
