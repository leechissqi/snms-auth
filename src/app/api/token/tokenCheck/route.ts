'use server'
import { getBearerToken, verifyToken } from '@/utils/jwtUtils'
import { apiResponse, errorResponse } from '@/utils/responseUtils'
import { apiKeyValidation } from '@/utils/validation'
import { NextRequest } from 'next/server'

export async function GET() {
  return errorResponse(405, { detailMessage: 'Invalid request method' })
}

export async function POST(req: NextRequest) {
  const headerApiKey = req.headers.get('x-api-key')
  const bearerToken = getBearerToken(req)

  if (!headerApiKey || !apiKeyValidation(headerApiKey)) {
    return errorResponse(500, { detailMessage: 'x-api-key different.' })
  }

  if (!bearerToken) {
    return errorResponse(500, { detailMessage: 'bearerToken empty.' })
  }
  //토큰 유효성 체크
  const token = verifyToken(bearerToken)
  return apiResponse({
    useableToken: token.useableToken,
    accessToken: token.accessToken,
  })
}
