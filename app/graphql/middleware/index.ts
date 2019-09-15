import { MiddlewareFn } from 'type-graphql'
import { Context } from 'egg'
import * as graphqlFields from 'graphql-fields'
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

export const Authorization: MiddlewareFn<Context> = async (action, next) => {
  // const token = action.context.request.header.authorization
  // const res = await action.context.app.redis.get(token)
  await next()
}

export const FieldsMiddleware: MiddlewareFn<Context> = async (action, next) => {
  action.context.request.body.selectFields = graphqlFields(action.info)
  await next()
}
