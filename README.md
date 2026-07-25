# Link Hub

네이버 첫화면 스타일의 카테고리별 북마크 모음 + bit.ly 스타일 URL 단축기.

## 스택

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Supabase (Postgres)** — 카테고리/북마크/단축 URL 저장
- **@dnd-kit** — 카테고리·북마크 드래그 순서 변경
- **Vercel** — 배포

## 구조

- `src/app/page.tsx` — 서버 컴포넌트. Supabase에서 카테고리+북마크를 읽어 `BookmarkBoard`에 전달
- `src/app/BookmarkBoard.tsx` — 편집 모드, 드래그앤드롭(카테고리 순서 + 북마크 순서/카테고리 간 이동) 오케스트레이션
- `src/app/CategoryCard.tsx` / `src/app/BookmarkItem.tsx` — 카테고리 카드, 북마크 행 (각각 이름/URL 수정, 삭제 UI 포함)
- `src/app/PasswordModal.tsx` — 편집 비밀번호 입력 모달
- `src/app/ShortenerForm.tsx` — URL 단축기 폼 (홈 화면 상단에 고정 배치)
- `src/app/api/shorten`, `src/app/[slug]/route.ts` — 단축 URL 생성/리다이렉트
- `src/app/api/auth/*` — 편집 비밀번호 로그인/로그아웃/세션 확인 (서명된 httpOnly 쿠키)
- `src/app/api/categories/*`, `src/app/api/bookmarks/*` — 카테고리/북마크 CRUD + 순서 변경 API (편집 세션 필요)
- `src/lib/supabase.ts` — 클라이언트/공개 읽기용 (anon key)
- `src/lib/supabaseAdmin.ts` — 서버 전용 쓰기용 (service role key, RLS 우회)

## 권한 모델

로그인 시스템은 없고, 대신 **편집 비밀번호** 하나로 쓰기 작업을 보호합니다.

- Supabase RLS: `categories`/`bookmarks`/`short_links` 모두 `anon`은 **읽기(select)만** 가능 (short_links는 단축 링크 생성을 위해 insert도 허용).
- 카테고리/북마크의 생성·수정·삭제·순서변경은 전부 Next.js API 라우트에서 `SUPABASE_SERVICE_ROLE_KEY`(서버 전용, `NEXT_PUBLIC_` 아님)로 수행하며, 요청 전에 `EDIT_PASSWORD`로 발급한 서명된 쿠키를 검증합니다.
- 이렇게 해야 anon key가 공개되어 있어도(클라이언트 코드에 필연적으로 노출됨) 브라우저에서 Supabase REST API를 직접 호출해 데이터를 바꾸는 걸 막을 수 있습니다.

## 로컬 개발

```bash
npm install
npm run dev
```

`.env.local`에 아래 값이 필요합니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # 서버 전용, 절대 커밋/노출 금지
EDIT_PASSWORD=...               # 편집 모드 비밀번호
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase 테이블

```sql
-- short_links, categories, bookmarks 테이블 및 RLS 정책은
-- 프로젝트 설정 시 SQL Editor에서 한 번 실행해두면 됩니다.
```

- `short_links(id, slug, target_url, created_at, click_count)`
- `categories(id, name, position, created_at)`
- `bookmarks(id, category_id, label, url, position, created_at)`

## Vercel 배포

1. GitHub 저장소를 Vercel에서 Import (또는 `vercel --prod`)
2. Environment Variables에 위 5개 값 추가 (service role key와 edit password는 반드시 서버 전용으로 유지)
3. Deploy

`NEXT_PUBLIC_SITE_URL`은 정보성 값이며 실제 단축 링크는 `window.location.origin` 기준으로 만들어져 배포 도메인에 자동 반영됩니다.
