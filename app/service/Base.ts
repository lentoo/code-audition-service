import { Service } from 'egg'
import { UserInfo } from '../model/user/UserInfo'

export default class BaseService extends Service {
  error(msg: string) {
    throw new Error(msg)
  }

  get selectFields(): SelectFields {
    const fields = {}
    if (this.ctx.request.body && this.ctx.request.body.selectFields) {
      Object.keys(this.ctx.request.body.selectFields).forEach(key => {
        fields[key] = true
      })
    }
    return fields
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    const authorization = this.ctx.header.authorization
    let user
    const res = await this.app.redis.get(authorization)
    if (res) {
      user = JSON.parse(res)
    } else {
      return null
    }
    return user
  }
}

export interface SelectFields {
  [fieldName: string]: boolean
}
