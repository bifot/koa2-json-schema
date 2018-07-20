module.exports = (locales) => (key, variables) => {
  let message = locales[key]

  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`%${key}%`, 'g'), value)
  }

  return message
}
