/**
 * https://github.com/lentoo/Ts-Egg-Mongoose-GraphQL
 *
 * 应用路由配置中心
 *
 * @summary short description for the file
 * @author lentoo <729533020@qq.com>
 *
 * Created at     : 2019-09-09 15:38:25
 * Last modified  : 2019-09-09 17:52:55
 */

import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router, io } = app
  // router.prefix('/audition')

  router.get('/', controller.home.index)

  // socket.io
  io.of('/scanLogin').route('chat', app.io.controller.chat.sendMsg)

  io.of('/scanLogin').route('beforeLogin', app.io.controller.login.beforeLogin)
  // io.of('/').route('event', io.controller.event.ping)
}
