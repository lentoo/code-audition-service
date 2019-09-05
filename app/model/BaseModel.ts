import { Typegoose, prop, pre } from 'typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Schema } from 'mongoose'
@pre<BaseModel>('save', function(next) {
  if (!this.createAtDate || this.isNew) {
    this.createAtDate = this.updateAtDate = new Date()
  } else {
    this.updateAtDate = new Date()
  }
  next()
})
@ObjectType()
export default class BaseModel extends Typegoose {
  @Field()
  _id?: string
  @prop()
  @Field()
  createAtDate?: Date
  @prop()
  @Field()
  updateAtDate?: Date
}
