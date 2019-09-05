import { Context, Application, EggAppConfig } from 'egg';

const whiteList = [ '/audition/userInfo/list', '/graphql' ];
export default function uuidMiddleWare(
  options: EggAppConfig['uuid'],
  app: Application,
): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    // name 就是 config.default.js 中 uuid 下的属性

    if (whiteList.some(whiteItem => ctx.request.url.includes(whiteItem))) {
      console.log('白名单', ctx.request.url);
      await next();
    } else {
      const headerKey = ctx.headers['header-key'];
      console.log('headerKey', headerKey);
      if (!headerKey) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          msg: 'Unauthorized',
        };
      } else {
        await next();
      }
    }
  };
}
