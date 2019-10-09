/**
 * https://github.com/lentoo/Ts-Egg-Mongoose-GraphQL
 *
 * @summary UserService 相关业务
 * @author lentoo <729533020@qq.com>
 *
 * Created at     : 2019-09-09 19:43:20
 * Last modified  : 2019-09-17 20:29:18
 */

import {
  UserInfoModel,
  UserInfo,
  PaginationUserResponse
} from '../model/user/UserInfo'
import { SortModel } from '../model/sort/Sort'
import BaseService from './Base'
import { ActionResponseModel } from '../model/BaseModel'
import { SUCCESS } from '../constants/Code'
import { PaginationProp } from '../model/Pagination'
import { AttentionUserModel } from '../model/attention-user/AttentionUser'
/**
 * UserInfo Service
 */
export default class UserInfoService extends BaseService {
  public async findUserByNickName(
    nickname: string,
    pagination: PaginationProp
  ) {
    const user = await this.getAuthUser()
    const { page, items } = await UserInfoModel.paginationQuery(
      {
        nickName: {
          $regex: nickname,
          $options: '$i'
        },
        _id: {
          $ne: user._id
        }
      },
      pagination.page,
      pagination.limit
    )
    const attentionUserList = await AttentionUserModel.find({
      user: user._id,
      attentionUser: {
        $in: items.map(item => item._id)
      }
    }).exec()
    items.forEach(item => {
      item.isAttention =
        attentionUserList.findIndex(
          u => String(u.attentionUser) === String(item._id)
        ) > -1
    })
    const response = new PaginationUserResponse()
    response.setData(page, items)
    return response
  }

  public async saveUserInfo(u: UserInfo) {
    let user
    try {
      user = await this.findUserByOpenId(u.openId!)
    } catch (error) {
      user = new UserInfoModel()
    }

    Object.assign(user, u)

    return await user.save()
  }

  public async findUserById(id: string) {
    const selfUser = await this.getAuthUser()
    const user = await UserInfoModel.findById(id, this.selectFields).exec()
    if (user) {
      // 当前用户是否关注了该用户
      const attention = await AttentionUserModel.findOne(
        {
          user: selfUser._id,
          attentionUser: user._id
        },
        {
          _id: 1
        }
      ).exec()
      user.isAttention = !!attention
      // 当前用户的粉丝数
      const aggregate = await AttentionUserModel.aggregate([
        {
          $match: {
            attentionUser: user._id
          }
        },
        {
          $group: {
            _id: '$_id',
            count: {
              $sum: 1
            }
          }
        }
      ]).exec()
      if (aggregate.length > 0) {
        user.fansCount = aggregate[0].count
      } else {
        user.fansCount = 0
      }
      console.log('aggregate', aggregate)
      // 当前用户关注的用户数
      user.attentionCount = await AttentionUserModel.find({
        user: user._id
      }).count()
    }
    return user
  }

  public async findUserByOpenId(openId: string) {
    const user = await UserInfoModel.findOne({ openId }).exec()
    if (!user) {
      this.error('用户不存在')
    }
    return user
  }
  public async getUserList(
    _id?: string,
    current: number = 1,
    limit: number = 10
  ) {
    let where = {}
    if (_id) {
      where = { openId: _id }
    }
    const { page, items } = await UserInfoModel.paginationQuery(
      where,
      current,
      limit
    )

    const response = new PaginationUserResponse()
    response.setData(page, items)
    return response
  }
  /**
   * @description 删除用户信息
   * @author lentoo
   * @date 2019-09-05
   * @param {string} id _id
   * @returns
   * @memberof UserInfoService
   */
  public async removeUserById(id: string) {
    const user = UserInfoModel.findById(id)
    if (!user) {
      throw this.error('用户不存在')
    }
    return await UserInfoModel.deleteOne({
      _id: id
    })
  }

  public async userLikeSort(sortId: string): Promise<ActionResponseModel> {
    const u = await this.ctx.currentUserInfo()
    const user = await UserInfoModel.isExist(u!.openId!)
    const sort = await SortModel.findById(sortId)
    if (sort) {
      if (user.isLikeSortBySortId(String(sort._id))) {
        this.error('该分类已关注')
      } else {
        user.likeSorts!.push(sort)
        sort.attentionNum! += 1
      }
      sort.save()
      await user.save()
    } else {
      this.error('分类不存在')
    }
    return {
      code: SUCCESS,
      msg: '关注成功',
      data: user._id
    }
  }

  public async userUnLikeSort(sortId: string): Promise<ActionResponseModel> {
    const u = await this.ctx.currentUserInfo()
    const user = await UserInfoModel.isExist(u!.openId!)
    const sort = await SortModel.findById(sortId)
    if (sort) {
      if (user.isLikeSortBySortId(String(sort._id))) {
        sort.attentionNum! -= 1
        if (user.likeSorts) {
          user.likeSorts.splice(
            user.likeSorts.findIndex(sid => String(sid) === String(sort._id)),
            1
          )
        }
      } else {
        this.error(`用户未关注该分类: ${sort.sortName}`)
      }
      sort.save()
      await user.save()
    } else {
      this.error('分类不存在')
    }
    return {
      code: SUCCESS,
      msg: '取消关注成功',
      data: user._id
    }
  }
  public async findLoginUserInfo() {
    const user = await this.getCurrentUser()
    const fields = await this.selectFields
    if (!user) {
      this.error('用户不存在')
    }
    const userinfo = await UserInfoModel.findById(user!._id, fields)
    if (userinfo) {
      userinfo.attentionCount = await AttentionUserModel.find({
        user: userinfo._id
      }).count()
      userinfo.fansCount = await AttentionUserModel.find({
        attentionUser: userinfo._id
      }).count()
    }
    return userinfo
  }
}
