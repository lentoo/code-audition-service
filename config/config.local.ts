import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
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
      host: '127.0.0.1',
      port: 6379,
      db: 1
    }
  }
  return config
}
