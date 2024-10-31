"use server"
import { NextRequest } from "next/server"
import {apiResponse, errorResponse} from '@/utils/responseUtils'  
import { apiKeyValidation} from "@/utils/validation" 
import { getBearerToken, verifyToken } from '@/utils/jwtUtils'   

export async function GET() {
  return errorResponse(405,'Invalid request method')
}

export async function POST(req: NextRequest) {
  const headerApiKey = req.headers.get('x-api-key')
  const bearerToken = getBearerToken(req)

  if(!headerApiKey || !apiKeyValidation(headerApiKey)) {
    return errorResponse(500,'x-api-key different.')
  }

  if(!bearerToken) {
    return errorResponse(500,'bearerToken empty.')
  }
  //토큰 유효성 체크
  const token = verifyToken(bearerToken) 
  return apiResponse({useableToken: token.useableToken, accessToken: token.accessToken})
}  

