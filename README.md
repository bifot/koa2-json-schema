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

## Usage

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
  phone: 'number',
  hobbies: {
    type: 'array',
    items: {
      type: 'string'
    }
  },
  city: 'object'
}), (ctx) => {
  // API...
})

app.use(bodyParser())
app.use(router.routes())

app.listen(3000)
```

## License

MIT.