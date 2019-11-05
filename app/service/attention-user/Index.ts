import BaseService from '../Base'
import { ActionResponseModel } from '../../model/BaseModel'
import AttentionUser, {
  AttentionUserModel,
  PaginationAttentionUserResponse
} from '../../model/attention-user/AttentionUser'
import {
  UserInfoModel,
  UserInfo,
  PaginationUserResponse
} from '../../model/user/UserInfo'
import { SUCCESS, ERROR } from '../../constants/Code'
import { PaginationProp } from '../../model/Pagination'
import { InstanceType } from 'typegoose'

export default class AttentionUserService extends BaseService {
  public async attentionUserByUid(
    uid: string,
    id: string
  ): Promise<ActionResponseModel> {
    const user = await UserInfoModel.findById(uid)
    if (!user) {
      this.error('用户不存在')
    }
    return this.attentionUser(id, user!)
  }
  /**
   * @description 关注用户
   * @author lentoo
   * @date 2019-09-23
   * @param {string} id 用户id
   * @returns {Promise<ActionResponseModel>}
   * @memberof AttentionUserService
   */
  public async attentionUser(
    id: string,
    user: InstanceType<UserInfo>
  ): Promise<ActionResponseModel> {
    // const user = await this.getAuthUser()
    const targetUser = await UserInfoModel.findById(id)
    if (!targetUser) {
      this.error('目标用户不存在')
    }
    if (targetUser && String(targetUser._id) === String(user._id)) {
      this.error('不能关注自己')
    }
    const attentionUserRecord = await AttentionUserModel.findOne({
      user: user._id
    }).exec()
    if (attentionUserRecord) {
      const response = await attentionUserRecord.update({
        $addToSet: {
          attentionUserList: targetUser!._id
        }
      })
      if (response.ok) {
        if (response.nModified > 0) {
          await Promise.all([
            targetUser!.update({
              $inc: {
                fansCount: 1
              }
            }),
            user.update({
              $inc: {
                attentionCount: 1
              }
            })
          ])
        }
        return {
          code: SUCCESS,
          msg: '关注成功'
        }
      }
    } else {
      const record = new AttentionUserModel()

      record.user = user
      record.attentionUserList = [targetUser!]

      await Promise.all([
        targetUser!.update({
          $inc: {
            fansCount: 1
          }
        }),
        user.update({
          $inc: {
            attentionCount: 1
          }
        })
      ])
      await record.save()
    }
    return {
      code: SUCCESS,
      msg: '关注成功'
    }
  }
  /**
   * @description 取消关注用户
   * @author lentoo
   * @date 2019-09-23
   * @param {string} id 用户id
   * @returns {Promise<ActionResponseModel>}
   * @memberof AttentionUserService
   */
  public async unsubscribe(id: string): Promise<ActionResponseModel> {
    const user = await this.getAuthUser()
    const targetUser = await UserInfoModel.findById(id)
    if (!targetUser) {
      this.error('目标用户不存在')
    }
    const attentionUser = await AttentionUserModel.findOne({
      user: user._id
    }).exec()
    if (attentionUser) {
      const response = await attentionUser.update({
        $pull: {
          attentionUserList: targetUser!._id
        }
      })
      if (response.ok) {
        if (response.nModified > 0) {
          await Promise.all([
            targetUser!.updateOne({
              $inc: {
                fansCount: -1
              }
            }),
            user.update({
              $inc: {
                attentionCount: -1
              }
            })
          ])
        }
        return {
          code: SUCCESS,
          msg: '取消关注成功'
        }
      }
    }
    return {
      code: ERROR,
      msg: '操作失败'
    }
  }
  /**
   * @description 获取用户的关注用户列表
   * @author lentoo
   * @date 2019-09-23
   * @param {PaginationProp} pagination
   * @returns {Promise<PaginationAttentionUserResponse>}
   * @memberof AttentionUserService
   */
  public async attentionUserList(
    pagination: PaginationProp,
    user: InstanceType<UserInfo>
  ): Promise<PaginationUserResponse> {
    const userItemsFields = this.ctx.request.body.selectFields.items
    const loginUser = await this.getAuthUser()
    const fields = this.toProjection(userItemsFields)
    const [count, item] = await Promise.all([
      AttentionUserModel.findOne({
        user: user._id
      }).exec(),
      AttentionUserModel.findOne({
        user: user._id
      })
        .populate({
          path: 'attentionUserList',
          model: 'UserInfo',
          select: fields,
          options: {
            limit: pagination.limit,
            skip: (pagination.page - 1) * pagination.limit
          }
        })
        .exec()
    ])
    const total = count ? count.attentionUserList.length : 0
    const pages = Math.ceil(total / pagination.limit)
    const response = new PaginationUserResponse()
    const items = item ? (item.attentionUserList as UserInfo[]) : []
    if (String(loginUser._id) === String(user._id)) {
      items.forEach(u => {
        u.isAttention = true
      })
    } else {
      const loginUserFollowList = await AttentionUserModel.findOne({
        user: loginUser._id
      })
      if (loginUserFollowList) {
        items.forEach(u => {
          u.isAttention = loginUserFollowList.attentionUserList.some(
            id => String(u._id) === String(id)
          )
        })
      }
    }

    response.setData(
      {
        ...pagination,
        total,
        pages,
        hasMore: pages !== 0 && pagination.page !== pages
      },
      items
    )

    return response
  }

  public async getAttentionUserList(uid: string, pagination: PaginationProp) {
    const user = await UserInfoModel.findById(uid)
    if (user) {
      return this.attentionUserList(pagination, user)
    } else {
      this.error('用户不存在')
    }
  }

  public async attentionSelfUserList(
    page: PaginationProp = { page: 1, limit: 10 },
    user: InstanceType<UserInfo>
  ) {
    // const user = await this.getAuthUser()
    // 关注我的
    const {
      page: pagination,
      items
    } = await AttentionUserModel.paginationQuery(
      {
        attentionUserList: {
          $in: user._id
        }
      },
      page.page,
      page.limit,
      [
        {
          path: 'user',
          model: 'UserInfo'
        }
      ]
    )
    // 我关注的
    const loginUser = await this.getAuthUser()
    const attentions = await AttentionUserModel.findOne({
      user: loginUser._id,
      attentionUserList: {
        $in: items.map(item => {
          const user = item.user as UserInfo
          return user._id
        })
      }
    }).exec()
    if (attentions) {
      items.forEach(item => {
        const user = item.user as UserInfo
        user.isAttention = attentions.attentionUserList.some(
          a => String(a) === String(user._id)
        )
        return item
      })
    }
    const response = new PaginationAttentionUserResponse()
    response.setData(pagination, items)
    return response
  }

  public async getFansList(
    uid: string,
    page: PaginationProp = { page: 1, limit: 10 }
  ) {
    const user = await UserInfoModel.findById(uid)
    if (user) {
      return this.attentionSelfUserList(page, user)
    } else {
      this.error('用户不存在')
    }
  }
}
