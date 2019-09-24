import { Service } from 'egg'
import { UserInfo, UserInfoModel } from '../model/user/UserInfo'

export default class BaseService extends Service {
  error(msg: string) {
    throw new Error(msg)
  }

  get selectFields(): SelectFields {
    const fields = {}
    if (this.ctx.request.body && this.ctx.request.body.selectFields) {
      console.log(
        'this.ctx.request.body.selectFields',
        this.ctx.request.body.selectFields
      )
      Object.keys(this.ctx.request.body.selectFields).forEach(key => {
        fields[key] = true
      })
    }
    return fields
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    return await this.ctx.currentUserInfo()
  }
  async getAuthUser() {
    const u = await this.getCurrentUser()
    const user = await UserInfoModel.findById(u!._id)
    if (!user) {
      this.error('用户不存在')
    }
    return user!
  }

  toProjection(obj) {
    const objFields = obj
    const fields = {}
    Object.keys(objFields).forEach(key => {
      fields[key] = true
    })
    return fields
  }
}

export interface SelectFields {
  [fieldName: string]: boolean
}
