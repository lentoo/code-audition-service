import { Application } from 'egg'
import BaseModel from '../BaseModel'
import { ObjectType, Field } from 'type-graphql'
import { prop, Ref, index, arrayProp } from 'typegoose'
import { UserInfo } from '../user/UserInfo'
import { PaginationResponseFactory } from '../Pagination'
import { Question } from '../question/Question'

@ObjectType()
@index('_id', { background: true })
@index('name', { background: true })
export class Collection extends BaseModel {
  @arrayProp({ itemsRef: Question, default: [] })
  @Field(type => [Question], { nullable: true })
  questions: Ref<Question>[]

  @Field()
  @prop()
  name: string
  /**
   * 是否是私密的
   */
  @Field({ description: '是否是私密的' })
  @prop({ default: false })
  isPrimary: boolean

  @prop({ ref: UserInfo })
  @Field(type => UserInfo)
  userinfo?: Ref<UserInfo>

  @prop({ default: 0 })
  @Field()
  questionNum: number

  @prop({ default: 0 })
  @Field()
  attentionNum: number

  @Field({ nullable: true })
  selected?: boolean
}
@ObjectType()
export class PaginationCollectionResponse extends PaginationResponseFactory(
  Collection
) {}
const collectionModel = new Collection().getModelForClass(Collection)
export const CollectionModel = collectionModel

export default (app: Application) => {
  return CollectionModel
}
