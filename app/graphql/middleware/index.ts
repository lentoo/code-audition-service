import { MiddlewareFn, AuthChecker, Ctx } from 'type-graphql'
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
  const isWx = !!action.context.req.headers['header-key']
  if (isWx) {
    const token = action.context.req.headers['header-key'] as string
    try {
      const user = jwt.verify(token, SERCRET)
    } catch (error) {
      // if error name is TokenExpiredError
      if (error.name === 'TokenExpiredError') {
        // if server token not expired
        const userStringify = await action.context.app.redis.get(token)
        if (userStringify) {
          const u = JSON.parse(userStringify) as UserInfo
          const serverToken = await action.context.app.redis.get(u._id!)
          try {
            const user = jwt.verify(serverToken!, SERCRET)
            // auto regenerate
            const newToken = jwt.sign(u, SERCRET, { expiresIn: '2 days' })
            // auto regenerate
            const newServerToken = jwt.sign(user, SERCRET, {
              expiresIn: '7 days'
            })
            // delete old token
            action.context.app.redis.del(token)
            action.context.app.redis.del(u._id!)
            // save new token
            action.context.app.redis.set(newToken, userStringify)
            action.context.app.redis.set(u._id!, newServerToken)
            // set request header
            action.context.req.headers['header-key'] = newToken
            // set response header
            action.context.res.setHeader('x-refresh-authorization', newToken)
          } catch (error) {
            return false
          }
          return true
        }
        return false
      }
      return false
    }
    return true
  } else {
    const authorization = action.context.request.header.authorization
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
}

export const FieldsMiddleware: MiddlewareFn<Context> = async (action, next) => {
  action.context.request.body.selectFields = graphqlFields(action.info)
  await next()
}
