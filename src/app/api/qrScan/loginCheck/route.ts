'use server'
import { postgreSQL } from '@/config/db'
import { User } from '@/types/users'
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
      `SELECT
        session_id
        , login_id as email
        , expires
        , access_token
        , refresh_token
      FROM comdb.tbd_com_user_session
      WHERE session_id = $1 and login_id is not null `,
      [sessionID]
    )

    if (result.rowCount === 0) {
      // 세션 ID가 유효하지 않은 경우
      return errorResponse(401, { detailMessage: 'Invalid session.' })
    }

    const session = result.rows[0].session_id
    const email = result.rows[0].email
    const accessToken = result.rows[0].access_token
    const refreshToken = result.rows[0].refresh_token
    const user = await getUser(email)

    if (!user) {
      return errorResponse(400, { detailMessage: 'not exist user.' })
    }

    return apiResponse({
      sessionID: session,
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return errorResponse(401, { detailMessage: 'Session check failed.' })
  }
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
      FROM comdb.tbd_com_org_user
      WHERE login_id=$1`,
      [email]
    )
    return user.rows[0]
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}
