import { SortModel, Sort, PaginationSortResponse } from '../model/sort/Sort'
import BaseService from './Base'
import { UserInfoModel } from '../model/user/UserInfo'
/**
 * Sort Service
 */
export default class SortService extends BaseService {
  /**
   * 查询所有分类列表，如果指定了名称，就模糊查询该名称的分类
   * @param name - your name
   */
  public async findSortList(
    name: string = '',
    current: number = 1,
    limit: number = 10
  ) {
    const { page, items } = await SortModel.paginationQuery(
      {
        sortName: {
          $regex: name,
          $options: '$i'
        }
      },
      current,
      limit
    )
    const response = new PaginationSortResponse()
    response.setData(page, items)
    return response
  }
  /**
   * @description 保存分类
   * @author lentoo
   * @date 2019-09-05
   * @param {Sort} sort
   * @returns
   * @memberof SortService
   */
  public async saveSortItem(sort: Sort) {
    let s = await SortModel.findOne({
      sortName: sort.sortName
    })
    if (s) {
      this.error(`该分类已存在 ${sort.sortName}`)
    }
    if (sort._id) {
      // 更新操作
      return await SortModel.findByIdAndUpdate(sort._id, {
        sortName: sort.sortName,
        icon: sort.icon
      })
    } else {
      // 添加操作
      s = new SortModel()

      Object.assign(s, sort)
      return await s.save()
    }
  }

  /**
   * @description 删除分类
   * @author lentoo
   * @date 2019-09-05
   * @param {string} sortId 分类id
   * @returns
   * @memberof SortService
   */
  public async remoteSortItem(sortId: string) {
    const sort = await SortModel.findById({
      _id: sortId
    }).exec()
    if (sort) {
      if (sort.questionNum) {
        this.error('当前分类还有题目，无法删除')
      }
      if (sort.attentionNum) {
        this.error('当前分类还有用户关注，无法删除')
      }
    } else {
      this.error('分类不存在')
    }
    const { ok, n } = await SortModel.deleteOne({
      _id: sortId
    })
    if (!ok) {
      this.error('删除失败，请重试')
    }
    return sortId
  }
  /**
   * @description 获取分类列表，并显示当前用户是否关注
   * @author lentoo
   * @date 2019-09-05
   * @memberof SortService
   */
  public async fetchSortListByUserSelect(
    name: string = '',
    current = 1,
    limit = 10
  ) {
    const user = await this.service.userInfo.findUserByOpenId(this.ctx.openId)
    if (user === null) {
      this.error('用户不存在')
      return
    }
    const response = await this.findSortList(name, current, limit)
    // 如果当前用户有关注分类
    if (user.likeSorts) {
      response.items.map(sort => {
        if (user.likeSorts!.find(s => String(s) === String(sort._id))) {
          sort.select = 1
        } else {
          sort.select = 0
        }
      })
    }
    return response
  }
}
