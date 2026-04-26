import type { EducationLevel, JobType, PreferredRegion, SocialPlatform } from "@/types/card";
import {
  AGE_RANGE_OPTIONS,
  DEFAULT_PARTNER_PRIORITIES,
  MARRIAGE_TIMELINE_OPTIONS,
  REASON_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
} from "@/lib/constants/cardOptions";
import { getSigunguOptions } from "@/lib/constants/regions";

export interface SocialAccountInput {
  platform: SocialPlatform;
  urlOrId: string;
}

export interface CardFormValues {
  cardName: string;
  mainImageUrl: string;
  educationLevel: EducationLevel | "";
  jobType: JobType | "";
  preferredAgeRanges: string[];
  marriageTimelines: string[];
  partnerPriority: string[];
  reasonsForUse: string[];
  preferredRegions: PreferredRegion[];
  agreedCardDisclosure: boolean;
  agreedContactDisclosure: boolean;
  additionalImageUrls: string[];
  socialAccounts: SocialAccountInput[];
}

export type CardValidationKey = keyof CardFormValues;
export type CardValidationErrors = Partial<Record<CardValidationKey, string>>;

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 6;

export const EMPTY_CARD_FORM_VALUES: CardFormValues = {
  cardName: "",
  mainImageUrl: "",
  educationLevel: "",
  jobType: "",
  preferredAgeRanges: [],
  marriageTimelines: [],
  partnerPriority: DEFAULT_PARTNER_PRIORITIES,
  reasonsForUse: [],
  preferredRegions: [],
  agreedCardDisclosure: false,
  agreedContactDisclosure: false,
  additionalImageUrls: [],
  socialAccounts: [],
};

export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "png, jpg, jpeg, webp 파일만 업로드할 수 있습니다.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "이미지는 파일당 최대 5MB까지 업로드할 수 있습니다.";
  }

  return "";
}

export function validateCard(values: CardFormValues, options: { draft?: boolean } = {}) {
  const errors: CardValidationErrors = {};

  if (!values.cardName.trim()) {
    if (!options.draft) errors.cardName = "카드 이름을 입력해 주세요.";
  } else if (!/^[A-Za-z0-9가-힣\s]{2,12}$/.test(values.cardName.trim())) {
    errors.cardName = "카드 이름은 한글, 영문, 숫자 2~12자로 입력해 주세요.";
  }

  if (!options.draft) {
    if (!values.mainImageUrl) errors.mainImageUrl = "대표 프로필 이미지를 등록해 주세요.";
    if (!values.educationLevel) errors.educationLevel = "최종 학력을 선택해 주세요.";
    if (!values.jobType) errors.jobType = "현재 직업을 선택해 주세요.";
    if (values.preferredAgeRanges.length === 0) errors.preferredAgeRanges = "매칭 가능 연령대를 선택해 주세요.";
    if (values.marriageTimelines.length === 0) errors.marriageTimelines = "결혼 희망 시기를 선택해 주세요.";
    if (values.partnerPriority.length !== DEFAULT_PARTNER_PRIORITIES.length) errors.partnerPriority = "상대방 조건 우선순위를 모두 정렬해 주세요.";
    if (values.reasonsForUse.length === 0) errors.reasonsForUse = "이 서비스를 찾는 이유를 선택해 주세요.";
    if (values.preferredRegions.length === 0) errors.preferredRegions = "희망하는 상대 거주지를 하나 이상 선택해 주세요.";
    if (!values.agreedCardDisclosure) errors.agreedCardDisclosure = "카드 정보 일부 공개에 동의해 주세요.";
    if (!values.agreedContactDisclosure) errors.agreedContactDisclosure = "상호 관심 시 추가 정보 공개에 동의해 주세요.";
  }

  if (values.preferredAgeRanges.length > 4) {
    errors.preferredAgeRanges = "매칭 가능 연령대는 최대 4개까지 선택할 수 있습니다.";
  }

  if (values.preferredAgeRanges.some((value) => !AGE_RANGE_OPTIONS.includes(value))) {
    errors.preferredAgeRanges = "허용되지 않은 연령대가 포함되어 있습니다.";
  }

  if (values.marriageTimelines.length > 2) {
    errors.marriageTimelines = "결혼 희망 시기는 최대 2개까지 선택할 수 있습니다.";
  }

  if (values.marriageTimelines.some((value) => !MARRIAGE_TIMELINE_OPTIONS.includes(value))) {
    errors.marriageTimelines = "허용되지 않은 결혼 희망 시기가 포함되어 있습니다.";
  }

  if (values.reasonsForUse.some((value) => !REASON_OPTIONS.includes(value))) {
    errors.reasonsForUse = "허용되지 않은 사유가 포함되어 있습니다.";
  }

  if (values.additionalImageUrls.length > MAX_GALLERY_IMAGES) {
    errors.additionalImageUrls = "추가 이미지는 최대 6장까지 등록할 수 있습니다.";
  }

  if (
    values.preferredRegions.some(
      (region) => !region.sido || !region.sigungu || !getSigunguOptions(region.sido).includes(region.sigungu),
    )
  ) {
    errors.preferredRegions = "희망 지역 중 올바르지 않은 값이 있습니다.";
  }

  if (
    values.socialAccounts.some(
      (account) =>
        !SOCIAL_PLATFORM_OPTIONS.some((option) => option.value === account.platform) ||
        account.urlOrId.trim().length > 300,
    )
  ) {
    errors.socialAccounts = "소셜 계정 정보를 확인해 주세요.";
  }

  return errors;
}
