export type CardStatus = "draft" | "active" | "inactive";

export type CardPurpose = "industry_network" | "dating" | "local_friend" | "hobby_buddy";

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
  dong: string;
}

export interface MatchingCard {
  id: string;
  userId: string;
  cardPurpose: CardPurpose | "";
  cardName: string;
  status: CardStatus;
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
  createdAt: string;
  updatedAt: string;
}

export interface MatchingCardRow {
  id: string;
  user_id: string;
  card_purpose: CardPurpose | null;
  card_name: string;
  status: CardStatus;
  main_image_url: string | null;
  self_introduction: string | null;
  education_level: EducationLevel | null;
  job_type: JobType | null;
  preferred_age_ranges: string[] | null;
  meeting_timelines: string[] | null;
  partner_priority: string[] | null;
  reasons_for_use: string[] | null;
  preferred_regions: PreferredRegion[] | null;
  industry_role: string | null;
  career_range: string | null;
  desired_industry_roles: string[] | null;
  network_meeting_types: string[] | null;
  dating_values: string[] | null;
  local_distance: string | null;
  local_activities: string[] | null;
  available_times: string[] | null;
  hobby_ids: string[] | null;
  hobby_level: string | null;
  hobby_participation_types: string[] | null;
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
