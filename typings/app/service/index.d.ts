// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBase from '../../../app/service/Base';
import ExportSort from '../../../app/service/Sort';
import ExportTest from '../../../app/service/Test';
import ExportUserInfo from '../../../app/service/UserInfo';

declare module 'egg' {
  interface IService {
    base: ExportBase;
    sort: ExportSort;
    test: ExportTest;
    userInfo: ExportUserInfo;
  }
}
