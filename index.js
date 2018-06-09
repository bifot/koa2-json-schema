class Validator {
  static isValueValid (value, type) {
    if (type === 'array') {
      return Array.isArray(value)
    }

    return typeof value === type
  }

  static validate (body, schema) {
    const errors = []

    for (const [ key, type ] of Object.entries(schema)) {
      if (!this.isValueValid(body[key], type)) {
        errors.push(`${key} must be ${type}`)
      }
    }

    return errors
  }

  static middleware (schema) {
    return (ctx, next) => {
      const errors = Validator.validate(ctx.request.body, schema)

      if (errors.length) {
        ctx.status = 400
        ctx.body = { error: errors }

        return false
      }

      return next()
    }
  }
}

module.exports = Validator.middleware