import { EggAppConfig, PowerPartial, EggAppInfo } from 'egg'

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
      password: ''
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
      db: 1
    }
  }

  return config
}
