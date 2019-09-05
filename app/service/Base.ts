import { Service } from 'egg'

export default class BaseService extends Service {
  error(msg: string) {
    throw new Error(msg)
  }
}
