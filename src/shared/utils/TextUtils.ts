import crypto from 'crypto'
import domPurify from 'dompurify'

export default class TextUtils {
  static generateRandomCharacters(numOfCharacters: number = 10): string {
    return crypto.randomBytes(numOfCharacters).toString('hex')
  }

  static sanitize(text: string): string {
    return domPurify.sanitize(text)
  }
}
