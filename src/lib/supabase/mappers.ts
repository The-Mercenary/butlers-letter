import type {
  MatchingCard,
  MatchingCardImage,
  MatchingCardImageRow,
  MatchingCardRow,
  SocialAccount,
  SocialAccountRow,
} from "@/types/card";
import type { UserProfile, UserProfileRow } from "@/types/user";

export function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    gender: row.gender,
    birthDate: row.birth_date,
    birthTimeCode: row.birth_time_code,
    phone: row.phone,
    sido: row.sido,
    sigungu: row.sigungu,
    agreedTerms: row.agreed_terms,
    agreedPrivacy: row.agreed_privacy,
    agreedSensitiveInfo: row.agreed_sensitive_info,
    agreedThirdParty: row.agreed_third_party,
    agreedAgeOver19: row.agreed_age_over_19,
    agreedMarketing: row.agreed_marketing,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMatchingCard(row: MatchingCardRow): MatchingCard {
  return {
    id: row.id,
    userId: row.user_id,
    cardName: row.card_name,
    status: row.status,
    mainImageUrl: row.main_image_url ?? "",
    educationLevel: row.education_level ?? "",
    jobType: row.job_type ?? "",
    preferredAgeRanges: row.preferred_age_ranges ?? [],
    marriageTimelines: row.marriage_timelines ?? [],
    partnerPriority: row.partner_priority ?? [],
    reasonsForUse: row.reasons_for_use ?? [],
    preferredRegions: row.preferred_regions ?? [],
    agreedCardDisclosure: row.agreed_card_disclosure,
    agreedContactDisclosure: row.agreed_contact_disclosure,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMatchingCardImage(row: MatchingCardImageRow): MatchingCardImage {
  return {
    id: row.id,
    cardId: row.card_id,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function toSocialAccount(row: SocialAccountRow): SocialAccount {
  return {
    id: row.id,
    cardId: row.card_id,
    platform: row.platform,
    urlOrId: row.url_or_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
