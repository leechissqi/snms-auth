'use server'
import { postgreSQL } from '@/config/db'
import { User } from '@/types/users'
import { createToken, refreshToken, refreshVerify } from '@/utils/jwtUtils'
import { apiResponse, errorResponse } from '@/utils/responseUtils'
import { apiKeyValidation } from '@/utils/validation'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export async function GET() {
  return errorResponse(405, { detailMessage: 'Invalid request method' })
}

export async function POST(req: NextRequest) {
  const headerApiKey = req.headers.get('x-api-key')

  if (!headerApiKey || !apiKeyValidation(headerApiKey)) {
    return errorResponse(500, { detailMessage: 'x-api-key different.' })
  }

  const body = await req.json()
  const refreshTokenVerify = refreshVerify(body.refreshToken)

  //refresh token 만료시
  if (!refreshTokenVerify.useableToken) {
    return errorResponse(500, { detailMessage: 'refresh token expired.' })
  }
  const decodedToken = jwt.decode(body.refreshToken) as JwtPayload
  const email = decodedToken.email
  const accessToken = createToken(email)
  const refresh = refreshToken(decodedToken.email)
  const user = await getUser(email)

  return apiResponse({ email: email, user: user, accessToken: accessToken, refreshToken: refresh })
}

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await postgreSQL.query<User>('SELECT * FROM users WHERE email=$1', [email])
    return user.rows[0]
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}
