import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'
import * as jwt from 'jsonwebtoken'
import { SERCRET } from '../../../app/constants/Code'
describe('test/app/service/Question.test.js', () => {
  let ctx: Context
  let token: string
  before(async () => {
    ctx = app.mockContext()
    // ctx.headers['header-key'] = openId
    return app.ready()
  })

  it('test generate jwt', () => {
    const result = jwt.sign(
      {
        nickName: 'Test'
      },
      SERCRET,
      {
        expiresIn: '1'
      }
    )
    console.log('result', result)
    token = result
  })

  it('test verify jwt', () => {
    const result = jwt.verify(token, SERCRET) as any
    console.log('result', result)
    assert(result.nickName === 'Test')
  })
})
