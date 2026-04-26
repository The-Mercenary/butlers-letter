import type { CardStatus, EducationLevel, JobType, SocialPlatform } from "@/types/card";

export const LETTER_PRICE_KRW = 80000;

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

export const MARRIAGE_TIMELINE_OPTIONS = [
  "빠를수록 좋음",
  "6개월 이내",
  "1년 이내",
  "2년 이내",
  "3년 이내",
  "5년 이내",
  "상관 없음",
];

export const DEFAULT_PARTNER_PRIORITIES = [
  "외모",
  "성격",
  "건강",
  "경제력",
  "좋은 직업",
  "집안 환경",
  "나이차",
];

export const REASON_OPTIONS = ["만날 상대 없음", "눈이 높은 편", "만남이 귀찮음", "너무 바쁨", "경제적 문제", "해당 없음"];

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
