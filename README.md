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
const bodyParser = require('koa-bodyparser')
const jsonValidator = require('koa2-json-schema')

const app = new Koa()

app.use(bodyParser())

app.post('/users', jsonValidator({
  first_name: 'string',
  last_name: 'string',
  phone: 'number',
  hobbies: 'array',
  city: 'object'
}), (ctx) => {
  // API...
})

app.listen(3000)
```

## License

MIT.