import { Pool } from "pg"

// PostgreSQL 연결 설정
const postgreSQL = new Pool({
  connectionString: process.env.POSTGRESQL_URL,
})
 
export { postgreSQL }
