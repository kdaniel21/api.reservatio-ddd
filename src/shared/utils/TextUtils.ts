import crypto from 'crypto'
import stringSanitizer from 'string-sanitizer'

export default class TextUtils {
  static generateRandomCharacters(numOfCharacters: number = 10): string {
    return crypto.randomBytes(numOfCharacters).toString('hex')
  }

  static hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex').toString()
  }

  static sanitize(text: string): string {
    return stringSanitizer.sanitize(text)
  }
}
