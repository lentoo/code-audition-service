import { Controller } from 'egg'
import { SocketManager } from '..'

declare module 'egg' {
  interface CustomController {
    login: LoginController
  }
}

export default class LoginController extends Controller {
  public async beforeLogin() {
    const { ctx, app } = this
    const nsp = app.io.of('/chat')
    const message = ctx.args[0] || {}

    console.log(`接收到 ${ctx.socket.id} 发来到消息 ${message}`)
    const data = JSON.parse(message)
    const { unicode, loginToken } = data

    SocketManager.addSocket(ctx.socket.id, ctx.socket)
    // 存放5分钟后过期
    const res = await Promise.all([
      app.redis.set(unicode, ctx.socket.id, 'EX', 300),
      app.redis.set(ctx.socket.id, loginToken, 'EX', 300)
    ])
    console.log(`${unicode} set cache => ${res}`)

    // 向客户端广播消息， 在客户端监听broadcast事件就可以获取消息了
    // nsp.emit('broadcast', message)·
    // ctx.socket
  }
}
