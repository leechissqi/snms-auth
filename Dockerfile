# 빌드 단계
FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json 및 package-lock.json 복사
COPY package.json package-lock.json ./

# 의존성 설치 (production only)
#RUN npm install --production
RUN npm install --omit=dev
#RUN npm install

# 소스코드 복사
COPY . .

# 빌드 시 NODE_ENV 명시
ENV NODE_ENV=production

# .env.local 삭제 (필요 시)
RUN rm -f .env.local

# .env.production.local을 .env로 복사
COPY .env.production.local .env

# Next.js 빌드
RUN npm run build

# 실행 이미지 단계
FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 단계에서 필요한 파일만 복사
COPY --from=builder /app /app

# 노드 모듈 확인
RUN ls -la node_modules

# 기본 실행 명령어 설정
CMD ["npm", "start"]
