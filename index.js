class Validator {
  static isTypeValid (value, { type }) {
    if (type === 'array') {
      return Array.isArray(value)
    }

    return typeof value === type && !Array.isArray(value)
  }

  static hasRequiredFields (body, required, parentKey) {
    const errors = []

    for (const key of required) {
      if (!body[key]) {
        errors.push(`${parentKey}.${key} is required`)
      }
    }

    return errors
  }

  static isPropertiesValid (body, properties, parentKey) {
    let errors = []

    for (const [ key, value ] of Object.entries(properties)) {
      const type = typeof value === 'string' ? { type: value } : value
      const { items: itemsSchema } = type

      if (!this.isTypeValid(body[key], type)) {
        errors.push(`${parentKey}.${key} must be ${type.type}`)
      }

      if (Array.isArray(body[key]) && itemsSchema) {
        const itemsErrors = this.validateItems(body[key], itemsSchema, parentKey)

        errors = [
          ...errors,
          ...itemsErrors
        ]
      }
    }

    return errors
  }

  static validate (body, schema) {
    let errors = []

    for (const [ key, value ] of Object.entries(schema)) {
      const type = typeof value === 'string' ? { type: value } : value
      const { items: itemsSchema, required = [], properties = {} } = type

      if (!this.isTypeValid(body[key], type)) {
        errors.push(`${key} must be ${type.type}`)
      }

      if (Array.isArray(body[key]) && itemsSchema) {
        const itemsErrors = this.validateItems(body[key], itemsSchema, key)

        errors = [
          ...errors,
          ...itemsErrors
        ]
      }

      if (typeof body[key] === 'object' && !Array.isArray(body[key])) {
        const requiredErrors = this.hasRequiredFields(body[key], required, key)
        const propertiesErrors = this.isPropertiesValid(body[key], properties, key)

        errors = [
          ...errors,
          ...requiredErrors,
          ...propertiesErrors
        ]
      }
    }

    return errors
  }

  static validateItems (items, type, key) {
    let errors = []

    const { items: itemsSchema, required = [], properties = {} } = type

    if (!items.length) {
      errors.push(`${key}[0] must be ${type.type}`)
    }

    items.forEach((item, i) => {
      if (!this.isTypeValid(item, type)) {
        errors.push(`${key}[${i}] must be ${type.type}`)
      }

      if (Array.isArray(item) && itemsSchema) {
        const itemsErrors = this.validateItems(item, itemsSchema, `${key}[${i}]`)

        errors = [
          ...errors,
          ...itemsErrors
        ]
      }

      if (typeof item === 'object' && !Array.isArray(item)) {
        const requiredErrors = this.hasRequiredFields(item, required, key)
        const propertiesErrors = this.isPropertiesValid(item, properties, key)

        errors = [
          ...errors,
          ...requiredErrors,
          ...propertiesErrors
        ]
      }
    })

    return errors
  }

  static middleware (schema, silent) {
    return (ctx, next) => {
      const errors = Validator.validate(ctx.request.body, schema)

      if (errors.length) {
        if (!silent) {
          ctx.status = 400
          ctx.body = { error: errors }

          return false
        }

        ctx.errors = errors
      }

      return next()
    }
  }
}

module.exports = Validator.middleware