# Butler's Letter MVP

`Butler's Letter`는 사용자가 원하는 목적에 맞는 사람을 추천받고, 서로 동의한 경우에만 연락처를 교환할 수 있도록 준비한 프라이빗 인맥 추천 MVP입니다.

현재 구현 범위는 서비스 소개, Supabase Auth 기반 회원가입/로그인, 대시보드, 목적별 카드 CRUD, 이미지 업로드, 프로필 수정, 회원 탈퇴 준비 흐름입니다. 실제 추천 알고리즘, 상호 관심, 연락처 공개 자동화, 이메일 레터 발송, 결제, 관리자 검수 화면은 포함하지 않습니다.

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

## 서비스 포지셔닝

Butler's Letter는 목적 기반 인맥 추천 서비스입니다. 데이트, 취미, 동네친구, 업계 네트워크처럼 사용자가 원하는 관계 목적에 맞춰 사람을 신중하게 발견하는 경험을 지향합니다.

MVP에서는 홈 화면과 폼 문구를 인맥 추천 중심으로 정리했고, 가격 정책과 결제 안내는 노출하지 않습니다. 연락처는 양쪽이 모두 동의한 경우에만 공개되는 정책을 전제로 데이터 구조만 준비했습니다.

## 카드 목적 정책

- 카드 1개당 목적은 1개만 설정할 수 있습니다.
- 목적은 `industry_network`, `dating`, `local_friend`, `hobby_buddy` 중 하나입니다.
- 카드 목적은 생성 후 수정할 수 없습니다.
- 목적이 다른 인맥을 찾고 싶으면 새 카드를 생성해야 합니다.
- 목적 선택 전에는 상세 입력 폼을 보여주지 않습니다.
- 기존 카드에 목적값이 없는 경우에는 수정 화면에서 먼저 목적을 선택하도록 처리합니다.
- 이번 MVP에서는 실제 추천 로직을 구현하지 않으며, 추후 추천 로직은 `card_purpose` 기준으로 분기할 예정입니다.

목적별 입력 정보:

- 업계 네트워크: 현재 직종, 현재 직무, 경력 구간, 만나고 싶은 업계/직무, 기대하는 만남 유형
- 연애: 만나고 싶은 사람의 연령대, 선호 지역, 만남 희망 시점, 중요 조건 우선순위, 중요하게 생각하는 가치
- 동네친구: 선호 지역, 거리감, 선호 활동, 만남 가능 시간대
- 취미: 함께하고 싶은 취미, 숙련도, 선호 지역, 만남 가능 시간대, 원하는 참여 방식

## 추가된 데이터 필드

`user_profiles`

- `dong`: 거주지 읍/면/동. 기존 데이터 기본값은 `전체`입니다.
- `industry_type`: 회원 직종. 기존 데이터 기본값은 `기타`입니다.
- `agreed_saju_analysis`: 생년월일 및 태어난 시간 기반 성향 정보 생성/활용 동의 여부입니다.

`matching_cards`

- `card_purpose`: 카드 단일 목적입니다. 기존 카드 호환을 위해 DB에서는 nullable이며, 신규 저장은 클라이언트 validation에서 필수로 처리합니다.
- `self_introduction`: 카드별 자기소개입니다.
- `meeting_timelines`: 만남 희망 시점입니다.
- `preferred_regions`: `{ sido, sigungu, dong }` 배열입니다. `dong = '전체'`는 해당 시/군/구 전체를 의미합니다.
- `industry_role`, `career_range`, `desired_industry_roles`, `network_meeting_types`
- `dating_values`
- `local_distance`, `local_activities`, `available_times`
- `hobby_ids`, `hobby_level`, `hobby_participation_types`

## 사주 정보 저장 구조

`saju_profiles` 테이블을 추가했습니다.

- `calendar_type`: MVP에서는 `solar`만 사용합니다.
- `birth_date`, `birth_time_code`: 회원 기본 정보에서 동기화합니다.
- `day_pillar`, `personality_summary`, `dating_points`, `compatibility_keywords`, `raw_result`: 추후 계산 결과 저장을 위한 확장 필드입니다.
- `calculated_at`: 실제 계산 시점을 저장하기 위한 필드입니다.

현재 `calculateSajuProfile()`은 stub 함수입니다. 정확한 계산 기준, 절기 처리, 시주 계산 기준, 양력/음력 처리 기준을 확정하기 전까지 사용자 화면에 해석 결과를 노출하지 않습니다. MVP에서는 저장 구조만 준비하고, 부정확한 결과를 임의로 표시하지 않습니다.

## Supabase 설정

1. Supabase 프로젝트를 생성합니다.
2. 새 프로젝트라면 [supabase/schema.sql](./supabase/schema.sql)을 실행합니다.
3. 기존 프로젝트라면 [supabase/migrations/202604260001_private_network_positioning.sql](./supabase/migrations/202604260001_private_network_positioning.sql)을 실행합니다.
4. Authentication 설정에서 Email provider를 켭니다.
5. Email confirmation을 활성화합니다.
6. Authentication > URL Configuration에 아래 값을 등록합니다.
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`
   - Vercel 배포 후: `https://your-domain.com/api/auth/callback`

회원가입 폼은 프로필 정보를 `auth.users.raw_user_meta_data`에 함께 전달합니다. `schema.sql`의 `handle_new_user_profile()` 트리거가 이메일 인증 전 세션이 없는 상황에서도 `user_profiles`를 생성할 수 있게 준비되어 있습니다.

## RLS와 Storage 정책

`schema.sql`에는 다음 정책이 포함되어 있습니다.

- 사용자는 본인의 `user_profiles`만 조회/수정/삭제할 수 있습니다.
- 사용자는 본인의 `matching_cards`만 조회/생성/수정/삭제할 수 있습니다.
- 사용자는 본인의 `saju_profiles`만 조회/생성/수정할 수 있습니다.
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

## 환경변수

`.env.local`에 아래 값을 설정합니다.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY`는 회원 탈퇴 API에서 Supabase Auth 사용자 삭제를 처리할 때만 서버에서 사용합니다. 브라우저에 노출하면 안 됩니다.

## 회원 탈퇴

회원 탈퇴 버튼은 `/api/account/delete`를 호출합니다. 이 API는 서버에서 `SUPABASE_SERVICE_ROLE_KEY`로 다음 작업을 수행합니다.

- 카드 대표 이미지와 추가 이미지 삭제
- 소셜 계정, 이미지 row, 카드 row 삭제
- `user_profiles` 삭제
- Supabase Auth 사용자 삭제

운영 환경에서는 같은 로직을 Supabase Edge Function으로 분리해도 됩니다.

## 남은 과제

- 실제 추천 알고리즘
- 상호 관심 플로우
- 연락처 공개 자동화
- 이메일 레터 예약 발송
- 결제와 이용 정책
- 관리자 검수 페이지
- 지역 읍/면/동 데이터셋 확장
- private Storage와 signed URL 기반 이미지 제공
- 신고/차단
