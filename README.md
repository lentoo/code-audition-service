
# ts-egg-mongoose-graphQL
使用 TypeScript + Egg.js + Mongoose + GraphQL 搭建的开发框架

[![Build Status](https://travis-ci.org/lentoo/Ts-Egg-Mongoose-GraphQL.svg?branch=master)](https://travis-ci.org/lentoo/Ts-Egg-Mongoose-GraphQL)

## QuickStart

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

Don't tsc compile at development mode, if you had run `tsc` then you need to `npm run clean` before `npm run dev`.

### Deploy

```bash
$ npm run tsc
$ npm start
```

### Npm Scripts

- Use `npm run lint` to check code style
- Use `npm test` to run unit test
- se `npm run clean` to clean compiled js at development mode once

### Requirement

- Node.js 8.x
- Typescript 2.8+

## 技术栈
- Node.js
- Typescript
- mongoose
- graphql

## 目录结构
``` js
project
├── package.json
├── app.ts      // 用于自定义启动时的初始化工作 (可选)
├── agent.ts    // 用于自定义启动时的初始化工作 (可选)
├── app // 业务代码
|   ├── router.ts   // 用于配置 URL 路由规则
│   ├── constants // 用于放置 常量
│   ├── graphql // 用于配置 graphQL
│   |   └── index.ts
│   ├────── schema // 配置 schema
│   ├── controller // 用于解析用户的输入，处理后返回相应的结果
│   |   └── home.ts
│   ├── service // 用于编写业务逻辑层 (可选)
│   |   └── user.ts
│   ├── middleware // 用于编写中间件 (可选)
│   |   └── auth.ts  // 权限认证
│   ├── schedule // 用于定时任务 (可选)
│   |   
│   ├── public // 用于放置静态资源 (可选)
│   |   
│   ├── view // 用于放置模板文件 (可选)
│   |   
│   └── extend // 用于框架的扩展 (可选)
│       ├── helper.ts (可选)
│       ├── request.ts (可选)
│       ├── response.ts (可选)
│       ├── context.ts (可选)
│       ├── application.ts (可选)
│       └── agent.ts (可选)
├── config // 用于编写配置文件
|   ├── plugin.ts
|   ├── config.default.ts
|   ├── config.prod.ts
|   ├── config.test.ts (可选)
|   ├── config.local.ts (可选)
|   └── config.unittest.ts (可选)
└── test // 用于单元测试
    ├── middleware
    |   
    └── controller
```