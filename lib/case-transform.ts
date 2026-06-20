export function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "")
  })
}

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function keysToCamel<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v)) as any
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toCamelCase(key)]: keysToCamel(obj[key]),
      }),
      {}
    ) as any
  }
  return obj
}

export function keysToSnake<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnake(v)) as any
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toSnakeCase(key)]: keysToSnake(obj[key]),
      }),
      {}
    ) as any
  }
  return obj
}
