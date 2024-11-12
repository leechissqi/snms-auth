'use server'
import { postgreSQL } from '@/config/db'
import { User } from '@/types/users'
import { createToken, refreshToken } from '@/utils/jwtUtils'
import { apiResponse, errorResponse } from '@/utils/responseUtils'
import { emptyValidation } from '@/utils/validation'
import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'

export async function GET() {
  return errorResponse(405, { detailMessage: 'Invalid request method' })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  //vlidation 체크
  if (emptyValidation(body.email) || emptyValidation(body.userPwd)) {
    return errorResponse(400, { detailMessage: 'parameter is required.' })
  }
  const user = await getUser(body.email)
  const sessionID = body.sessionID ?? ''

  if (!user) {
    return errorResponse(400, { detailMessage: 'not exist user.' })
  }
  const matchPwd = await bcrypt.compare(body.userPwd, user.password)
  if (!matchPwd) {
    return errorResponse(500, { detailMessage: 'not exist user.' })
  }

  // token 발행
  const accessToken = createToken(body.email)
  const refresh = refreshToken(body.email)
  //sessionID 가 있는 경우 (QR스캔을 통한 2차인증)
  if (sessionID.trim()) {
    await postgreSQL.query(
      'UPDATE comdb.tbd_com_user_session SET email = $1 where session_id = $2 ',
      [body.email, sessionID]
    )
  }
  return apiResponse({ email: body.email, accessToken: accessToken, refreshToken: refresh })
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
