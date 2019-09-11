import * as path from 'path'

import { ApolloServer } from 'apollo-server-koa'
import { Application } from 'egg'
import { GraphQLSchema, GraphQLFormattedError, SourceLocation } from 'graphql'
import { buildSchema } from 'type-graphql'
import { ErrorResolve } from './middleware'

export interface GraphQLConfig {
  router: string
  dateScalarMode?: 'isoDate' | 'timestamp'
  graphiql: boolean
}

export default class GraphQL {
  private readonly app: Application
  private graphqlSchema: GraphQLSchema
  private config: GraphQLConfig

  constructor(app: Application) {
    this.app = app
    this.config = app.config.graphql
  }

  getResolvers() {
    const isLocal = this.app.config.env === 'local'
    return [
      path.resolve(
        process.cwd(),
        `app/graphql/schema/**/*.${isLocal ? 'ts' : 'js'}`
      )
    ]
  }

  async init() {
    this.graphqlSchema = await buildSchema({
      resolvers: this.getResolvers(),
      dateScalarMode: this.config.dateScalarMode,
      globalMiddlewares: [ErrorResolve]
    })
    const server = new ApolloServer({
      schema: this.graphqlSchema,
      formatError: error => {
        const err = new FormatError()
        err.message = error.message
        err.path = error.path
        return err
      },
      tracing: false,
      context: ({ ctx }) => ctx, // 将 egg 的 context 作为 Resolver 传递的上下文
      playground: {
        settings: {
          'request.credentials': 'include'
        }
      } as any,
      introspection: true
    })
    server.applyMiddleware({
      app: this.app,
      path: this.config.router,
      cors: false
    })
    this.app.logger.info('graphql server init')
  }

  // async query({query, var})

  get schema(): GraphQLSchema {
    return this.graphqlSchema
  }
}

class FormatError implements GraphQLFormattedError {
  message: string
  locations?: readonly SourceLocation[] | undefined
  path?: readonly (string | number)[] | undefined
  extensions?: Record<string, any> | undefined
}
