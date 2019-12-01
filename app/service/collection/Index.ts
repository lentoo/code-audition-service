import BaseService from '../Base'
import { UserInfoModel } from '../../model/user/UserInfo'
import { ActionResponseModel } from '../../model/BaseModel'
import {
  CollectionModel,
  PaginationCollectionResponse,
  Collection
} from '../../model/collection/Collection'
import { ERROR, SUCCESS } from '../../constants/Code'
import { PaginationProp } from '../../model/Pagination'
import { QuestionModel, Question } from '../../model/question/Question'
import { InstanceType } from 'typegoose'

export default class CollectionService extends BaseService {
  public async addCollection(name: string): Promise<ActionResponseModel> {
    const u = await this.getCurrentUser()

    const user = await UserInfoModel.findById(u!._id).exec()
    if (user) {
      const c = await CollectionModel.findOne({
        userinfo: user._id,
        name
      }).exec()
      if (c) {
        this.error('该收藏夹已存在')
      } else {
        const collection = new CollectionModel()
        collection.name = name
        collection.userinfo = user
        const c = await collection.save()
        return {
          code: SUCCESS,
          msg: '添加成功',
          data: c._id
        }
      }
    } else {
      this.error('用户不存在')
    }
    return {
      code: ERROR,
      msg: '添加失败'
    }
  }

  public async fetchCollection(
    page: PaginationProp,
    questionId?: string
  ): Promise<PaginationCollectionResponse> {
    const user = await this.getAuthUser()
    const { items, page: pagination } = await CollectionModel.paginationQuery(
      {
        userinfo: user._id
      },
      page.page,
      page.limit,
      [
        {
          path: 'userinfo',
          model: 'UserInfo'
        },
        {
          path: 'questions',
          model: 'Question'
        }
      ]
    )
    if (questionId) {
      items.forEach((item: InstanceType<Collection>) => {
        const questions = item.questions as Question[]
        if (
          questions.findIndex(question => String(question._id) === questionId) >
          -1
        ) {
          item.selected = true
        } else {
          item.selected = false
        }
      })
    }
    const p = new PaginationCollectionResponse()
    p.setData(pagination, items)
    return p
  }

  public async fetchCollectionItem(id: string) {
    const collectionItem = await CollectionModel.findById(id)
      .populate({
        path: 'userinfo',
        model: 'UserInfo'
      })
      .populate({
        path: 'questions',
        model: 'Question',
        populate: {
          path: 'sort',
          model: 'Sort'
        }
      })
      .exec()
    if (!collectionItem) {
      this.error('收藏集不存在')
    }
    return collectionItem!
  }

  public async removeCollection(id: string): Promise<ActionResponseModel> {
    const user = await this.getAuthUser()
    const collection = await CollectionModel.findOne({
      _id: id,
      userinfo: user._id
    }).exec()
    if (collection) {
      if (collection.questionNum > 0) {
        // 先移除收藏夹下的题目
        const questions = await QuestionModel.find(
          {
            _id: {
              $in: collection.questions
            }
          },
          {
            _id: 1
          }
        ).exec()
        questions.forEach(question => {
          question.collectionNum -= 1
          question.save()
        })
      }
      await collection.remove()
    } else {
      this.error('收藏集不存在')
    }
    return {
      code: SUCCESS,
      msg: '操作成功',
      data: id
    }
  }
  public async updateCollection(
    id: string,
    name: string
  ): Promise<ActionResponseModel> {
    const user = await this.getAuthUser()
    const collection = await CollectionModel.findOne({
      _id: id
    })
      .populate({
        path: 'userinfo',
        model: 'UserInfo',
        match: {
          _id: user._id
        }
      })
      .exec()

    if (collection) {
      collection.name = name
      await collection.save()
    } else {
      this.error('收藏集不存在')
    }
    return {
      code: SUCCESS,
      msg: '操作成功',
      data: id
    }
  }

  public async collectionQuestion(
    questionId: string,
    collectionId: string
  ): Promise<ActionResponseModel> {
    const user = await this.getAuthUser()
    if (collectionId === '') {
      // 清除该题的收藏
      // 1. 找到所有收藏了该题的收藏夹
      const [clearCollecitons, question] = await Promise.all([
        CollectionModel.find(
          {
            questions: {
              $in: questionId
            },
            userinfo: user._id
          },
          { _id: 1, questions: 1 }
        ).exec(),
        QuestionModel.findById(questionId).exec()
      ])
      // 2. 清除相关信息
      if (clearCollecitons) {
        clearCollecitons.forEach(clear => {
          clear.questionNum = clear.questionNum ? clear.questionNum - 1 : 0
          if (question) {
            question.collectionNum -= 1
          }
          clear.questions.splice(
            clear.questions.findIndex(item => String(item) === questionId),
            1
          )
          // 3. 更新数据
          clear.save()
        })
      }
      Promise.all([question!.save(), user.save()])
      return {
        code: SUCCESS,
        msg: '操作成功'
      }
    } else {
      const collectionIds = collectionId.split(',')

      const [question, collections] = await Promise.all([
        QuestionModel.findById(questionId).exec(),
        CollectionModel.find({
          _id: {
            $in: collectionIds
          },
          userinfo: user._id
        })
          .populate({
            path: 'questions',
            model: 'Question'
          })
          .exec()
      ])
      if (!question) {
        this.error('题目不存在')
      }
      if (collections && collections.length === 0) {
        this.error('收藏集不存在')
      }

      const prevCollecitons = await CollectionModel.find(
        {
          questions: {
            $in: questionId
          }
        },
        { _id: 1, questions: 1 }
      ).exec()
      const prevCIds = prevCollecitons.map(item => String(item._id))
      prevCollecitons.forEach(prevC => {
        if (!collectionIds.includes(String(prevC._id))) {
          prevC.questions.splice(
            prevC.questions.findIndex(id => String(id) === questionId),
            1
          )
          prevC.questionNum = prevC.questionNum ? prevC.questionNum - 1 : 0
          if (question) {
            question.collectionNum -= 1
          }
          prevC.save()
        }
      })
      if (question && collections) {
        collections.forEach(async collection => {
          if (!prevCIds.includes(String(collection._id))) {
            collection!.questions.push(question)
            collection.questionNum = collection.questionNum
              ? collection.questionNum + 1
              : 1
            question.collectionNum += 1
            question.save()
            await collection!.save()
          }
        })
      }
      return {
        code: SUCCESS,
        msg: '收藏成功',
        data: collectionIds.toString()
      }
    }
  }
  /**
   * @description 从收藏集中删除某个题目
   * @author lentoo
   * @date 2019-09-21
   * @param {string} questionId
   * @param {string} collectionId
   * @memberof CollectionService
   */
  public async removeQuestionByCollection(
    questionId: string,
    collectionId: string
  ): Promise<ActionResponseModel> {
    const [question, collection] = await Promise.all([
      QuestionModel.findById(questionId).exec(),
      CollectionModel.findOne({
        _id: collectionId
      }).exec()
    ])
    if (question && collection) {
      collection.questions = collection.questions.filter(
        item => String(item) !== questionId
      )
      collection.questionNum = collection.questions.length
      question.collectionNum -= 1
      await Promise.all([collection.save(), question.save()])
      return {
        code: SUCCESS,
        msg: '操作成功',
        data: questionId + ' | ' + collectionId
      }
    }
    return {
      code: ERROR,
      msg: '操作失败'
    }
  }
}
