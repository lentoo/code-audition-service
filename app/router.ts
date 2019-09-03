import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  router.prefix('/audition')

  router.get('/', controller.home.index)
}
