import BaseModel from '../BaseModel'
import { Ref, prop, arrayProp, index } from 'typegoose'
import { UserInfo } from '../user/UserInfo'
import { PaginationResponseFactory } from '../Pagination'
import { ObjectType, Field } from 'type-graphql'

/**
 * @description 用户关注Model
 * @author lentoo
 * @date 2019-09-23
 * @export
 * @class AttentionUser
 * @extends {BaseModel}
 */
@ObjectType()
@index('user', { background: true })
export default class AttentionUser extends BaseModel {
  /**
   * @description 当前用户
   * @type {Ref<UserInfo>}
   * @memberof AttentionUser
   */
  @prop({ ref: UserInfo })
  @Field(() => UserInfo, { nullable: true })
  user: Ref<UserInfo>
  /**
   * @description 关注的用户
   * @type {Ref<UserInfo>[]}
   * @memberof AttentionUser
   */
  @prop({ ref: UserInfo })
  @Field(() => UserInfo, { nullable: true })
  attentionUser: Ref<UserInfo>
}

const attentionUserModel = new AttentionUser().getModelForClass(AttentionUser)

export const AttentionUserModel = attentionUserModel

@ObjectType()
export class PaginationAttentionUserResponse extends PaginationResponseFactory(
  AttentionUser
) {}
