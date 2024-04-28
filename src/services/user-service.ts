import { UserDto } from '../dtos/user-dto'
import { UserModel, type CreateUserData, type LoginUserData, type User } from '../models/user-model'
import * as bcrypt from 'bcrypt'
import tokenService from './token-service'
import { ApiError } from '../exeptions/api-error'

export interface UserDataResponse {
  user: UserDto
  accessToken: string
  refreshToken: string
}

class UserService {
  private createUserTokens = (user: User): UserDataResponse => {
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })
    const token = tokenService.saveToken(userDto.id, tokens.refreshToken)
    if (!token) {
      throw ApiError.InternalServerError('Token was not create successfully.')
    }

    return { ...tokens, user: userDto }
  }

  register = async (body: CreateUserData): Promise<UserDataResponse> => {
    const userByEmail = UserModel.findByEmail(body.email)
    if (userByEmail) {
      throw ApiError.BadRequest('Email already exists.')
    }

    const hashPassword = await bcrypt.hash(body.password, 3)
    const createUser = { ...body, password: hashPassword }
    const user = UserModel.create(createUser)
    if (!user) {
      throw ApiError.InternalServerError('User was not created successfully.')
    }

    const userData = this.createUserTokens(user)
    return userData
  }

  login = async (body: LoginUserData): Promise<UserDataResponse> => {
    const user = UserModel.findByEmail(body.email)
    if (!user) {
      throw ApiError.BadRequest('User email address not found.')
    }

    const isPassEquals = await bcrypt.compare(body.password, user.password)
    if (!isPassEquals) {
      throw ApiError.BadRequest('Incorrect password.')
    }

    const userData = this.createUserTokens(user)
    return userData
  }

  refresh = (refreshToken: string): UserDataResponse => {
    const userDataToken = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = tokenService.findToken(refreshToken)
    if (!userDataToken || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }

    if (typeof userDataToken === 'string') {
      throw ApiError.InternalServerError('Server error.')
    }

    const user = UserModel.findById(Number(userDataToken.id))
    if (!user) {
      throw ApiError.InternalServerError('User does not exist.')
    }

    const userData = this.createUserTokens(user)
    return userData
  }

  logout = (refreshToken: string) => {
    const token = tokenService.removeToken(refreshToken)
    return token
  }
}

export default new UserService()
