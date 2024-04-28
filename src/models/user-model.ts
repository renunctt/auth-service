import db from '../../db/db'

export interface CreateUserData {
  email: string
  name: string
  password: string
}

export interface User extends CreateUserData {
  id: number
  createAt: Date
  updateAt: Date
}

export interface CreateUserDB {
  $email: string
  $name: string
  $password: string
}

export interface LoginUserData {
  email: string
  password: string
}

export class UserModel {
  public static create = (createData: CreateUserData): User | null => {
    const createObj: CreateUserDB = {
      $email: createData.email,
      $name: createData.name,
      $password: createData.password
    }

    const result: User | null = db
      .query<User, Record<string, string>>(
        `INSERT INTO user
         (email, name, password) VALUES
         ($email, $name, $password)
         RETURNING *`
      )
      .get(createObj as unknown as Record<string, string>)

    return result
  }

  public static findById = (id: number): User | null => {
    const result: User | null = db.query<User, number>('SELECT * FROM user WHERE id = ?').get(id)

    return result
  }

  public static findByEmail = (email: string): User | null => {
    const result: User | null = db.query<User, string>('SELECT * FROM user WHERE email = ?').get(email)

    return result
  }
}
