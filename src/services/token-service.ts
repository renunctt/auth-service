import { TokenModel, type Token } from '../models/token-model'
import * as jwt from 'jsonwebtoken'

class TokenService {
  private accessSecret: string
  private refreshSecret: string

  constructor() {
    const accessSecret = process.env.JWT_ACCESS_SECRET
    const refreshSecret = process.env.JWT_REFRESH_SECRET
    if (!accessSecret || !refreshSecret) {
      throw new Error('jwt access and refresh secret not found')
    }
    this.accessSecret = accessSecret
    this.refreshSecret = refreshSecret
  }

  generateTokens = (payload: object) => {
    const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: '30m' })
    const refreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: '30d' })
    return { accessToken, refreshToken }
  }

  saveToken = (userId: number, refreshToken: string): Token | null => {
    const tokenData = TokenModel.findByUserId(userId)
    if (tokenData) {
      const token = TokenModel.updateById(tokenData.id, refreshToken)
      return token
    }

    const token = TokenModel.create({ userId, refreshToken })
    return token
  }

  findToken = (refreshToken: string): Token | null => {
    const token = TokenModel.findByToken(refreshToken)
    return token
  }

  removeToken = (refreshToken: string): Token | null => {
    const token = TokenModel.deleteByToken(refreshToken)
    return token
  }

  validateAccessToken = (token: string) => {
    try {
      const userData = jwt.verify(token, this.accessSecret)
      return userData
    } catch (e) {
      return null
    }
  }

  validateRefreshToken = (token: string) => {
    try {
      const userData = jwt.verify(token, this.refreshSecret)
      return userData
    } catch (e) {
      return null
    }
  }
}

export default new TokenService()
