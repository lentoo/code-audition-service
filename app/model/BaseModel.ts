import { Typegoose, prop, pre, staticMethod, ModelType } from 'typegoose'
import { Field, ObjectType } from 'type-graphql'

@pre<BaseModel>('save', function(next) {
  if (!this.createAtDate || this.isNew) {
    this.createAtDate = this.updateAtDate = new Date()
  } else {
    this.updateAtDate = new Date()
  }
  next()
})
@ObjectType()
export default class BaseModel extends Typegoose {
  @Field()
  _id?: string
  @prop()
  @Field()
  createAtDate: Date
  @prop()
  @Field()
  updateAtDate: Date
  /**
   * @description 分页查询
   * @author lentoo
   * @date 2019-09-14
   * @static
   * @template T
   * @param {ModelType<T>} this
   * @param {*} where 查询条件
   * @param {number} [page=1] 当前页
   * @param {number} [limit=10] 页大小
   * @param {any[]} [populates=[]] 多表查询
   * @returns
   * @memberof BaseModel
   */
  @staticMethod
  static async paginationQuery<T>(
    this: ModelType<T>,
    where: any,
    page: number = 1,
    limit: number = 10,
    populates: any[] = [],
    options: any = {}
  ) {
    const count = await this.find(where).countDocuments()

    let flow = this.find(where)
    /**
     * Populate
     */
    if (populates.length > 0) {
      populates.map(populate => {
        flow.populate(populate)
      })
    }
    flow = flow.skip((page - 1) * limit).limit(limit)
    /**
     *  sort
     */
    if (options.sort) {
      flow.sort(options.sort)
    }
    const items = await flow.exec()
    const pages = Math.ceil(count / limit)

    return {
      page: {
        page,
        limit,
        pages,
        total: count,
        hasMore: pages !== 0 && page !== pages
      },
      items
    }
  }
}

@ObjectType()
export class ActionResponseModel {
  @Field()
  code: number
  @Field()
  msg: string
  @Field({ nullable: true })
  data?: string
}
