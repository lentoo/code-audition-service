/**
 * https://github.com/lentoo/Ts-Egg-Mongoose-GraphQL
 *
 * @summary 投稿题目service 相关业务
 * @author lentoo <729533020@qq.com>
 *
 * Created at     : 2019-09-12 14:01:54
 * Last modified  : 2019-09-14 19:18:47
 */

import { union } from 'lodash'
import BaseService from '../Base'
import {
  Question,
  QuestionModel,
  PaginationQuestionResponse,
  AuditStatusType
} from '../../model/question/Question'
import { ActionResponseModel } from '../../model/BaseModel'
import { SUCCESS } from '../../constants/Code'
import { UserInfoModel, UserInfo } from '../../model/user/UserInfo'
import { SortModel } from '../../model/sort/Sort'

export default class QuestionService extends BaseService {
  public async addQuestion(
    question: Question,
    sortIds: string[]
  ): Promise<ActionResponseModel> {
    const _quetion = await QuestionModel.findOne({
      title: question.title
    }).exec()
    if (_quetion) {
      this.error('该标题已存在')
    }
    if (sortIds.length === 0) {
      this.error('请选择分类')
    }

    const sorts = await SortModel.find({
      _id: {
        $in: sortIds
      }
    }).exec()

    if (sorts.length === 0) {
      this.error('分类id无效')
    }
    sorts.map(sort => {
      sort.questionNum! += 1
      sort.save()
    })

    question.sort = sorts

    const user = await this.getCurrentUser()
    if (user) {
      question.userinfo = user
    } else {
      this.error('用户不存在')
    }
    const model = new QuestionModel()

    Object.assign(model, question)
    await model.save()
    return {
      code: SUCCESS,
      msg: '添加成功'
    }
  }
  /**
   * @description 修改题目
   * @author lentoo
   * @date 2019-09-12
   * @param {Question} question
   * @param {string[]} sortIds
   * @memberof QuestionService
   */
  public async updateQuestion(
    question: Question,
    sortIds: string[]
  ): Promise<ActionResponseModel> {
    if (sortIds.length === 0) {
      this.error('请选择分类')
    }
    const _question = await QuestionModel.findById(question._id)
    if (!_question) {
      this.error('题目不存在')
    } else {
      const count = await SortModel.find({
        _id: {
          $in: sortIds
        }
      }).countDocuments()
      if (count === 0) {
        this.error('分类id无效')
      }

      const oldSortIds = _question.sort.map(s => String(s))
      // 并集 id
      const unionIds = union(oldSortIds, sortIds)

      const unionSorts = await SortModel.find({
        _id: {
          $in: unionIds
        }
      })
      _question.sort = []
      unionSorts.map(sort => {
        if (oldSortIds.includes(String(sort._id))) {
          sort.questionNum! -= 1
        }
        if (sortIds.includes(String(sort._id))) {
          sort.questionNum! += 1
          _question.sort.push(sort)
        }
        sort.save()
      })
      await _question.save()
    }
    return {
      code: SUCCESS,
      msg: '修改成功'
    }
  }
  /**
   * @description 删除题目
   * @author lentoo
   * @date 2019-09-12
   * @param {string} id
   * @returns {Promise<ActionResponseModel>}
   * @memberof QuestionService
   */
  public async removeQuestion(id: string): Promise<ActionResponseModel> {
    const question = await QuestionModel.findById(id)
    if (!question) {
      this.error('题目不存在')
    } else {
      // 1. 先减少分类下面的题目数
      const sortIds = question.sort.map(s => String(s))
      const sortModels = await SortModel.find({
        _id: {
          $in: sortIds
        }
      })
      sortModels.map(sort => {
        sort.questionNum! -= 1
        sort.save()
      })
      // 2. 在删除题目
      await question.remove()
    }
    return {
      code: SUCCESS,
      msg: '删除成功'
    }
  }

  /**
   * 查询题目
   */
  public async fetchQuestionList(
    current: number,
    limit: number,
    nickName: string = '',
    auditStatus?: number
  ): Promise<PaginationQuestionResponse> {
    const where: any = {}
    if (auditStatus) {
      where.auditStatus = auditStatus
    }
    if (nickName) {
      const users = await UserInfoModel.find({
        nickName: {
          $regex: nickName,
          $options: '$i'
        }
      }).exec()
      if (users) {
        const userIds = users.map(user => String(user.id))
        where.userinfo = {
          $in: userIds
        }
      }
    }
    const { page, items } = await QuestionModel.paginationQuery(
      where,
      current,
      limit,
      [
        {
          path: 'sort',
          model: 'Sort'
        },
        {
          path: 'userinfo',
          model: 'UserInfo',
          match: {
            nickName: {
              $regex: nickName,
              $options: '$i'
            }
          }
        }
      ]
    )
    const response = new PaginationQuestionResponse()
    response.setData(page, items)
    return response
  }
  /**
   * @description 单个题目查询
   * @author lentoo
   * @date 2019-09-14
   * @param {string} _id 题目id
   * @returns
   * @memberof QuestionService
   */
  public async fetchQuestion(_id: string) {
    const fields = this.selectFields

    const flow = QuestionModel.findOne({
      _id
    })
    if (fields.sort) {
      flow.populate({
        path: 'sort',
        model: 'Sort'
      })
    }
    if (fields.userinfo) {
      flow.populate({
        path: 'userinfo',
        model: 'UserInfo'
      })
    }
    const question = await flow.select({ ...fields })
    if (!question) {
      this.error('题目不存在')
    } else {
      return question
    }
  }

  public async reviewQuestion(
    _id: string,
    status: AuditStatusType,
    reason: string
  ): Promise<ActionResponseModel> {
    const user = await this.getCurrentUser()
    if (!user) {
      this.error('用户不存在')
    }
    const ids = _id.split(',')
    const questions = await QuestionModel.find({
      _id: {
        $in: ids
      }
    }).exec()
    questions.map(async question => {
      question.auditStatus = status
      question.auditInfo = {
        auditDate: new Date(),
        auditName: user!.nickName!,
        auditPersonId: user!._id!,
        reason
      }
      await question.save()
    })
    return {
      code: SUCCESS,
      msg: '操作成功'
    }
  }
}
