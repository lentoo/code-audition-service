// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBaseModel from '../../../app/model/BaseModel';
import ExportSortSort from '../../../app/model/sort/Sort';
import ExportUserUserInfo from '../../../app/model/user/UserInfo';

declare module 'egg' {
  interface IModel {
    BaseModel: ReturnType<typeof ExportBaseModel>;
    Sort: {
      Sort: ReturnType<typeof ExportSortSort>;
    }
    User: {
      UserInfo: ReturnType<typeof ExportUserUserInfo>;
    }
  }
}
