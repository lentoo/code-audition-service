import { Controller } from 'egg'

declare module 'egg' {
  interface CustomController {
    chat: ChatController
  }
}

export default class ChatController extends Controller {
  public async sendMsg() {
    const { ctx, app } = this
    const nsp = app.io.of('/')
    const message = ctx.args[0] || {}

    console.log(`接收到 ${ctx.socket.id} 发来到消息 ${message}`)
    // 向客户端广播消息， 在客户端监听broadcast事件就可以获取消息了
    nsp.emit('broadcast', message)
    // ctx.socket
  }
}
