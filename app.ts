import 'reflect-metadata'

import { Application } from 'egg'

export default async (app: Application) => {
  console.log('app-env', app.config.env)
  if (app.config.env !== 'unittest') {
    await app.graphql.init()
  }
  app.logger.info('started')
  app.mongoose.set('debug', app.config.env === 'local')
}
