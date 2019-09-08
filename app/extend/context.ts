import { Context } from 'egg'
export default {
  get openId(this: Context) {
    if (this.headers['header-key']) {
      return this.headers['header-key']
    }
    return null
  }
}
