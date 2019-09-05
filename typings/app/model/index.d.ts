// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBaseModel from '../../../app/model/BaseModel';
import ExportPagination from '../../../app/model/Pagination';
import ExportSortSort from '../../../app/model/sort/Sort';
import ExportUserUserInfo from '../../../app/model/user/UserInfo';

declare module 'egg' {
  interface IModel {
    BaseModel: ReturnType<typeof ExportBaseModel>;
    Pagination: ReturnType<typeof ExportPagination>;
    Sort: {
      Sort: ReturnType<typeof ExportSortSort>;
    }
    User: {
      UserInfo: ReturnType<typeof ExportUserUserInfo>;
    }
  }
}
