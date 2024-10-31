
export const emptyValidation = (param: string): boolean => {
    return !param
} 

export const apiKeyValidation = (apiKey: string): boolean => {
    const jwtApiKey = process.env.API_KEY
    return apiKey === jwtApiKey
}
 