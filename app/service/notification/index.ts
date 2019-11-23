import BaseService from '../Base'
import {
  NotificationModal,
  UserNotifyModal,
  CreateNotifyProp,
  NotificationType,
  ActionType,
  UserNotify,
  Notification,
  DeleteUnReadNotifyProp
} from '../../model/notification/Notification'

import { UserInfoModel, UserInfo } from '../../model/user/UserInfo'
import { ActionResponseModel } from '../../model/BaseModel'
import { SUCCESS, ERROR } from '../../constants/Code'
import { IdeaModel } from '../../model/question/Idea'
import AttentionUser, {
  AttentionUserModel
} from '../../model/attention-user/AttentionUser'
import { QuestionModel } from '../../model/question/Question'

export default class NotificationService extends BaseService {
  public async createNotify({
    sid,
    tid,
    targetId,
    actionType,
    content
  }: CreateNotifyProp): Promise<ActionResponseModel> {
    const notification = new NotificationModal()

    const sendUser = await UserInfoModel.findById(sid)
    const receiveUser = await UserInfoModel.findById(tid)

    if (!sendUser || !receiveUser) {
      this.error('用户不存在')
    }
    notification.sendUser = sendUser!
    notification.receiveUser = receiveUser!

    notification.content = content
    notification.actionType = actionType
    notification.notificationType = NotificationType.Message
    notification.target = targetId

    const userNofity = new UserNotifyModal()
    userNofity.isRead = false
    userNofity.sourceNotify = notification
    userNofity.user = receiveUser!
    switch (actionType) {
      case ActionType.FollowUserInfo:
        notification.targetUser = sendUser!
        break
      case ActionType.Idea:
        const question = await QuestionModel.findById(targetId)
          // .populate('userinfo')
          .exec()
        if (!question) {
          this.error('question 不存在')
        }
        notification.targetQuestion = question!

        break
      case ActionType.ReplyIdea:
        const idea = await IdeaModel.findById(targetId).exec()
        if (!idea) {
          this.error('idea 不存在')
        }
        notification.targetIdea = idea!
        break
      default:
        this.error('action type not defined')
        break
    }

    await notification.save()
    await userNofity.save()

    return {
      msg: '创建成功',
      code: SUCCESS,
      data: notification._id
    }
  }

  public async getUserNotify(uid: string) {
    const userNotifys = await UserNotifyModal.find({
      user: uid
    })
      .populate('user')
      .populate({
        path: 'sourceNotify',
        populate: [
          {
            path: 'sendUser'
          },
          {
            path: 'targetUser'
          },
          {
            path: 'targetQuestion'
          },
          {
            path: 'targetIdea',
            populate: ['question']
          }
        ]
      })
      .sort({
        createAtDate: -1
      })
      .exec()
    const attentionUser = await AttentionUserModel.findOne({
      user: uid
    })
    UserNotifyModal.updateMany(
      {
        _id: {
          $in: userNotifys.map(item => item._id)
        }
      },
      {
        $set: {
          isRead: true
        }
      }
    ).exec()
    userNotifys.forEach((item: UserNotify) => {
      const sourceNotify = item.sourceNotify as Notification
      if (sourceNotify.actionType === ActionType.FollowUserInfo) {
        if (attentionUser) {
          const targetUser = sourceNotify.targetUser as UserInfo
          targetUser.isAttention =
            attentionUser.attentionUserList.find(
              id => String(id) === targetUser._id
            ) !== null
        } else {
          const targetUser = sourceNotify.targetUser as UserInfo
          targetUser.isAttention = false
        }
      }
    })
    return userNotifys
  }

  public async readNotify(
    uid: string,
    notifyId: string
  ): Promise<ActionResponseModel> {
    const userNofity = await UserNotifyModal.findOne({
      user: uid,
      _id: notifyId
    })
    if (userNofity) {
      await userNofity.updateOne({
        isRead: true
      })
    } else {
      this.error('参数异常')
    }
    return {
      code: SUCCESS,
      msg: '消息阅读成功',
      data: userNofity!._id
    }
  }

  public async deleteUnReadNotify({
    sid,
    tid,
    actionType,
    targetId,
    content
  }: DeleteUnReadNotifyProp): Promise<ActionResponseModel> {
    const res = await this.findNotify({
      tid,
      sid,
      targetId,
      actionType,
      content
    })
    if (res === null) {
      this.error('notification not find')
    }
    const { userNotify, notification } = res!

    if (userNotify!.isRead) {
      return {
        code: ERROR,
        msg: '信息已读'
      }
    } else {
      await Promise.all([userNotify!.remove(), notification!.remove()])
    }
    return {
      code: SUCCESS,
      msg: '删除成功'
    }
  }
  public async findNotify({
    tid,
    sid,
    targetId,
    actionType,
    content
  }: DeleteUnReadNotifyProp) {
    const notification = await NotificationModal.findOne({
      sendUser: sid,
      receiveUser: tid,
      actionType,
      target: targetId,
      content
    }).exec()
    if (!notification) {
      return null
    }
    const userNotify = await UserNotifyModal.findOne({
      sourceNotify: notification!._id
    }).exec()
    if (!userNotify) {
      return null
    }
    return {
      notification,
      userNotify
    }
  }
}
