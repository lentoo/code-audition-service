import { Context } from 'egg'
import { SocketManager } from '..'
export default () => {
  return async (ctx: Context, next: () => void) => {
    ctx.socket.emit('res', 'connected!')
    await next()
    // execute when disconnect.
    console.log('disconnection! socket id => ', ctx.socket.id)

    SocketManager.removeSocket(ctx.socket.id)
  }
}
