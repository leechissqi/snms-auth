import { NextResponse } from 'next/server';

interface apiResponse {
  code: string
  message: string
  data: any
}
 

export function apiResponse(data: any): NextResponse {
    const response: apiResponse = {
      code: '0000',
      message: 'SUCCESS',
      data
    };
    return NextResponse.json(response, { status: 200 });
  }
  
  export function errorResponse(statuscode: number ,data: any): NextResponse {
    const response: apiResponse = {
      code: '9999',
      message: 'FAIL',
      data
    };
    return NextResponse.json(response, { status: statuscode });
  }