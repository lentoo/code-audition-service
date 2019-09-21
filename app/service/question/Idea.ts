import BaseService from '../Base'
import { IdeaModel, PaginationIdeaResponse } from '../../model/question/Idea'
import { PaginationProp } from '../../model/Pagination'

export default class IdeaService extends BaseService {
  public async fetchIdeaByQuestionId(
    questionId: string,
    pagination: PaginationProp = {
      page: 1,
      limit: 20
    }
  ) {
    const { page, items } = await IdeaModel.paginationQuery(
      {
        question: questionId
      },
      pagination.page,
      pagination.limit,
      [
        {
          model: 'UserInfo',
          path: 'userinfo'
        },
        {
          model: 'Question',
          path: 'question'
        },
        {
          model: 'UserInfo',
          path: 'targetUser'
        }
      ]
    )
    const response = new PaginationIdeaResponse()
    response.setData(page, items)
    return response
  }
}
