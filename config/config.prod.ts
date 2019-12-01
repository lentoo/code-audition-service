import { EggAppConfig, PowerPartial, EggAppInfo } from 'egg'
import * as db from './db.json'
export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {}
  // add mongodb config
  config.mongoose = {
    client: {
      url: 'mongodb://mongo-node-1/codeAudition',
      options: {
        autoReconnect: true,
        poolSize: 40,
        useFindAndModify: false
      }
    }
  }

  config.redis = {
    client: {
      port: 6379,
      host: 'redis-node-1',
      db: 0,
      password: db.redis
    }
  }
  config.io = {
    init: {},
    namespace: {
      '/scanLogin': {
        connectionMiddleware: ['connection'],
        packetMiddleware: []
      }
    },
    redis: {
      host: 'redis-node-1',
      port: 6379,
      db: 1,
      password: config.redis
    }
  }

  return config
}
