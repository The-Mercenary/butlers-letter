import type { CardStatus, EducationLevel, JobType, SocialPlatform } from "@/types/card";

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  draft: "작성 중",
  active: "참여 중",
  inactive: "참여 안함",
};

export const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "고등학교 졸업" },
  { value: "college", label: "전문대학교 졸업" },
  { value: "university", label: "대학교 졸업" },
  { value: "master", label: "대학원 석사 졸업" },
  { value: "doctor", label: "박사 이상" },
  { value: "none", label: "해당 없음" },
];

export const JOB_OPTIONS: { value: JobType; label: string }[] = [
  { value: "professional", label: "전문직" },
  { value: "public_sector", label: "공무원/공기업" },
  { value: "office_worker", label: "직장인" },
  { value: "business_owner", label: "사업" },
  { value: "freelancer", label: "프리랜서" },
  { value: "other", label: "기타" },
];

export const AGE_RANGE_OPTIONS = ["20~24", "25~29", "30~34", "35~39", "40~44", "45~49", "50대 이상"];

export const MEETING_TIMELINE_OPTIONS = [
  "가능한 빨리",
  "1개월 이내",
  "3개월 이내",
  "6개월 이내",
  "천천히 알아가고 싶음",
  "상관 없음",
];

export const DEFAULT_PARTNER_PRIORITIES = [
  "외모",
  "성격",
  "대화 코드",
  "생활 패턴",
  "경제관념",
  "건강한 관계관",
  "거리",
  "나이차",
];

export const REASON_OPTIONS = ["새로운 사람 발견", "관심사 공유", "가벼운 대화", "커리어 교류", "지역 기반 만남", "해당 없음"];

export const INDUSTRY_ROLE_OPTIONS = [
  "기획/전략",
  "개발",
  "디자인",
  "마케팅",
  "영업",
  "운영",
  "인사",
  "재무/회계",
  "법무",
  "의료/보건",
  "교육/연구",
  "창업/사업",
  "프리랜서",
  "기타",
];

export const CAREER_RANGE_OPTIONS = ["신입", "1~3년", "4~7년", "8~12년", "13년 이상"];

export const NETWORK_MEETING_TYPE_OPTIONS = [
  "커리어 조언",
  "업계 정보 교류",
  "사이드프로젝트",
  "창업/사업 이야기",
  "이직/채용 정보",
  "가벼운 네트워킹",
];

export const DATING_VALUE_OPTIONS = [
  "진지한 관계",
  "편안한 대화",
  "비슷한 생활 패턴",
  "취향 공유",
  "성장 지향",
  "신뢰",
  "유머 코드",
  "장기적인 가능성",
];

export const LOCAL_DISTANCE_OPTIONS = ["같은 동네", "같은 구/시군", "대중교통 30분 이내", "상관 없음"];

export const LOCAL_ACTIVITY_OPTIONS = [
  "카페",
  "산책",
  "맛집",
  "운동",
  "영화",
  "전시/공연",
  "공부/작업",
  "동네 정보 공유",
  "가벼운 대화",
];

export const AVAILABLE_TIME_OPTIONS = [
  "평일 오전",
  "평일 오후",
  "평일 저녁",
  "주말 오전",
  "주말 오후",
  "주말 저녁",
  "상관 없음",
];

export const HOBBY_LEVEL_OPTIONS = ["처음 시작", "초보", "중급", "상급", "상관 없음"];

export const HOBBY_PARTICIPATION_OPTIONS = [
  "같이 배우기",
  "정기적으로 함께하기",
  "가끔 시간 맞을 때",
  "모임 만들기",
  "정보 공유",
];

export const SOCIAL_PLATFORM_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: "linkedin", label: "링크드인" },
  { value: "instagram", label: "인스타그램" },
  { value: "x", label: "X(트위터)" },
  { value: "facebook", label: "페이스북" },
  { value: "blog", label: "블로그" },
  { value: "other", label: "기타" },
];

export function getEducationLabel(value: EducationLevel | "") {
  return EDUCATION_OPTIONS.find((option) => option.value === value)?.label ?? "-";
}

export function getJobLabel(value: JobType | "") {
  return JOB_OPTIONS.find((option) => option.value === value)?.label ?? "-";
}

export function getSocialPlatformLabel(value: SocialPlatform) {
  return SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === value)?.label ?? "기타";
}
