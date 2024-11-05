'use server'
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

  return apiResponse({ email: email, accessToken: accessToken, refreshToken: refresh })
}
