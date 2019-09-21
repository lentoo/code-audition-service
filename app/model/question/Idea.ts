import { Application } from 'egg'
import BaseModel from '../BaseModel'
import { ObjectType, Field } from 'type-graphql'
import { prop, Ref, index } from 'typegoose'
import { UserInfo } from '../user/UserInfo'
import { Question } from './Question'
import { PaginationResponseFactory } from '../Pagination'

@ObjectType()
@index('question', { background: true })
export class Idea extends BaseModel {
  @prop({ ref: Question })
  @Field(type => Question, { nullable: true })
  question: Ref<Question>
  @Field()
  @prop()
  content: string
  @prop({ ref: UserInfo })
  @Field(type => UserInfo, { nullable: true })
  userinfo: Ref<UserInfo>
  @prop({ ref: Idea })
  @Field(type => Idea, { nullable: true })
  targetIdea?: Ref<Idea>
  /**
   * @description 目标用户
   * @type {string}
   * @memberof Idea
   */
  @prop({ ref: UserInfo })
  @Field(type => UserInfo, { nullable: true })
  targetUser?: Ref<UserInfo>
}
@ObjectType()
export class PaginationIdeaResponse extends PaginationResponseFactory(Idea) {}
const ideaModel = new Idea().getModelForClass(Idea)
export const IdeaModel = ideaModel

export default (app: Application) => {
  return IdeaModel
}
