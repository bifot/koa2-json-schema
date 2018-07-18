const I18n = require('./i18n')
const en = require('./locales/en')

class Validator {
  constructor (locales = en) {
    this.i18n = I18n(locales)
  }

  isTypeValid (value, { type }) {
    if (type === 'array') {
      return Array.isArray(value)
    }

    return typeof value === type && !Array.isArray(value)
  }

  hasRequiredFields (body, required, parentKey) {
    const errors = []

    for (const key of required) {
      if (!body[key]) {
        errors.push(
          this.i18n('propertyIsRequired', {
            property: `${parentKey}.${key}`
          })
        )
      }
    }

    return errors
  }

  isPropertiesValid (body, properties, parentKey) {
    let errors = []

    for (const [ key, value ] of Object.entries(properties)) {
      const type = typeof value === 'string' ? { type: value } : value
      const { items: itemsSchema } = type

      if (!this.isTypeValid(body[key], type)) {
        errors.push(
          this.i18n('invalidValueType', {
            property: `${parentKey}.${key}`,
            type: type.type
          })
        )
      }

      // If value is array with schema, then validate recursively
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

  validate (body, schema) {
    let errors = []

    for (const [ key, value ] of Object.entries(schema)) {
      const type = typeof value === 'string' ? { type: value } : value
      const { items: itemsSchema, required = [], properties = {} } = type

      if (!this.isTypeValid(body[key], type)) {
        errors.push(
          this.i18n('invalidValueType', {
            property: key,
            type: type.type
          })
        )
      }

      // If value is array with schema, then validate recursively
      if (Array.isArray(body[key]) && itemsSchema) {
        const itemsErrors = this.validateItems(body[key], itemsSchema, key)

        errors = [
          ...errors,
          ...itemsErrors
        ]
      }

      // If value is object, then check on required fields and properties valid
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

  validateItems (items, type, key) {
    let errors = []

    const { items: itemsSchema, required = [], properties = {} } = type

    // If array doesn't have items, then throw error
    if (!items.length) {
      errors.push(
        this.i18n('invalidValueType', {
          property: `${key}[0]`,
          type: type.type
        })
      )
    }

    items.forEach((item, i) => {
      // If type invalid, then throw error
      if (!this.isTypeValid(item, type)) {
        errors.push(
          this.i18n('invalidValueType', {
            property: `${key}[${i}]`,
            type: type.type
          })
        )
      }

      // If value is array with schema, then validate recursively
      if (Array.isArray(item) && itemsSchema) {
        const itemsErrors = this.validateItems(item, itemsSchema, `${key}[${i}]`)

        errors = [
          ...errors,
          ...itemsErrors
        ]
      }

      // If value is object, then check on required fields and properties valid
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

  middleware (schema, silent) {
    return (ctx, next) => {
      const errors = this.validate(ctx.request.body, schema)

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

module.exports = (locales) => {
  const validator = new Validator(locales)

  // Bind validator context to middleware
  return validator.middleware.bind(validator)
}
