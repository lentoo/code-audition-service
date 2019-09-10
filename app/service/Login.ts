/**
 * https://github.com/lentoo/Ts-Egg-Mongoose-GraphQL
 *
 *
 * @summary 登陆相关业务
 * @author lentoo <729533020@qq.com>
 *
 * Created at     : 2019-09-09 19:44:00
 * Last modified  : 2019-09-10 11:01:14
 */
import { ActionResponseModel } from '../model/BaseModel'
import {
  SUCCESS,
  ERROR,
  WAIT_LOGIN,
  ADMIN,
  CANCEL_LOGIN
} from '../constants/Code'
import { SocketManager } from '../io'
import BaseService from './Base'
import { UserInfoModel } from '../model/user/UserInfo'
const nanoid = require('nanoid')
export default class LoginService extends BaseService {
  /**
   * @description 扫码登陆
   * @author lentoo
   * @date 2019-09-09
   * @memberof LoginService
   */
  public async scanLogin(
    unicode: string,
    loginToken: string
  ): Promise<ActionResponseModel> {
    const { ctx, app } = this

    const openId = ctx.openId
    const user = await UserInfoModel.findOne({
      openId
    })
    if (!user) {
      return {
        code: ERROR,
        msg: '无效用户'
      }
    }

    const socketId = await app.redis.get(unicode)
    if (!socketId) {
      return {
        code: ERROR,
        msg: '登陆过期，请刷新重试'
      }
    }

    const _loginToken = await app.redis.get(socketId)

    if (user.role !== ADMIN) {
      return {
        code: ERROR,
        msg: '用户无权限登陆'
      }
    }
    if (_loginToken === loginToken) {
      const socket = SocketManager.getSocket(socketId)
      const token = nanoid(32)
      app.redis.set(openId, token, 'EX', 300)
      if (socket) {
        socket.send(JSON.stringify({ code: WAIT_LOGIN }))
      }

      return {
        code: SUCCESS,
        msg: '扫码成功',
        data: token
      }
    } else {
      return {
        code: ERROR,
        msg: '登陆过期，请刷新重试'
      }
    }
  }

  public async confirmLogin(
    unicode: string,
    token: string
  ): Promise<ActionResponseModel> {
    const { app, ctx } = this

    const loginFailResponse = {
      code: ERROR,
      msg: '登陆失败，请重试'
    }

    const socketId = await this.app.redis.get(unicode)
    if (!socketId) {
      return loginFailResponse
    }
    const socket = SocketManager.getSocket(socketId)

    if (!socket) {
      return loginFailResponse
    }
    const _token = await app.redis.get(ctx.openId)
    app.redis.del(ctx.openId)
    if (_token !== token) {
      return loginFailResponse
    }

    socket.send(
      JSON.stringify({
        code: 1,
        data: _token
      })
    )
    app.redis.del(unicode)

    return {
      code: SUCCESS,
      msg: '登陆成功'
    }
  }
  /**
   * @description 取消登陆
   * @author lentoo
   * @date 2019-09-09
   * @memberof LoginService
   */
  public async cancelLogin(unicode: string): Promise<ActionResponseModel> {
    const socketId = await this.app.redis.get(unicode)
    await this.app.redis.del(unicode)
    if (socketId) {
      this.app.redis.del(socketId, this.ctx.openId)
      const socket = SocketManager.getSocket(socketId)
      if (socket) {
        socket.send(JSON.stringify({ code: CANCEL_LOGIN }))
      }
    }
    return {
      code: SUCCESS,
      msg: '取消登陆'
    }
  }
}
