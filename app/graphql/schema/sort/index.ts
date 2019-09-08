import {
  Resolver,
  Query,
  Ctx,
  InputType,
  Field,
  Mutation,
  Arg
} from 'type-graphql'
import { Sort, PaginationSortResponse } from '../../../model/sort/Sort'
import { Context } from 'egg'
@InputType({ description: '保存分类需要的参数' })
class SortProp {
  /**
   * @description id
   * @type {string}
   * @memberof SortProp
   */
  @Field({ nullable: true })
  _id?: string
  /**
   * @description 分类名称
   * @type {string}
   * @memberof ISort
   */
  @Field()
  sortName?: string
  /**
   * @description 图标地址
   * @type {string}
   * @memberof ISort
   */
  @Field()
  icon?: string
  /**
   * @description 关注人数
   * @type {number}
   * @memberof ISort
   */
  @Field({ nullable: true })
  attentionNum?: number
  /**
   * @description 题目数
   * @type {number}
   * @memberof ISort
   */
  @Field({ nullable: true })
  questionNum?: number
}
@Resolver()
export class SortResolver {
  @Query(type => PaginationSortResponse, {
    name: 'sorts',
    description: '查询分类列表'
  })
  async fetchSortList(
    @Ctx() ctx: Context,
    @Arg('name', { nullable: true, defaultValue: '' }) name: string,
    @Arg('page', { nullable: true, defaultValue: 1 }) page: number,
    @Arg('limit', { nullable: true, defaultValue: 10 }) limit: number
  ) {
    return ctx.service.sort.findSortList(name, page, limit)
  }

  @Query(type => PaginationSortResponse, {
    name: 'fetchSortListByUserSelect',
    description: '获取分类列表，并显示当前用户是否关注'
  })
  async fetchSortListByUserSelect(
    @Ctx() ctx: Context,
    @Arg('name', { nullable: true, defaultValue: '' }) name: string,
    @Arg('page', { nullable: true, defaultValue: 1 }) page: number,
    @Arg('limit', { nullable: true, defaultValue: 10 }) limit: number
  ) {
    return ctx.service.sort.fetchSortListByUserSelect(name, page, limit)
  }

  @Mutation(() => Sort, { name: 'saveSort', description: '保存分类' })
  async saveSort(@Ctx() ctx: Context, @Arg('sort') sort: SortProp) {
    const s = new Sort()
    Object.assign(s, sort)
    return ctx.service.sort.saveSortItem(s)
  }
}
