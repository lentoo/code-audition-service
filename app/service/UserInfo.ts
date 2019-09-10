/**
 * https://github.com/lentoo/Ts-Egg-Mongoose-GraphQL
 *
 * @summary UserService 相关业务
 * @author lentoo <729533020@qq.com>
 *
 * Created at     : 2019-09-09 19:43:20
 * Last modified  : 2019-09-09 19:50:39
 */

import {
  UserInfoModel,
  UserInfo,
  PaginationUserResponse
} from '../model/user/UserInfo'
import { SortModel } from '../model/sort/Sort'
import BaseService from './Base'
/**
 * UserInfo Service
 */
export default class UserInfoService extends BaseService {
  /**
   * sayHi to you
   */
  public async saveUserInfo(u: UserInfo) {
    const headerKey = this.ctx.headers['header-key']
    let user
    try {
      user = await this.findUserByOpenId(headerKey)
    } catch (error) {
      user = new UserInfoModel()
    }

    Object.assign(user, u)

    user.openId = headerKey

    return await user.save()
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

  public async userLikeSort(openId: string, sortId: string) {
    const user = await UserInfoModel.isExist(openId)
    const sort = await SortModel.findById(sortId)
    if (sort) {
      if (user.isLikeSortBySortId(String(sort._id))) {
        this.error('该分类已关注')
      } else {
        user.likeSorts!.push(sort)
        sort.attentionNum! += 1
      }
      sort.save()
      return await user.save()
    } else {
      this.error('分类不存在')
    }
  }

  public async userUnLikeSort(openId: string, sortId: string) {
    const user = await UserInfoModel.isExist(openId)
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
      return await user.save()
    } else {
      this.error('分类不存在')
    }
  }
}
