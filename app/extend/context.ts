import { Context } from 'egg'
import { UserInfo } from '../model/user/UserInfo'
import * as jwt from 'jsonwebtoken'
export default {
  get openId(this: Context) {
    if (this.headers['header-key']) {
      return this.headers['header-key']
    }
    return null
  },
  get isPc(this: Context) {
    return !!this.header.authorization
  },
  get authorizationToken(this: Context) {
    let token = ''
    if (this.headers['header-key']) {
      token = this.headers['header-key']
    } else {
      token = this.header.authorization
    }
    return token
  },
  async currentUserInfo(this: Context): Promise<UserInfo | null> {
    let token = ''
    if (this.headers['header-key']) {
      token = this.headers['header-key']
    } else {
      token = this.header.authorization
    }
    const userStringify = await this.app.redis.get(token)
    if (userStringify) {
      return JSON.parse(userStringify)
    }
    return null
  }
}
