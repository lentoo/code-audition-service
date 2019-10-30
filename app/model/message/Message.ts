import BaseModel from '../BaseModel';
import { ObjectType } from 'type-graphql';
import { PaginationResponseFactory } from '../Pagination';


@ObjectType()
export class Message extends BaseModel {
  title: string
  content: string
  isCancel: boolean
  cancelDate: Date
  isDelete: boolean
  deleteDate: Date
  priority: number
  isRead: boolean
  readDate: Date
  userTyoe: string

}

const messageModel = new Message().getModelForClass(Message)

@ObjectType()
export class PaginationMessageResponse extends PaginationResponseFactory(Message) {}

export const MessageModel = messageModel
