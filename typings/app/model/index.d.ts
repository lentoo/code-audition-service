// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBaseModel from '../../../app/model/BaseModel';
import ExportPagination from '../../../app/model/Pagination';
import ExportCollectionCollection from '../../../app/model/collection/Collection';
import ExportFeedbackFeedBack from '../../../app/model/feedback/FeedBack';
import ExportQuestionIdea from '../../../app/model/question/Idea';
import ExportQuestionQuestion from '../../../app/model/question/Question';
import ExportSortSort from '../../../app/model/sort/Sort';
import ExportUserUserInfo from '../../../app/model/user/UserInfo';

declare module 'egg' {
  interface IModel {
    BaseModel: ReturnType<typeof ExportBaseModel>;
    Pagination: ReturnType<typeof ExportPagination>;
    Collection: {
      Collection: ReturnType<typeof ExportCollectionCollection>;
    }
    Feedback: {
      FeedBack: ReturnType<typeof ExportFeedbackFeedBack>;
    }
    Question: {
      Idea: ReturnType<typeof ExportQuestionIdea>;
      Question: ReturnType<typeof ExportQuestionQuestion>;
    }
    Sort: {
      Sort: ReturnType<typeof ExportSortSort>;
    }
    User: {
      UserInfo: ReturnType<typeof ExportUserUserInfo>;
    }
  }
}
