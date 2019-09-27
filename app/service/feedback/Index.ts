import BaseService from '../Base'
import {
  FeedbackArgs,
  FeedbackModel,
  FeedbackType,
  FeedbackStatus,
  PaginationFeedBackResponse
} from '../../model/feedback/FeedBack'
import { ActionResponseModel } from '../../model/BaseModel'
import { SUCCESS } from '../../constants/Code'
import { PaginationProp } from '../../model/Pagination'
import { UserInfoModel } from '../../model/user/UserInfo'

export default class FeedbackService extends BaseService {
  /**
   * @description 提交反馈
   * @author lentoo
   * @date 2019-09-26
   * @param {FeedbackArgs} item
   * @returns {Promise<ActionResponseModel>}
   * @memberof FeedbackService
   */
  public async addFeedBackItem(
    item: FeedbackArgs
  ): Promise<ActionResponseModel> {
    const user = await this.getAuthUser()

    let feedback = await FeedbackModel.findOne({
      content: item.content.trim(),
      feedbackUser: user._id
    }).exec()
    if (feedback) {
      this.error('不要重复提交相同的反馈内容')
    } else {
      feedback = new FeedbackModel()
      Object.assign(feedback, item)
      feedback.feedbackUser = user
      await feedback.save()
    }

    return {
      code: SUCCESS,
      msg: '提交成功',
      data: feedback._id.toString()
    }
  }

  public async fetchFeedback(
    page: PaginationProp,
    type?: FeedbackType,
    status?: FeedbackStatus,
    nickName?: string
  ): Promise<PaginationFeedBackResponse> {
    const where: any = {}
    if (type) {
      where.type = type
    }
    if (status) {
      where.status = status
    }
    if (nickName) {
      const users = await UserInfoModel.find({
        nickName: {
          $regex: nickName,
          $options: '$i'
        }
      }).exec()
      where.feedbackUser = {
        $in: users
      }
    }

    const { items, page: pagination } = await FeedbackModel.paginationQuery(
      where,
      page.page,
      page.limit,
      [
        {
          path: 'feedbackUser',
          model: 'UserInfo'
        }
      ],
      {
        sort: {
          status: 1
        }
      }
    )
    const response = new PaginationFeedBackResponse()
    response.setData(pagination, items)
    return response
  }

  public async auditFeedback(
    feedbackId: string,
    status: FeedbackStatus,
    resultContent: string
  ): Promise<ActionResponseModel> {
    const user = await this.getAuthUser()
    if (user.role !== 'admin') {
      this.error('无权限审核')
    }
    const feedback = await FeedbackModel.findById(feedbackId).exec()
    if (!feedback) {
      this.error('反馈内容不存在')
    } else {
      await feedback.updateOne({
        status,
        resultContent
      })
    }

    return {
      code: SUCCESS,
      msg: '操作成功',
      data: feedback && feedback._id
    }
  }
}
