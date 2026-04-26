# Butler's Letter MVP

`Butler's Letter`는 결혼을 전제로 한 진지한 만남을 원하는 사용자가 회원가입 후 본인의 매칭 카드를 만들고 관리할 수 있는 프라이빗 매칭 레터 MVP입니다.

이번 구현 범위는 서비스 소개, Supabase Auth 기반 회원가입/로그인, 대시보드, 카드 CRUD, 이미지 업로드, 프로필 수정, 회원 탈퇴 준비 흐름입니다. 실제 매칭 알고리즘, AI 분석, 사주 분석, 이메일 레터 발송, 결제, 상호 관심 매칭, 관리자 검수 화면은 포함하지 않습니다.

## 기술 스택

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage
- Vercel 배포 가능 구조

## 실행 방법

```bash
npm install
cp .env.example .env.local
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

권장 Node 버전은 18.18 이상 또는 20 LTS입니다. 현재 패키지는 Next.js 14.2.35를 사용하며 Node 18.17 이상에서 동작하도록 구성했습니다.

## 보안 및 버전 메모

현재 로컬 Node가 18.17.1인 환경을 고려해 Next.js 14 계열로 구현했습니다. `npm audit --omit=dev`는 Next.js 14 계열에 대한 보안 권고를 보고하며, 자동 수정은 Next.js 16과 Node 20 이상을 요구합니다. 실제 운영 배포 전에는 Node 20 LTS로 올린 뒤 Next.js 최신 안정 버전으로 업그레이드하는 것을 권장합니다.

## 환경변수

`.env.local`에 아래 값을 설정합니다.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY`는 회원 탈퇴 API에서 Supabase Auth 사용자 삭제를 처리할 때만 서버에서 사용합니다. 브라우저에 노출하면 안 됩니다.

## Supabase 설정

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 [supabase/schema.sql](./supabase/schema.sql)을 실행합니다.
3. Authentication 설정에서 Email provider를 켭니다.
4. Email confirmation을 활성화합니다.
5. Authentication > URL Configuration에 아래 값을 등록합니다.
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`
   - Vercel 배포 후: `https://your-domain.com/api/auth/callback`

회원가입 폼은 프로필 정보를 `auth.users.raw_user_meta_data`에 함께 전달합니다. `schema.sql`의 `handle_new_user_profile()` 트리거가 이메일 인증 전 세션이 없는 상황에서도 `user_profiles`를 생성할 수 있게 준비되어 있습니다.

## RLS와 Storage 정책

`schema.sql`에는 다음 정책이 포함되어 있습니다.

- 사용자는 본인의 `user_profiles`만 조회/수정/삭제할 수 있습니다.
- 사용자는 본인의 `matching_cards`만 조회/생성/수정/삭제할 수 있습니다.
- 추가 이미지와 소셜 계정은 연결된 카드의 소유자만 관리할 수 있습니다.
- Storage 업로드 경로는 `{auth.uid()}/파일명` 구조를 사용하며, 해당 사용자만 업로드/수정/삭제할 수 있습니다.

MVP에서는 Storage bucket을 public으로 생성하고 DB RLS로 카드 노출을 제한합니다. 실제 운영에서는 bucket을 private으로 전환하고 signed URL 또는 서버 프록시 방식으로 이미지를 내려주는 구성을 권장합니다.

## 구현된 라우트

- `/`: 홈 페이지
- `/login`: 로그인
- `/signup`: 회원가입
- `/dashboard`: 개인 대시보드
- `/dashboard/cards`: 내 카드 목록
- `/dashboard/cards/new`: 새 카드 생성
- `/dashboard/cards/[cardId]`: 카드 상세
- `/dashboard/cards/[cardId]/edit`: 카드 수정
- `/dashboard/received`: 전달받은 카드 빈 상태
- `/dashboard/settings`: 계정 설정
- `/dashboard/settings/profile`: 회원 정보 조회/수정
- `/dashboard/settings/delete-account`: 회원 탈퇴 준비 흐름

비로그인 사용자가 `/dashboard` 하위 경로에 접근하면 `/login`으로 이동합니다. 로그인 사용자가 `/`, `/login`, `/signup`에 접근하면 `/dashboard`로 이동합니다.

## 회원 탈퇴

회원 탈퇴 버튼은 `/api/account/delete`를 호출합니다. 이 API는 서버에서 `SUPABASE_SERVICE_ROLE_KEY`로 다음 작업을 수행합니다.

- 카드 대표 이미지와 추가 이미지 삭제
- 소셜 계정, 이미지 row, 카드 row 삭제
- `user_profiles` 삭제
- Supabase Auth 사용자 삭제

운영 환경에서는 같은 로직을 Supabase Edge Function으로 분리해도 됩니다.

## 남은 과제

- 실제 매칭 Pool 운영 로직
- 이메일 레터 예약 발송
- 결제와 횟수 차감 정책
- 관리자 검수 페이지
- 본인인증 및 증빙 검증
- private Storage와 signed URL 기반 이미지 제공
- 신고/차단, 상호 관심, 연락처 공개 플로우
