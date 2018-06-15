# Koa2 JSON Schema

Middleware for validate request body by JSON schemas.

## Install

```sh
$ npm i koa2-json-schema
```

## Tests

```sh
$ npm test
```

## Basic usage

```js
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const jsonSchema = require('koa2-json-schema')

const app = new Koa()
const router = new Router()

router.post('/users', jsonSchema({
  first_name: 'string',
  last_name: 'string',
  phone: 'number'
}), (ctx) => {
  // API...
})

app.use(bodyParser())
app.use(router.routes())

app.listen(3000)
```

## Advanced usage

```js
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const jsonSchema = require('koa2-json-schema')

const app = new Koa()
const router = new Router()

router.post('/users', jsonSchema({
  preferences: {
    type: 'array',
    items: {
      type: 'object',
      required: [
        'title',
        'description'
      ],
      properties: {
        title: 'string',
        description: 'string'
      }
    }
  }
}), (ctx) => {
  // API...
})

app.use(bodyParser())
app.use(router.routes())

app.listen(3000)
```

## Error handling

By default, by sending the incorrect data in body, the server will return an error. This is the default error handler in koa2-json-schema.

```js
ctx.status = 400
ctx.body = { error: errors }
```

But if you want to transfer control to the next middleware you must set the flag.

```js
router.post('/users', jsonSchema({
  preferences: {
    type: 'array',
    items: {
      type: 'object',
      required: [
        'title',
        'description'
      ],
      properties: {
        title: 'string',
        description: 'string'
      }
    }
  }
}, true), (ctx) => { // flag is true
  // now you can handle errors from ctx.errors
})
```

## License

MIT.