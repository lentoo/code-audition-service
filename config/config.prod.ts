import { EggAppConfig, PowerPartial, EggAppInfo } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {}
  // add mongodb config
  config.mongoose = {
    client: {
      url: 'mongodb://mongo-node-1/codeAudition',
      options: {
        autoReconnect: true,
        poolSize: 40
      }
    }
  }

  return config
}
