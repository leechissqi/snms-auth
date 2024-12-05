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
  const sessionID = body.sessionID ?? ''

  //vlidation 체크
  if (
    emptyValidation(body.email) ||
    (emptyValidation(sessionID.trim()) && emptyValidation(body.userPwd))
  ) {
    console.log('----------------------------------------------------')
    return errorResponse(400, { detailMessage: 'parameter is required.' })
  }
  const user = await getUser(body.email)

  if (!user) {
    return errorResponse(400, { detailMessage: 'not exist user.' })
  }

  //QR로그인인 경우는 skip, 일반/지문 로그인 경우에는 패스워드 체크
  if (
    (sessionID && !emptyValidation(sessionID.trim())) ||
    (body.userPwd && !emptyValidation(body.userPwd))
  ) {
    // sessionID가 존재하고, 유효한 값이거나,
    // sessionID가 없고, userPwd가 존재할 경우에만 처리
    if (body.userPwd) {
      // 비밀번호 체크
      const matchPwd = await bcrypt.compare(body.userPwd, user.password)
      if (!matchPwd) {
        return errorResponse(500, { detailMessage: 'not exist user.' })
      }
    }
    // sessionID 관련 처리 추가 가능
  }

  // token 발행
  const accessToken = createToken(body.email)
  const refresh = refreshToken(body.email)
  //sessionID 가 있는 경우 session 테이블 데이터 저장
  if (sessionID.trim()) {
    await postgreSQL.query(
      'UPDATE comdb.tbd_com_user_session SET login_id = $1, access_token = $2, refresh_token = $3 where session_id = $4 ',
      [body.email, accessToken, refresh, sessionID]
    )
  }
  return apiResponse({
    email: body.email,
    user: user,
    accessToken: accessToken,
    refreshToken: refresh,
  })
  //
}

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await postgreSQL.query<User>(
      `SELECT
        user_id as id
        , user_name as name
        , login_id as email
        , user_pwd as password
        , auth_key
        , pfx_user_code
      FROM comdb.tbd_com_user_session
      WHERE login_id=$1`,
      [email]
    )
    return user.rows[0]
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}
