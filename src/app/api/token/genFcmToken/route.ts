'use server'
import { postgreSQL } from '@/config/db'
import { apiResponse, errorResponse } from '@/utils/responseUtils'
import { apiKeyValidation, emptyValidation } from '@/utils/validation'
import { NextRequest } from 'next/server'

export async function GET() {
  return errorResponse(405, { detailMessage: 'Invalid request method' })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = body.id ?? ''
  const deviceType = body.deviceType ?? ''
  const fcmToken = body.fcmToken ?? ''

  const headerApiKey = req.headers.get('x-api-key')

  if (!headerApiKey || !apiKeyValidation(headerApiKey)) {
    return errorResponse(500, { detailMessage: 'x-api-key different.' })
  }

  //vlidation 체크
  if (emptyValidation(id) || emptyValidation(fcmToken)) {
    console.log('----------------------------------------------------')
    return errorResponse(400, { detailMessage: 'parameter is required.' })
  }

  //sessionID 가 있는 경우 session 테이블 데이터 저장

  await postgreSQL.query('UPDATE users SET device_type = $1, fcm_token = $2 where id = $3 ', [
    deviceType,
    fcmToken,
    id,
  ])

  return apiResponse({ id: id, fcmToken: fcmToken })
  //
}
