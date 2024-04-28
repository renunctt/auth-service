import type { UserDataResponse } from './user-service'

class CookieService {
  private readonly THIRTYDAYSMS = 30 * 24 * 60 * 60 * 1000

  setUserDataAndRefreshToken = (userData: UserDataResponse) => {
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'set-cookie': `refreshToken=${userData.refreshToken}; Path=/api; SameSite=none; HttpOnly=true; Max-Age=${this.THIRTYDAYSMS}`
      }
    })
  }

  deleteRefreshToken = () => {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'set-cookie': `refreshToken=; Path=/api; SameSite=none; HttpOnly=true; Max-Age=-1`
      }
    })
  }
}

export default new CookieService()
