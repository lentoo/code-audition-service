import { Service } from 'egg'
import { SortModel as Sort } from '../model/sort/Sort'
/**
 * Sort Service
 */
export default class SortService extends Service {
  /**
   * sayHi to you
   * @param name - your name
   */
  public async findSortList(name: string) {
    const { ctx } = this
    const sortList = await Sort.find({}).exec()
    // const user = new UserInfo()
    // user.nickName = 'nickName-' + Date.now()
    // await user.save()
    // const userlist = await this.ctx.model.UserInfo.find()
    // return userlist
    return sortList
  }
}
