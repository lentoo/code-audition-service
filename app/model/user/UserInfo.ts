import { Application } from 'egg'

import { prop, pre } from 'typegoose'
import BaseModel from '../BaseModel'
import { ObjectType, Field, InputType } from 'type-graphql'

@pre('save', function(next) {
  console.log('UserInfo save')
  next()
})
@ObjectType()
export class UserInfo extends BaseModel {
  /**
   * @description 用户微信openid
   * @type {string}
   * @memberof UserInfo
   */
  @Field()
  @prop()
  openId?: string
  /**
   * @description 用户昵称
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  nickName?: string
  /**
   * @description 用户头像地址
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  avatarUrl?: string
  /**
   * @description 用户性别 1 -> 男 2 -> 女
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  gender?: string
  /**
   * @description 用户所在省
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  province?: string
  /**
   * @description 用户所在国家
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  country?: string
  /**
   * @description 用户所在城市
   * @type {string}
   * @memberof UserInfo
   */
  @prop()
  @Field()
  city?: string

  /**
   * @description 用户角色
   * @type {string}
   * @memberof UserInfo
   */
  @prop({ default: 'user' })
  @Field()
  role: string
}

const user = new UserInfo().getModelForClass(UserInfo)

export const UserInfoModel = user

export default (app: Application) => {
  return user
}
