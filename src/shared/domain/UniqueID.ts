import { nanoid } from 'nanoid'
import Identifier from './Identifier'

export default class UniqueID extends Identifier<string | number> {
  constructor(private id?: string | number) {
    super(id || nanoid())
  }
}
