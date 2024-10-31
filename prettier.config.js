/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
    plugins: ["prettier-plugin-tailwindcss"],
  
    // 기본 스타일 설정
    singleQuote: false, // 작은 따옴표 사용 안함
    semi: false, // 세미콜론 없음
    tabWidth: 2, // 탭 너비 설정
    useTabs: false, // 공백으로 들여쓰기
    trailingComma: "all", // 가능한 모든 곳에 trailing comma를 추가
    arrowParens: "always", // 화살표 함수의 매개변수에 괄호 추가
    printWidth: 100, // 줄바꿈 길이 설정
    bracketSpacing: true, // 객체 리터럴 중괄호 사이 공백
    jsxSingleQuote: false, // JSX에서 작은 따옴표 사용하지 않음
    endOfLine: "lf", // 개행 문자 통일 (Linux, macOS 호환)
    embeddedLanguageFormatting: "auto", // HTML 내 포함된 코드 포맷팅
    htmlWhitespaceSensitivity: "css", // HTML에서 CSS에 따른 공백 처리
    jsxBracketSameLine: false, // JSX에서 `>`를 새로운 줄에 위치하지 않음
    proseWrap: "preserve", // Markdown에서 원래 줄바꿈 유지
    quoteProps: "as-needed", // 필요한 경우만 따옴표
    vueIndentScriptAndStyle: false, // Vue 파일의 <script>와 <style>에 들여쓰기 안함
  
    // 추가 설정
    overrides: [
      {
        files: "*.md",
        options: {
          proseWrap: "always",
        },
      },
    ],
  }
  
  export default config
  