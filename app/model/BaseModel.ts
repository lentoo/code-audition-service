import { Typegoose, prop, pre } from 'typegoose'
import { Field, ObjectType } from 'type-graphql'
@pre<BaseModel>('save', function(next) {
  console.log('BaseModel pre')
  if (!this.createAtDate || this.isNew) {
    this.createAtDate = this.updateAtDate = new Date()
  } else {
    this.updateAtDate = new Date()
  }
  next()
})
@ObjectType()
export default class BaseModel extends Typegoose {
  @prop()
  @Field()
  createAtDate?: Date
  @prop()
  @Field()
  updateAtDate?: Date
}
