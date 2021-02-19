import crypto from 'crypto'
import stringSanitizer from 'string-sanitizer'

export default class TextUtils {
  static generateRandomCharacters(numOfCharacters: number = 10): string {
    return crypto.randomBytes(numOfCharacters).toString('hex')
  }

  static sanitize(text: string): string {
    return stringSanitizer.sanitize(text)
  }
}
