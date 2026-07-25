# Link Hub

첫 화면에서 원하는 사이트로 바로 이동시켜주는 링크 모음 페이지 + bit.ly 스타일 URL 단축기.

## 스택

- **Next.js (App Router) + TypeScript + Tailwind CSS** — 소규모 정적/서버리스 사이트에 적합
- **Supabase (Postgres)** — 단축 URL의 `slug → target_url` 매핑 저장
- **Vercel** — 무료 배포

## 구조

- `src/lib/links.ts` — 첫 화면에 보여줄 링크 목록 (직접 코드에서 수정)
- `src/app/page.tsx` — 링크 목록 + URL 단축기 폼
- `src/app/ShortenerForm.tsx` — 단축기 클라이언트 폼 (복사 버튼 포함)
- `src/app/api/shorten/route.ts` — URL을 받아 랜덤 slug 생성 후 Supabase에 저장
- `src/app/[slug]/route.ts` — `/{slug}` 접속 시 Supabase에서 조회해 원래 URL로 리다이렉트
- `src/lib/supabase.ts` — Supabase 클라이언트

링크 목록을 바꾸려면 `src/lib/links.ts` 파일의 배열만 수정하면 됩니다.

## 로컬 개발

```bash
npm install
npm run dev
```

`.env.local`에 아래 값이 필요합니다 (이미 생성되어 있음):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase

프로젝트 `link-hub` (region: `ap-northeast-2`)에 `short_links` 테이블이 이미 생성되어 있습니다:

- `slug text unique` — 단축 코드
- `target_url text` — 원본 URL
- `click_count integer` — 향후 클릭 수 집계용 (현재는 미사용, 기본값 0)

RLS는 `anon` 역할에 대해 `insert`/`select`만 허용합니다. `update`는 열어두지 않았는데, 열면 누구나 REST API로 기존 slug의 target_url을 바꿔치기할 수 있기 때문입니다. 클릭 수를 실제로 세고 싶다면 anon이 아닌 서버 전용 키(service role)를 쓰는 API 라우트에서 증가시키는 방식을 권장합니다.

## Vercel 배포

1. 이 저장소를 GitHub에 올리고 Vercel에서 Import
2. Vercel 프로젝트 설정 → Environment Variables에 `.env.local`과 동일한 3개 값 추가
   - `NEXT_PUBLIC_SITE_URL`은 배포 후 실제 도메인(예: `https://link-hub.vercel.app`)으로 변경
3. Deploy

배포 후에는 생성되는 단축 링크가 실제 배포 도메인 기준으로 만들어집니다 (`ShortenerForm`이 `window.location.origin`을 사용하므로 별도 설정 없이 자동 반영됩니다).
