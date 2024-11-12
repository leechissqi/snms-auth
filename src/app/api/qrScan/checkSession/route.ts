'use server'
import { postgreSQL } from '@/config/db'
import { apiResponse, errorResponse } from '@/utils/responseUtils'
import { NextRequest } from 'next/server'

export async function GET() {
  return errorResponse(405, { detailMessage: 'Invalid request method' })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const sessionID = body.sessionID

  try {
    // 세션 ID 조회
    const result = await postgreSQL.query(
      'SELECT session_id, expires FROM comdb.tbd_com_user_session WHERE session_id = $1',
      [sessionID]
    )

    if (result.rowCount === 0) {
      // 세션 ID가 유효하지 않은 경우
      return errorResponse(401, { detailMessage: 'Invalid session.' })
    }

    const session = result.rows[0].session_id
    const expires = result.rows[0].expires
    const currentTime = new Date()

    if (new Date(expires) < currentTime) {
      // 세션이 만료된 경우
      return errorResponse(401, { detailMessage: 'Session expired.' })
    }

    // 유효한 세션일 경우
    console.log('=============' + sessionID)
    return apiResponse({ sessionID: session, useableSession: true })
  } catch (error) {
    console.error('Error checking session:', error)
    return errorResponse(401, { detailMessage: 'Session check failed.' })
  }
}
