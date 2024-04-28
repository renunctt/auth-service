import type { User } from '../models/user-model'

export class UserDto {
  id: number
  email: string
  name: string

  constructor(model: User) {
    this.id = model.id
    this.email = model.email
    this.name = model.name
  }
}
