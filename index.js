module.exports = (schema) => (ctx, next) => {
  const { body } = ctx.request
  const errors = []

  for (const [ key, type ] of Object.entries(schema)) {
    if (!body[key]) {
      errors.push(`${key} must be ${type}`)
    } else {
      if (type === 'array') {
        if (!Array.isArray(body[key])) {
          errors.push(`${key} must be ${type}`)
        }
      } else {
        if (typeof body[key] !== type) {
          errors.push(`${key} must be ${type}`)
        }
      }
    }
  }

  if (errors.length) {
    ctx.status = 400
    ctx.body = { error: errors }

    return false
  }

  return next()
}