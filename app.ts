import 'reflect-metadata'

import { Application } from 'egg'

export default async (app: Application) => {
  console.log('app', app.config.env)
  if (app.config.env !== 'unittest') {
    await app.graphql.init()
  }
  app.logger.info('started')
}
