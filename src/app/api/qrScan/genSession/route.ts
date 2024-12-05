'use server'
import { postgreSQL } from '@/config/db'
import { apiResponse, errorResponse } from '@/utils/responseUtils'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

export async function POST() {
  try {
    let sessionID
    let isUnique = false

    //만료된 sessionID 중 로그인(email정보 X)이 안된 정보 삭제
    const nowDate = new Date(Date.now()).toISOString() //서버용
    //const nowDate = new Date(Date.now()) //local용
    await postgreSQL.query(
      'DELETE FROM comdb.tbd_com_user_session WHERE expires < $1 AND login_id is null',
      [nowDate]
    )

    // 고유한 sessionID 생성 및 중복 확인 루프
    while (!isUnique) {
      // sessionID 생성
      sessionID = uuidv4()

      // sessionID가 이미 존재하는지 확인
      const result = await postgreSQL.query(
        'SELECT COUNT(*) FROM comdb.tbd_com_user_session WHERE session_id = $1',
        [sessionID]
      )

      // 중복이 아닐 경우 while문 종료
      if (result.rows[0].count === '0') {
        isUnique = true
      }
    }
    if (sessionID) {
      // 세션 만료 시간 설정 (5분 후)
      const expiredTime = new Date(Date.now() + 30 * 60 * 1000).toISOString() //서버용
      //const expiredTime = new Date(Date.now() + 30 * 60 * 1000) //로컬용

      // sessionID와 만료 시간을 세션 테이블에 저장

      await postgreSQL.query(
        'INSERT INTO comdb.tbd_com_user_session (session_id, expires) VALUES ($1, $2)',
        [sessionID, expiredTime]
      )
      // sessionID로 QR 이미지 생성
      const qrCodeDataUrl = await QRCode.toDataURL('myapp://auth?sessionID=' + sessionID)
      console.log('qrURL: ' + qrCodeDataUrl)

      // 성공적으로 생성된 QR 코드 반환
      return apiResponse({ sessionID: sessionID, qrCode: qrCodeDataUrl })
    } else {
      return errorResponse(500, { detailMessage: 'QR 코드 생성에 실패했습니다.' })
    }
  } catch (error) {
    // 에러 처리
    console.error('QR 코드 생성 중 오류 발생:', error)
    return errorResponse(500, { detailMessage: 'QR 코드 생성에 실패했습니다.' })
  }
}
