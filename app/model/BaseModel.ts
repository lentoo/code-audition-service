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
  createAtDate?: Date
  @prop()
  @Field()
  updateAtDate?: Date

  @staticMethod
  static async paginationQuery<T>(
    this: ModelType<T>,
    where: any,
    page: number = 1,
    limit: number = 10
  ) {
    const flow = this.find(where)

    const count = await this.find(where).count()

    const items = await flow
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()
    console.log('item', items)

    console.log('count', count)
    const pages = Math.ceil(count / limit)

    return {
      page: {
        page,
        limit: limit,
        pages,
        hasMore: page !== pages
      },
      items
    }
  }
}
