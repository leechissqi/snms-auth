import jwt, { JwtPayload } from 'jsonwebtoken';

const secret = process.env.API_KEY as string

// Token 발급
const createToken = (email: string) => {
    return jwt.sign({ email: email }, secret, {
      algorithm: 'HS512', // 암호화 알고리즘
      expiresIn: '30m',    // 유효기간 0.5h 30분
    })
  }
  
  // Token 검증
  const verifyToken = (token: string) => {
    try {
      const verifyToken = jwt.verify(token, secret) as JwtPayload
      const tokenExpired = verifyToken.exp

      return {
        code: '0000',
        message: 'SUCCESS',
        accessToken: token ,
        useableToken : true,
        exprired: tokenExpired
      }
    } catch (error: any) {
      return {
        code: '9999',
        message: 'FAIL',    
        accessToken: token ,
        useableToken : false,
        messageDetail : error.message
      }
    }
  }
   
  // refresh Token 발급
  const refreshToken = (email: string) => {
    return jwt.sign({ email: email }, secret, {
      algorithm: 'HS512',   // 암호화 알고리즘
      expiresIn: '1d',      // 유효기간 1일
    });
  }
  
  // refresh Token 검증
  const refreshVerify = (token: string) => {
    try {
      const verifyToken = jwt.verify(token, secret) as JwtPayload
      const tokenExpired = verifyToken.exp

      return {
        code: '0000',
        message: 'SUCCESS',
        accessToken: token ,
        useableToken : true,
        exprired: tokenExpired
      }
    } catch (error: any) {
      return {
        code: '9999',
        message: 'FAIL',    
        accessToken: token ,
        useableToken : false,
        messageDetail : error.message
      }
    }
  }

  function getBearerToken(req: Request): string | null { 
    const authHeader = req.headers.get('authorization')
    return authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null
  }
  
  export { createToken, verifyToken, refreshToken, refreshVerify, getBearerToken };