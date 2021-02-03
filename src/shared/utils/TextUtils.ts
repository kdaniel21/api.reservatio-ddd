import crypto from 'crypto'

export default class TextUtils {
  static generateRandomCharacters(numOfCharacters: number = 10): string {
    return crypto.randomBytes(numOfCharacters).toString('hex')
  }
}
