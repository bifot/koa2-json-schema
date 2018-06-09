const { expect } = require('chai')
const jsonValidator = require('./')

describe('koa json schema', () => {
  it('send body with correct data', () => {
    const response = jsonValidator({
      name: 'string',
      phone: 'number',
      hobbies: 'array'
    })({
      request: {
        body: {
          name: 'Mikhail',
          phone: 79959978504,
          hobbies: [
            'Football',
            'Basketball'
          ]
        }
      }
    }, () => true)

    expect(response).to.equal(true)
  })

  it('send body with incorrect data', () => {
    const ctx = {
      request: {
        body: {
          hobbies: 'football'
        }
      }
    }
    const response = jsonValidator({
      hobbies: 'array',
      name: 'string'
    })(ctx, () => true)

    expect(ctx.status).to.equal(400)
    expect(ctx.body.error).to.be.a('array').to.have.length(2)
  })
})