import db from '../../db/db'

export interface Token {
  id: number
  refreshToken: string
  userId: string
}

export interface CreateTokenData {
  refreshToken: string
  userId: number
}

export interface CreateTokenDB {
  $refreshToken: string
  $userId: number
}

export interface UpdateTokenDB {
  $id: number
  $refreshToken: string
}

export class TokenModel {
  public static create = (createData: CreateTokenData): Token | null => {
    const createObj: CreateTokenDB = {
      $refreshToken: createData.refreshToken,
      $userId: createData.userId
    }

    const result: Token | null = db
      .query<Token, Record<string, string>>(
        `INSERT INTO token
         (refreshToken, userId) VALUES
         ($refreshToken, $userId)
         RETURNING *`
      )
      .get(createObj as unknown as Record<string, string>)

    return result
  }

  public static deleteByToken = (refreshToken: string) => {
    const result: Token | null = db
      .query<Token, string>('DELETE FROM token WHERE refreshToken = ? RETURNING *')
      .get(refreshToken)

    return result
  }

  public static updateById = (id: number, refreshToken: string): Token | null => {
    const updateObj: UpdateTokenDB = {
      $id: id,
      $refreshToken: refreshToken
    }

    const result: Token | null = db
      .query<Token, Record<number, string>>(
        `UPDATE token
         SET refreshToken = $refreshToken
         WHERE id = $id
         RETURNING *`
      )
      .get(updateObj as unknown as Record<number, string>)

    return result
  }

  public static findByToken = (refreshToken: string) => {
    const result: Token | null = db.query<Token, string>('SELECT * FROM token WHERE refreshToken = ?').get(refreshToken)

    return result
  }

  public static findByUserId = (userId: number): Token | null => {
    const result: Token | null = db.query<Token, number>('SELECT * FROM token WHERE userId = ?').get(userId)

    return result
  }
}
