export default interface BaseMapper<T> {
  toDto?(entity: T): any
  toDomain?(raw: any): T
}
