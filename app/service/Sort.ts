import { SortModel, Sort, PaginationSortResponse } from '../model/sort/Sort'
import BaseService from './Base'
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
    const flow = SortModel.find({
      sortName: {
        $regex: name,
        $options: '$i'
      }
    })
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

  public async saveSortItem(sort: Sort) {
    let s = await SortModel.findOne({
      sortName: sort.sortName
    })
    if (!s) {
      s = new SortModel()
    }
    Object.assign(s, sort)
    return await s.save()
  }

  public async remoteSortItem(sortId: string) {
    let s = await SortModel.findOne({
      _id: sortId
    }).exec()
    if (s) {
      return await s.remove()
    } else {
      this.error('分类不存在')
    }
  }
}
