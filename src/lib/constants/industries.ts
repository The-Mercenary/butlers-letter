export const INDUSTRY_TYPES = [
  "IT/개발",
  "기획/전략",
  "디자인",
  "마케팅/광고",
  "영업/고객관리",
  "인사/교육",
  "재무/회계",
  "법률/전문직",
  "의료/보건",
  "교육/연구",
  "공공기관/공무원",
  "금융/보험",
  "제조/생산",
  "유통/물류",
  "미디어/콘텐츠",
  "창업/사업",
  "프리랜서",
  "학생",
  "기타",
] as const;

export type IndustryType = (typeof INDUSTRY_TYPES)[number];
