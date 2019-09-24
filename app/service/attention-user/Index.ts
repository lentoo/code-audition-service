import BaseService from '../Base'
import { ActionResponseModel } from '../../model/BaseModel'
import {
  AttentionUserModel,
  PaginationAttentionUserResponse
} from '../../model/attention-user/AttentionUser'
import { UserInfoModel, UserInfo } from '../../model/user/UserInfo'
import { SUCCESS, ERROR } from '../../constants/Code'
import { PaginationProp } from '../../model/Pagination'

export default class AttentionUserService extends BaseService {
  /**
   * @description 关注用户
   * @author lentoo
   * @date 2019-09-23
   * @param {string} id 用户id
   * @returns {Promise<ActionResponseModel>}
   * @memberof AttentionUserService
   */
  public async attentionUser(id: string): Promise<ActionResponseModel> {
    const user = await this.getAuthUser()
    const targetUser = await UserInfoModel.findById(id)
    if (!targetUser) {
      this.error('目标用户不存在')
    }
    if (targetUser && String(targetUser._id) === String(user._id)) {
      this.error('不能关注自己')
    }
    let attentionUser = await AttentionUserModel.findOne({
      user: user._id,
      attentionUser: targetUser!._id
    }).exec()

    if (!attentionUser) {
      attentionUser = new AttentionUserModel()
    } else {
      return {
        code: ERROR,
        msg: '当前用户已关注',
        data: attentionUser._id
      }
    }

    attentionUser.user = user

    attentionUser.attentionUser = targetUser!

    await Promise.all([targetUser!.save(), attentionUser.save()])

    return {
      code: SUCCESS,
      msg: '关注成功',
      data: attentionUser._id
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
      user: user._id,
      attentionUser: targetUser!._id
    }).exec()
    if (attentionUser) {
      await attentionUser.remove()

      return {
        code: SUCCESS,
        msg: '取消关注成功'
      }
    } else {
      return {
        code: ERROR,
        msg: '操作失败'
      }
    }
  }
  /**
   * @description 获取当前用户的关注用户列表
   * @author lentoo
   * @date 2019-09-23
   * @param {PaginationProp} pagination
   * @returns {Promise<PaginationAttentionUserResponse>}
   * @memberof AttentionUserService
   */
  public async attentionUserList(
    pagination: PaginationProp
  ): Promise<PaginationAttentionUserResponse> {
    const user = await this.getAuthUser()

    const userItemsFields = this.ctx.request.body.selectFields.items
      .attentionUser

    const fields = this.toProjection(userItemsFields)

    const { page, items } = await AttentionUserModel.paginationQuery(
      {
        user: user._id
      },
      pagination.page,
      pagination.limit,
      [
        {
          path: 'attentionUser',
          model: 'UserInfo',
          select: fields
        }
      ]
    )
    const response = new PaginationAttentionUserResponse()

    response.setData(page, items)

    return response
  }

  public async attentionSelfUserList(
    page: PaginationProp = { page: 1, limit: 10 }
  ) {
    const user = await this.getAuthUser()
    // 关注我的
    const {
      page: pagination,
      items
    } = await AttentionUserModel.paginationQuery(
      {
        attentionUser: user._id
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
    const attentions = await AttentionUserModel.find({
      user: user._id,
      attentionUser: {
        $in: items.map(item => {
          const user = item.user as UserInfo
          return user._id
        })
      }
    }).exec()
    console.log('attentions', attentions)
    console.log('items', items)
    items.forEach(item => {
      const user = item.user as UserInfo
      user.isAttention = attentions.some(
        a => String(a.attentionUser) === String(user._id)
      )
      return item
    })
    const response = new PaginationAttentionUserResponse()
    response.setData(pagination, items)
    return response
  }
}
