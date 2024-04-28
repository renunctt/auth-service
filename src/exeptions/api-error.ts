export class ApiError extends Error {
  status: number
  errors: unknown[]

  constructor(status: number, message: string, errors: unknown[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }

  static UnauthorizedError = () => {
    return new ApiError(401, 'Пользователь не авторизован')
  }

  static BadRequest = (message: string, errors: unknown[] = []) => {
    return new ApiError(400, message, errors)
  }

  static InternalServerError = (message: string) => {
    return new ApiError(500, message)
  }
}
