import { ValiError, email, maxLength, minLength, object, parse, string } from 'valibot'
import { ApiError } from './src/exeptions/api-error'
import userService from './src/services/user-service'
import * as cookie from 'cookie'
import cookieService from './src/services/cookie-service'

const next = (e: unknown) => {
  if (e instanceof ApiError) {
    return new Response(` { "message": "${e.message}" } `, {
      status: e.status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (e instanceof ValiError) {
    return new Response(` { "message": "${e.message}" } `, {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  console.log(e)

  return new Response(' { "message": "Unexpected error" } ', {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

const CreateUserSchema = object({
  email: string([email(), maxLength(40)]),
  name: string([minLength(3), maxLength(22)]),
  password: string([minLength(6), maxLength(32)])
})

const LoginUserSchema = object({
  email: string([email(), maxLength(48)]),
  password: string([minLength(6), maxLength(32)])
})

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const path = new URL(req.url).pathname

    if (req.method === 'POST' && path === '/api/register') {
      try {
        const userJson = await req.json()
        const user = parse(CreateUserSchema, userJson)
        const userData = await userService.register(user)
        return cookieService.setUserDataAndRefreshToken(userData)
      } catch (e) {
        return next(e)
      }
    }

    if (req.method === 'POST' && path === '/api/login') {
      try {
        const userJson = await req.json()
        const user = parse(LoginUserSchema, userJson)
        const userData = await userService.login(user)
        return cookieService.setUserDataAndRefreshToken(userData)
      } catch (e) {
        return next(e)
      }
    }

    if (req.method === 'GET' && path === '/api/refresh') {
      try {
        const data = req.headers.get('Cookie') || ''
        const { refreshToken } = cookie.parse(data)
        const userData = userService.refresh(refreshToken)
        return cookieService.setUserDataAndRefreshToken(userData)
      } catch (e) {
        return next(e)
      }
    }

    if (req.method === 'POST' && path === '/api/logout') {
      try {
        const data = req.headers.get('Cookie') || ''
        const { refreshToken } = cookie.parse(data)
        userService.logout(refreshToken)
        return cookieService.deleteRefreshToken()
      } catch (e) {
        return next(e)
      }
    }

    return new Response(' { "message": "Bad Request." } ', {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

console.log(`Listening in ${server.url}`)
