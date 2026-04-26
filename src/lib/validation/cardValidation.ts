import type { CardPurpose, EducationLevel, JobType, PreferredRegion, SocialPlatform } from "@/types/card";
import {
  AGE_RANGE_OPTIONS,
  AVAILABLE_TIME_OPTIONS,
  CAREER_RANGE_OPTIONS,
  DATING_VALUE_OPTIONS,
  DEFAULT_PARTNER_PRIORITIES,
  HOBBY_LEVEL_OPTIONS,
  HOBBY_PARTICIPATION_OPTIONS,
  INDUSTRY_ROLE_OPTIONS,
  LOCAL_ACTIVITY_OPTIONS,
  LOCAL_DISTANCE_OPTIONS,
  MEETING_TIMELINE_OPTIONS,
  NETWORK_MEETING_TYPE_OPTIONS,
  REASON_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
} from "@/lib/constants/cardOptions";
import { HOBBY_IDS } from "@/lib/constants/hobbies";
import { CARD_PURPOSE_IDS } from "@/lib/constants/recommendationPurposes";
import { getDongOptions, getSigunguOptions } from "@/lib/constants/regions";

export interface SocialAccountInput {
  platform: SocialPlatform;
  urlOrId: string;
}

export interface CardFormValues {
  cardPurpose: CardPurpose | "";
  cardName: string;
  mainImageUrl: string;
  selfIntroduction: string;
  educationLevel: EducationLevel | "";
  jobType: JobType | "";
  preferredAgeRanges: string[];
  meetingTimelines: string[];
  partnerPriority: string[];
  reasonsForUse: string[];
  preferredRegions: PreferredRegion[];
  industryRole: string;
  careerRange: string;
  desiredIndustryRoles: string[];
  networkMeetingTypes: string[];
  datingValues: string[];
  localDistance: string;
  localActivities: string[];
  availableTimes: string[];
  hobbyIds: string[];
  hobbyLevel: string;
  hobbyParticipationTypes: string[];
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
  cardPurpose: "",
  cardName: "",
  mainImageUrl: "",
  selfIntroduction: "",
  educationLevel: "",
  jobType: "",
  preferredAgeRanges: [],
  meetingTimelines: [],
  partnerPriority: DEFAULT_PARTNER_PRIORITIES,
  reasonsForUse: [],
  preferredRegions: [],
  industryRole: "",
  careerRange: "",
  desiredIndustryRoles: [],
  networkMeetingTypes: [],
  datingValues: [],
  localDistance: "",
  localActivities: [],
  availableTimes: [],
  hobbyIds: [],
  hobbyLevel: "",
  hobbyParticipationTypes: [],
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

function hasInvalidOption(values: string[], allowed: readonly string[]) {
  return values.some((value) => !allowed.includes(value));
}

export function getValuesForPurpose(values: CardFormValues): CardFormValues {
  const next = {
    ...values,
    cardName: values.cardName.trim(),
    selfIntroduction: values.selfIntroduction.trim(),
    socialAccounts: values.socialAccounts.filter((account) => account.urlOrId.trim()),
  };

  if (values.cardPurpose !== "industry_network") {
    next.industryRole = "";
    next.careerRange = "";
    next.desiredIndustryRoles = [];
    next.networkMeetingTypes = [];
  }

  if (values.cardPurpose !== "dating") {
    next.preferredAgeRanges = [];
    next.meetingTimelines = [];
    next.partnerPriority = DEFAULT_PARTNER_PRIORITIES;
    next.datingValues = [];
  }

  if (values.cardPurpose !== "local_friend") {
    next.localDistance = "";
    next.localActivities = [];
  }

  if (values.cardPurpose !== "local_friend" && values.cardPurpose !== "hobby_buddy") {
    next.availableTimes = [];
  }

  if (values.cardPurpose !== "hobby_buddy") {
    next.hobbyIds = [];
    next.hobbyLevel = "";
    next.hobbyParticipationTypes = [];
  }

  return next;
}

export function validateCard(values: CardFormValues, options: { draft?: boolean } = {}) {
  const errors: CardValidationErrors = {};

  if (!values.cardPurpose || !CARD_PURPOSE_IDS.includes(values.cardPurpose)) {
    errors.cardPurpose = "카드 목적을 선택해 주세요.";
  }

  if (!values.cardName.trim()) {
    if (!options.draft) errors.cardName = "카드 이름을 입력해 주세요.";
  } else if (!/^[A-Za-z0-9가-힣\s]{2,12}$/.test(values.cardName.trim())) {
    errors.cardName = "카드 이름은 한글, 영문, 숫자 2~12자로 입력해 주세요.";
  }

  if (values.selfIntroduction.trim().length > 600) {
    errors.selfIntroduction = "자기소개는 600자 이내로 입력해 주세요.";
  }

  if (!options.draft) {
    if (!values.mainImageUrl) errors.mainImageUrl = "대표 프로필 이미지를 등록해 주세요.";
    if (values.selfIntroduction.trim().length < 20) errors.selfIntroduction = "자기소개를 20자 이상 입력해 주세요.";
    if (!values.agreedCardDisclosure) errors.agreedCardDisclosure = "카드 공개에 동의해 주세요.";
    if (!values.agreedContactDisclosure) errors.agreedContactDisclosure = "상호 동의 시 연락처 공개에 동의해 주세요.";

    if (values.cardPurpose === "industry_network") {
      if (!values.industryRole) errors.industryRole = "현재 직무를 선택해 주세요.";
      if (!values.careerRange) errors.careerRange = "경력 구간을 선택해 주세요.";
      if (values.desiredIndustryRoles.length === 0) errors.desiredIndustryRoles = "만나고 싶은 업계/직무를 선택해 주세요.";
      if (values.networkMeetingTypes.length === 0) errors.networkMeetingTypes = "기대하는 만남 유형을 선택해 주세요.";
    }

    if (values.cardPurpose === "dating") {
      if (values.preferredAgeRanges.length === 0) errors.preferredAgeRanges = "만나고 싶은 사람의 연령대를 선택해 주세요.";
      if (values.preferredRegions.length === 0) errors.preferredRegions = "선호 지역을 하나 이상 선택해 주세요.";
      if (values.meetingTimelines.length === 0) errors.meetingTimelines = "만남 희망 시점을 선택해 주세요.";
      if (values.partnerPriority.length !== DEFAULT_PARTNER_PRIORITIES.length) errors.partnerPriority = "중요하게 보는 조건을 모두 정렬해 주세요.";
      if (values.datingValues.length === 0) errors.datingValues = "중요하게 생각하는 가치를 선택해 주세요.";
    }

    if (values.cardPurpose === "local_friend") {
      if (values.preferredRegions.length === 0) errors.preferredRegions = "선호 지역을 하나 이상 선택해 주세요.";
      if (!values.localDistance) errors.localDistance = "만나고 싶은 거리감을 선택해 주세요.";
      if (values.localActivities.length === 0) errors.localActivities = "선호 활동을 선택해 주세요.";
      if (values.availableTimes.length === 0) errors.availableTimes = "만남 가능 시간대를 선택해 주세요.";
    }

    if (values.cardPurpose === "hobby_buddy") {
      if (values.hobbyIds.length === 0) errors.hobbyIds = "함께하고 싶은 취미를 선택해 주세요.";
      if (!values.hobbyLevel) errors.hobbyLevel = "취미 숙련도를 선택해 주세요.";
      if (values.preferredRegions.length === 0) errors.preferredRegions = "선호 지역을 하나 이상 선택해 주세요.";
      if (values.availableTimes.length === 0) errors.availableTimes = "만남 가능 시간대를 선택해 주세요.";
      if (values.hobbyParticipationTypes.length === 0) errors.hobbyParticipationTypes = "원하는 참여 방식을 선택해 주세요.";
    }
  }

  if (values.preferredAgeRanges.length > 4) {
    errors.preferredAgeRanges = "연령대는 최대 4개까지 선택할 수 있습니다.";
  }

  if (hasInvalidOption(values.preferredAgeRanges, AGE_RANGE_OPTIONS)) {
    errors.preferredAgeRanges = "허용되지 않은 연령대가 포함되어 있습니다.";
  }

  if (values.meetingTimelines.length > 2) {
    errors.meetingTimelines = "만남 희망 시점은 최대 2개까지 선택할 수 있습니다.";
  }

  if (hasInvalidOption(values.meetingTimelines, MEETING_TIMELINE_OPTIONS)) {
    errors.meetingTimelines = "허용되지 않은 만남 희망 시점이 포함되어 있습니다.";
  }

  if (hasInvalidOption(values.reasonsForUse, REASON_OPTIONS)) {
    errors.reasonsForUse = "허용되지 않은 설명 항목이 포함되어 있습니다.";
  }

  if (
    values.industryRole &&
    !INDUSTRY_ROLE_OPTIONS.includes(values.industryRole)
  ) {
    errors.industryRole = "현재 직무를 확인해 주세요.";
  }

  if (values.careerRange && !CAREER_RANGE_OPTIONS.includes(values.careerRange)) {
    errors.careerRange = "경력 구간을 확인해 주세요.";
  }

  if (hasInvalidOption(values.desiredIndustryRoles, INDUSTRY_ROLE_OPTIONS)) {
    errors.desiredIndustryRoles = "만나고 싶은 업계/직무를 확인해 주세요.";
  }

  if (hasInvalidOption(values.networkMeetingTypes, NETWORK_MEETING_TYPE_OPTIONS)) {
    errors.networkMeetingTypes = "기대하는 만남 유형을 확인해 주세요.";
  }

  if (hasInvalidOption(values.datingValues, DATING_VALUE_OPTIONS)) {
    errors.datingValues = "연애 가치 항목을 확인해 주세요.";
  }

  if (values.localDistance && !LOCAL_DISTANCE_OPTIONS.includes(values.localDistance)) {
    errors.localDistance = "거리감 항목을 확인해 주세요.";
  }

  if (hasInvalidOption(values.localActivities, LOCAL_ACTIVITY_OPTIONS)) {
    errors.localActivities = "선호 활동 항목을 확인해 주세요.";
  }

  if (hasInvalidOption(values.availableTimes, AVAILABLE_TIME_OPTIONS)) {
    errors.availableTimes = "만남 가능 시간대를 확인해 주세요.";
  }

  if (hasInvalidOption(values.hobbyIds, HOBBY_IDS)) {
    errors.hobbyIds = "취미 항목을 확인해 주세요.";
  }

  if (values.hobbyLevel && !HOBBY_LEVEL_OPTIONS.includes(values.hobbyLevel)) {
    errors.hobbyLevel = "취미 숙련도를 확인해 주세요.";
  }

  if (hasInvalidOption(values.hobbyParticipationTypes, HOBBY_PARTICIPATION_OPTIONS)) {
    errors.hobbyParticipationTypes = "참여 방식 항목을 확인해 주세요.";
  }

  if (values.additionalImageUrls.length > MAX_GALLERY_IMAGES) {
    errors.additionalImageUrls = "추가 이미지는 최대 6장까지 등록할 수 있습니다.";
  }

  if (
    values.preferredRegions.some(
      (region) =>
        !region.sido ||
        !region.sigungu ||
        !region.dong ||
        !getSigunguOptions(region.sido).includes(region.sigungu) ||
        !getDongOptions(region.sido, region.sigungu).includes(region.dong),
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
