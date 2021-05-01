import faker from 'faker'
import CustomerName from './CustomerName'
import InvalidCustomerNameError from './errors/InvalidCustomerNameError'

describe('CustomerName value object', () => {
  it('should create a valid customerName object', () => {
    const name = faker.name.findName()

    const customerNameOrError = CustomerName.create(name)

    expect(customerNameOrError.isSuccess()).toBe(true)
    expect(customerNameOrError.isFailure()).toBe(false)
    expect(customerNameOrError.value?.value).toBe(name)
  })

  it('should fail when using a too long name', () => {
    const name = 'This a very very long name that faker cant generate'

    const customerNameOrError = CustomerName.create(name)

    expect(customerNameOrError.isSuccess()).toBe(false)
    expect(customerNameOrError.isFailure()).toBe(true)
    expect(customerNameOrError.error).toBeInstanceOf(InvalidCustomerNameError)
  })

  it('should fail when passing in an empty string', () => {
    const name = ''

    const customerNameOrError = CustomerName.create(name)

    expect(customerNameOrError.isSuccess()).toBe(false)
    expect(customerNameOrError.isFailure()).toBe(true)
    expect(customerNameOrError.error).toBeInstanceOf(InvalidCustomerNameError)
  })
})
