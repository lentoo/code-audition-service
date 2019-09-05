import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  // graphql: {
  //   enable: true,
  //   package: 'egg-graphql'
  // }
  // typeGraphQL: {
  //   enable: true,
  //   package: 'egg-type-graphql'
  // }
};

export default plugin;
