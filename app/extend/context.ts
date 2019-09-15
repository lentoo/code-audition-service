import { Context } from 'egg'
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

  get currentUserInfo(this: Context) {
    if (this.header.authorization) {
      return this.app.redis.get(this.header.authorization)
    } else {
      return null
    }
  }
}
