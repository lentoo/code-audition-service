import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1566822825217_634'

  config.security = {
    csrf: {
      enable: false
    }
  }

  config.graphql = {
    router: '/graphql',
    dateScalarMode: 'isoDate'
  }
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  }
  // add mongodb config
  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/codeAudition',
      options: {
        autoReconnect: true,
        poolSize: 40,
        useFindAndModify: false
      }
    }
  }

  // add your egg config in here
  config.middleware = []

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    uuid: {
      name: 'ebuuid',
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10
    }
  }

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig
  }
}
