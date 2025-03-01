# 빌드 단계
FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json 및 package-lock.json 복사
COPY package.json package-lock.json ./

# 캐시 무효화를 위한 ARG 추가 (1은 ARG 전달되지 않을 경우 기본값)
ARG CACHEBUST=1
# npm 버전 확인
RUN echo "$CACHEBUST" && npm -version
RUN echo "$CACHEBUST" && node --version
RUN echo "$CACHEBUST" && npm cache clean --force
RUN rm -rf node_modules

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
#COPY --from=builder /app /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
#COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 노드 모듈 확인
# RUN ls -la node_modules

# 포트 환경 변수 설정 (여기서 PORT를 지정)
ENV PORT=53001

# 컨테이너 외부에 노출할 포트 지정
EXPOSE 53001

# 기본 실행 명령어 설정 (환경 변수 PORT를 사용)
CMD ["node", "server.js"]
