const { expect } = require('chai')
const jsonSchema = require('./')

const applyMiddleware = (middleware, body) => {
  const ctx = {
    request: {
      body
    }
  }

  return {
    next: middleware(ctx, () => true),
    ctx
  }
}

describe('koa json schema', () => {
  it('send body with correct data', () => {
    const { next } = applyMiddleware(
      jsonSchema({
        name: 'string',
        phone: 'number',
        hobbies: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        city: {
          type: 'object',
          required: [
            'lng',
            'lat'
          ],
          properties: {
            lng: 'number',
            lat: 'number'
          }
        },
        preferences: {
          type: 'object',
          required: [
            'mine'
          ],
          properties: {
            mine: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'title',
                  'score'
                ],
                properties: {
                  title: 'string',
                  score: 'number'
                }
              }
            }
          }
        }
      }),
      {
        name: 'Mikhail',
        phone: 79959978504,
        hobbies: [
          'Basketball'
        ],
        city: {
          lng: 15,
          lat: 15
        },
        preferences: {
          mine: [
            {
              title: 'Football',
              score: 2
            }
          ]
        }
      }
    )

    expect(next).to.equal(true)
  })

  it('send body with incorrect data', () => {
    const { ctx, next } = applyMiddleware(
      jsonSchema({
        hobbies: 'array',
        name: 'string',
      }),
      {
        hobbies: 'football'
      }
    )

    expect(ctx.status).to.equal(400)
    expect(ctx.body.error).to.deep.equal([
      'hobbies must be array',
      'name must be string'
    ])
    expect(next).to.equal(false)
  })
})