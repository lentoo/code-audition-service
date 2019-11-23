import BaseModel from '../BaseModel'
import { ObjectType, Field, registerEnumType, ArgsType } from 'type-graphql'
import { prop, Ref } from 'typegoose'
import { UserInfo } from '../user/UserInfo'
import { Question } from '../question/Question'
import { Idea } from '../question/Idea'

export enum NotificationType {
  /**
   * 普通通知
   */
  Message = '1',
  /**
   * 系统消息
   */
  System = '0'
}
export enum ActionType {
  /**
   * 关注用户
   */
  FollowUserInfo = '1',
  /**
   * 回复Idea
   */
  ReplyIdea = '2',
  /**
   * 写Idea
   */
  Idea = '3'
}
registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: '通知类型'
})
registerEnumType(ActionType, {
  name: 'ActionType',
  description: '目标类型'
})

@ObjectType()
export class Notification extends BaseModel {
  /**
   * @description 消息类型
   * @type {NotificationType}
   * @memberof Notification
   */
  @prop({ enum: NotificationType, required: true })
  @Field(type => NotificationType)
  notificationType: NotificationType

  /**
   * @description 目标 _id
   * @type {string}
   * @memberof Notification
   */
  @prop()
  @Field({ nullable: true })
  target?: string
  /**
   * @description 对题目进行评论
   * @type {Ref<Question>}
   * @memberof Notification
   */
  @prop({ ref: Question })
  @Field(type => Question, { nullable: true })
  targetQuestion?: Ref<Question>

  @prop({ ref: Idea })
  @Field(type => Idea, { nullable: true })
  targetIdea?: Ref<Idea>

  @prop({ ref: UserInfo })
  @Field(type => UserInfo, { nullable: true })
  targetUser?: Ref<UserInfo>

  /**
   * @description 行为类型
   * @type {ActionType}
   * @memberof Notification
   */
  @prop({ enum: ActionType })
  @Field(type => ActionType, { nullable: true })
  actionType?: ActionType
  /**
   * @description 目标用户
   * @type {Ref<UserInfo>}
   * @memberof Notification
   */
  @prop({ ref: UserInfo })
  @Field(type => UserInfo, { nullable: true })
  receiveUser?: Ref<UserInfo>
  /**
   * @description 通知来源用户
   * @type {Ref<UserInfo>}
   * @memberof Notification
   */
  @prop({ ref: UserInfo })
  @Field(type => UserInfo)
  sendUser?: Ref<UserInfo>
  /**
   * @description 内容
   * @type {string}
   * @memberof Notification
   */
  @prop({ required: true })
  @Field({ nullable: true })
  content: string
}

@ObjectType()
export class UserNotify extends BaseModel {
  /**
   * @description 已读
   * @type {boolean}
   * @memberof Notification
   */
  @prop({ default: false })
  @Field({ defaultValue: false })
  isRead: boolean

  /**
   * @description 通知来源用户
   * @type {Ref<UserInfo>}
   * @memberof Notification
   */
  @prop({ ref: UserInfo })
  @Field(type => UserInfo)
  user: Ref<UserInfo>
  /**
   * @description 关联的 Notification
   * @type {Ref<Notification>}
   * @memberof UserNotify
   */
  @prop({ ref: Notification })
  @Field(type => Notification)
  sourceNotify: Ref<Notification>
}
@ArgsType()
export class CreateNotifyProp {
  @Field()
  sid: string
  @Field()
  tid: string
  @Field()
  content: string
  @Field(type => ActionType)
  actionType: ActionType
  @Field()
  targetId: string
}
@ArgsType()
export class DeleteUnReadNotifyProp {
  @Field()
  sid: string
  @Field()
  tid: string
  @Field(type => ActionType)
  actionType: ActionType
  @Field()
  targetId: string
  @Field()
  content: string
}
const NotificationModal = new Notification().getModelForClass(Notification)
const UserNotifyModal = new UserNotify().getModelForClass(UserNotify)

export { NotificationModal, UserNotifyModal }
