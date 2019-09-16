import { MiddlewareFn, AuthChecker } from 'type-graphql'
import { Context } from 'egg'
import * as graphqlFields from 'graphql-fields'
import { UserInfo } from '../../model/user/UserInfo'
import * as jwt from 'jsonwebtoken'
import { SERCRET } from '../../constants/Code'
export const RequestLogRecord: MiddlewareFn = async ({ info }, next) => {
  // console.log('RequestLogRecord', arg)
  console.log(`Request Url -> ${info.parentType.name}.${info.fieldName}`)
  const result = await next()
  console.log('Request Url Result：->', result)
}
export const ResolveRequestTime: MiddlewareFn = async ({ info }, next) => {
  const start = Date.now()
  await next()
  const resolveTime = Date.now() - start
  console.log(
    `Resolve Url -> ${info.parentType.name}.${info.fieldName} [${resolveTime} ms]`
  )
}
export const ErrorResolve: MiddlewareFn = async ({ info }, next) => {
  try {
    await next()
  } catch (error) {
    console.error('error', error)
    throw error
  }
}

export const AuthorizationMiddleware: AuthChecker<Context> = async (
  action,
  roles
) => {
  const authorization = action.context.request.header.authorization

  // const stringifyUser = await action.context.app.redis.get(authorization)
  console.log('AuthorizationMiddleware', authorization)
  try {
    const user = jwt.verify(authorization, SERCRET) as UserInfo
    const u = await action.context.app.redis.get(authorization)
    if (u) {
      const userinfo = JSON.parse(u) as UserInfo
      if (roles.length > 0) {
        return roles.some(role => role === userinfo.role)
      }
    } else {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

export const FieldsMiddleware: MiddlewareFn<Context> = async (action, next) => {
  action.context.request.body.selectFields = graphqlFields(action.info)
  await next()
}
