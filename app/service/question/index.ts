/**
 * https://github.com/lentoo/Ts-Egg-Mongoose-GraphQL
 *
 * @summary 投稿题目service 相关业务
 * @author lentoo <729533020@qq.com>
 *
 * Created at     : 2019-09-12 14:01:54
 * Last modified  : 2019-09-21 14:54:36
 */

import { union } from 'lodash'
import BaseService from '../Base'
import * as dayjs from 'dayjs'
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
import { InstanceType } from 'typegoose'
import { Idea, IdeaModel } from '../../model/question/Idea'
import { CollectionModel } from '../../model/collection/Collection'

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
    const u = await this.ctx.currentUserInfo()
    const user = await UserInfoModel.findById(u!._id)
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
      msg: '添加成功',
      data: model._id
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
      Object.assign(_question, question)
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
    if (questions.length === 0) {
      this.error('题目不存在')
    }
    const { err, row } = await QuestionModel.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $set: {
          auditStatus: status,
          auditInfo: {
            auditDate: new Date(),
            auditName: user!.nickName!,
            auditPersonId: user!._id!,
            reason
          }
        }
      }
    )
    if (err) {
      this.error(err.message)
    }
    return {
      code: SUCCESS,
      msg: '操作成功'
    }
  }

  public async pushQuestion() {
    const currentDate = dayjs()
    const oldDate = currentDate.subtract(4, 'day')
    const minDate = currentDate.subtract(14, 'day')
    const user = await this.getAuthUser()
    if (user.likeSorts!.length === 0) {
      this.error('你还没有关注分类，先去关注一些你喜欢的分类吧')
    }

    const fields = this.selectFields
    const where = {
      _id: {
        $nin: user.brushedQuestions
      },
      sort: {
        $in: user.likeSorts
      },
      auditStatus: AuditStatusType.已通过,
      createAtDate: {
        $gte: minDate.toDate()
      }
    }
    const flow = QuestionModel.find(where, fields)
    if (fields.userinfo) {
      flow.populate({
        model: 'UserInfo',
        path: 'userinfo'
      })
    }
    if (fields.sort) {
      flow.populate({
        model: 'Sort',
        path: 'sort'
      })
    }

    const questionsPool = await flow.exec()
    // const oldDate = new Date(year, month, date)

    const oldQuestion = questionsPool.filter(
      item => item.createAtDate! < oldDate.toDate()
    )
    const newQuestion = questionsPool.filter(
      item => item.createAtDate! >= oldDate.toDate()
    )

    // const oldQuestionWhere = {
    //   _id: {
    //     $nin: user.brushedQuestions
    //   },
    //   sort: {
    //     $in: user.likeSorts
    //   },
    //   auditStatus: AuditStatusType.已通过,
    //   createAtDate: {
    //     $lt: new Date(year, month, date),
    //     $gte: new Date(minDate.year(), minDate.month(), minDate.date())
    //   }
    // }
    // const newQuestionWhere = {
    //   _id: {
    //     $nin: user.brushedQuestions
    //   },
    //   sort: {
    //     $in: user.likeSorts
    //   },
    //   auditStatus: AuditStatusType.已通过,
    //   createAtDate: {
    //     $gte: new Date(year, month, date)
    //   }
    // }
    // const oldQuestionFlow = QuestionModel.find(oldQuestionWhere, fields)
    // const newQuestionFlow = QuestionModel.find(newQuestionWhere, fields)
    // if (fields.userinfo) {
    //   oldQuestionFlow.populate({
    //     model: 'UserInfo',
    //     path: 'userinfo'
    //   })
    //   newQuestionFlow.populate({
    //     model: 'UserInfo',
    //     path: 'userinfo'
    //   })
    // }
    // if (fields.sort) {
    //   oldQuestionFlow.populate({
    //     model: 'Sort',
    //     path: 'sort'
    //   })
    //   newQuestionFlow.populate({
    //     model: 'Sort',
    //     path: 'sort'
    //   })
    // }
    // const [oldQuestion, newQuestion] = await Promise.all([
    //   oldQuestionFlow.exec(),
    //   newQuestionFlow.exec()
    // ])
    console.log({
      oldDate: oldDate.format('YYYY-MM-DD')
    })
    if (oldQuestion.length === 0 && newQuestion.length === 0) {
      this.error('已经把所有题都刷完了，你真优秀，欢迎投稿题目')
    }
    const question = getRandomQuesiton(oldQuestion, newQuestion)
    // 浏览量加一
    question.browse += 1
    // 查询当前用户是否收藏了该题目
    const collections = await CollectionModel.findOne(
      {
        userinfo: user._id
      },
      {
        _id: 1,
        questions: 1
      }
    ).populate({
      path: 'questions',
      model: 'Question',
      match: {
        _id: question._id
      },
      select: {
        _id: 1
      }
    })
    // 查看是否收藏
    question.isCollection = false
    if (collections) {
      question.isCollection = collections.questions.length > 0
    }

    // 方便测试，暂时注释掉
    // user.brushedQuestions.push(question)
    await Promise.all([question.save(), user.save()])

    return question
  }

  public async addIdeaByQuestion(
    questionId: string,
    content: string,
    targetIdeaId?: string
  ): Promise<ActionResponseModel> {
    const u = await this.getCurrentUser()
    const [user] = await Promise.all([
      UserInfoModel.findById(u!._id, { _id: 1, nickName: 1 }).exec()
    ])
    if (!user) {
      this.error('用户不存在')
    }

    if (user) {
      const question = await QuestionModel.findById(questionId)
      if (question) {
        const idea = new IdeaModel()
        idea.question = question
        idea.content = content
        idea.userinfo = user
        if (targetIdeaId) {
          const ideaModel = await IdeaModel.findById(targetIdeaId).exec()
          if (!ideaModel) {
            this.error('该想法不存在')
          } else {
            idea.targetIdea = ideaModel
            idea.targetUser = ideaModel.userinfo
          }
        }
        const res = await idea.save()

        return {
          code: SUCCESS,
          msg: '回复成功',
          data: res._id
        }
      } else {
        this.error('题目不存在')
      }
    } else {
      this.error('用户不存在')
    }
    return {
      code: SUCCESS,
      msg: '回复成功'
    }
  }
}

const getRandomQuesiton = (
  oldQuestion: InstanceType<Question>[],
  newQuestion: InstanceType<Question>[]
): InstanceType<Question> => {
  const firstRandom = Math.random()
  let question: InstanceType<Question>
  console.log('firstRandom', firstRandom)

  if (firstRandom >= 0.5) {
    console.log('use new Question')
    if (newQuestion.length > 0) {
      question = newQuestion[Math.floor(Math.random() * newQuestion.length)]
    } else {
      console.log('Downgrade Use Old Question')
      question = oldQuestion[Math.floor(Math.random() * oldQuestion.length)]
    }
  } else {
    console.log('use old Question')
    if (oldQuestion.length > 0) {
      question = oldQuestion[Math.floor(Math.random() * oldQuestion.length)]
    } else {
      console.log('Downgrade Use New Question')
      question = newQuestion[Math.floor(Math.random() * newQuestion.length)]
    }
  }
  return question
}
