import { Service } from 'egg'
import { UserInfoModel, UserInfo } from '../model/user/UserInfo'
/**
 * UserInfo Service
 */
export default class UserInfoService extends Service {
  /**
   * sayHi to you
   */
  public async saveUserInfo(u: UserInfo) {
    const headerKey = this.ctx.headers['header-key']
    let user = await this.findUserByOpenId(headerKey)

    if (user) {
      Object.assign(user, u)
    } else {
      user = new UserInfoModel()
      Object.assign(user, u)
    }
    user.openId = headerKey
    // const {
    //   nickName,
    //   avatarUrl,
    //   gender,
    //   province,
    //   country,
    //   city
    // } = this.ctx.request.body
    return await user.save()
  }
  public async findUserByOpenId(openId: string) {
    const user = await UserInfoModel.findOne({ openId: openId })
    return user
  }
  public async getUserList(_id?: string) {
    let where = {}
    if (_id) {
      where = { openId: _id }
    }
    const list = await UserInfoModel.find(where).exec()
    return list
  }
}
