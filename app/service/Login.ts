/**
 * https://github.com/lentoo/Ts-Egg-Mongoose-GraphQL
 *
 *
 * @summary 登陆相关业务
 * @author lentoo <729533020@qq.com>
 *
 * Created at     : 2019-09-09 19:44:00
 * Last modified  : 2019-09-18 09:45:03
 */
import * as jwt from 'jsonwebtoken'
import { ActionResponseModel } from '../model/BaseModel'
import {
  SUCCESS,
  ERROR,
  WAIT_LOGIN,
  ADMIN,
  CANCEL_LOGIN,
  SERCRET
} from '../constants/Code'
import { SocketManager } from '../io'
import BaseService from './Base'
import { UserInfoModel, UserInfo } from '../model/user/UserInfo'
import { InstanceType } from 'typegoose'

// tslint:disable-next-line: no-var-requires
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

    const user = await UserInfoModel.findUserByOpenId(ctx.openId)

    if (!user) {
      return loginFailResponse
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

    // app.redis.set(_token, JSON.stringify(user), 'EX', 60 * 60 * 24)
    const clientToken = jwt.sign(
      {
        user
      },
      SERCRET,
      {
        expiresIn: '2 days'
      }
    )
    const serverToken = jwt.sign(
      {
        user
      },
      SERCRET,
      {
        expiresIn: '2 days'
      }
    )
    // client token 两小时过期时间
    // server token 两天过期时间
    app.redis.set(clientToken, JSON.stringify(user))
    // app.redis.set(`${user._id}-st`, serverToken)

    socket.send({
      code: 1,
      data: JSON.stringify({
        user,
        ct: clientToken,
        st: serverToken
      })
    })

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
  /**
   * @description 退出登陆
   * @author lentoo
   * @date 2019-09-16
   * @memberof LoginService
   */
  public async loginOut(): Promise<ActionResponseModel> {
    const authorization = this.ctx.authorizationToken
    const user = await this.ctx.currentUserInfo()
    this.app.redis.del(user!._id!)

    await this.app.redis.del(authorization)

    return {
      code: SUCCESS,
      msg: '已成功退出登陆'
    }
  }

  public async wxLogin(user: UserInfo): Promise<ActionResponseModel> {
    const openId = user.openId!

    let u: InstanceType<UserInfo> | null
    try {
      u = await this.ctx.service.userInfo.findUserByOpenId(openId)
    } catch (error) {
      u = null
    }
    if (!u) {
      const userModel = new UserInfoModel()
      Object.assign(userModel, user)
      userModel.openId = openId
      userModel.role = 'user'
      u = await userModel.save()
    }
    const authorizationToken = jwt.sign(
      {
        _id: u._id,
        nickName: user.nickName,
        gender: user.gender,
        avatarUrl: user.avatarUrl
      },
      SERCRET,
      {
        expiresIn: '2 days'
      }
    )
    const serverAuthorizationToken = jwt.sign(
      {
        _id: u._id,
        openId: user.openId,
        role: u.role
      },
      SERCRET,
      { expiresIn: '7 days' }
    )
    await Promise.all([
      this.app.redis.set(authorizationToken, JSON.stringify(u)),
      this.app.redis.set(u._id, serverAuthorizationToken)
    ])
    return {
      code: SUCCESS,
      msg: '登陆成功',
      data: authorizationToken
    }
  }
}
