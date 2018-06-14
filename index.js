class Validator {
  static isTypeValid (value, { type }) {
    if (type === 'array') {
      return Array.isArray(value)
    }

    return typeof value === type && !Array.isArray(value)
  }

  static hasRequiredFields (body, required) {
    const errors = []

    for (const key of required) {
      if (!body[key]) {
        errors.push(`${key} is required`)
      }
    }

    return errors
  }

  static validate (body, schema) {
    let errors = []

    for (const [ key, type ] of Object.entries(schema)) {
      const objectType = typeof type === 'string'
        ? { type }
        : type
      const { items: itemsSchema, required } = objectType

      if (!this.isTypeValid(body[key], objectType)) {
        errors.push(`${key} must be ${type}`)
      } else if (Array.isArray(body[key]) && itemsSchema) {
        const itemsErrors = this.validateItems(body[key], itemsSchema, key)

        errors = [
          ...errors,
          ...itemsErrors
        ]
      } else if (typeof body[key] === 'object' && !Array.isArray(body[key])) {
        const requiredErrors = this.hasRequiredFields(body[key], required)

        errors = [
          ...errors,
          ...requiredErrors
        ]
      }
    }

    return errors
  }

  static validateItems (items, type, key) {
    let errors = []

    const { items: itemsSchema, required } = type

    if (!items.length) {
      errors.push(`${key}[0] must be ${type.type}`)
    }

    items.forEach((item, i) => {
      if (!this.isTypeValid(item, type)) {
        errors.push(`${key}[${i}] must be ${type.type}`)
      } else if (Array.isArray(item) && itemsSchema) {
        const itemsErrors = this.validateItems(item, itemsSchema, `${key}[${i}]`)

        errors = [
          ...errors,
          ...itemsErrors
        ]
      } else if (typeof item === 'object' && !Array.isArray(item)) {
        const requiredErrors = this.hasRequiredFields(item, required)

        errors = [
          ...errors,
          ...requiredErrors
        ]
      }
    })

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