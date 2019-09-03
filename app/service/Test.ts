import { Service } from 'egg'
/**
 * Test Service
 */
export default class Test extends Service {
  /**
   * sayHi to you
   * @param name - your name
   */
  public async sayHi(name: string) {
    // const user = new UserInfo()
    // user.nickName = 'nickName-' + Date.now()
    // await user.save()
    // const userlist = await this.ctx.model.UserInfo.find()
    // return userlist
  }
}
