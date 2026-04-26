export type CardStatus = "draft" | "active" | "inactive";

export type EducationLevel =
  | "high_school"
  | "college"
  | "university"
  | "master"
  | "doctor"
  | "none";

export type JobType =
  | "professional"
  | "public_sector"
  | "office_worker"
  | "business_owner"
  | "freelancer"
  | "other";

export type SocialPlatform =
  | "linkedin"
  | "instagram"
  | "x"
  | "facebook"
  | "blog"
  | "other";

export interface PreferredRegion {
  sido: string;
  sigungu: string;
}

export interface MatchingCard {
  id: string;
  userId: string;
  cardName: string;
  status: CardStatus;
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
  createdAt: string;
  updatedAt: string;
}

export interface MatchingCardRow {
  id: string;
  user_id: string;
  card_name: string;
  status: CardStatus;
  main_image_url: string | null;
  education_level: EducationLevel | null;
  job_type: JobType | null;
  preferred_age_ranges: string[] | null;
  marriage_timelines: string[] | null;
  partner_priority: string[] | null;
  reasons_for_use: string[] | null;
  preferred_regions: PreferredRegion[] | null;
  agreed_card_disclosure: boolean;
  agreed_contact_disclosure: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchingCardImage {
  id: string;
  cardId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface MatchingCardImageRow {
  id: string;
  card_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface SocialAccount {
  id: string;
  cardId: string;
  platform: SocialPlatform;
  urlOrId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccountRow {
  id: string;
  card_id: string;
  platform: SocialPlatform;
  url_or_id: string;
  created_at: string;
  updated_at: string;
}
