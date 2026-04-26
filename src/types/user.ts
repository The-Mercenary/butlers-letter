export type Gender = "male" | "female";

export type BirthTimeCode =
  | "unknown"
  | "ja"
  | "chuk"
  | "in"
  | "myo"
  | "jin"
  | "sa"
  | "oh"
  | "mi"
  | "shin"
  | "yu"
  | "sul"
  | "hae";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  gender: Gender;
  birthDate: string;
  birthTimeCode: BirthTimeCode;
  phone: string;
  sido: string;
  sigungu: string;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  agreedSensitiveInfo: boolean;
  agreedThirdParty: boolean;
  agreedAgeOver19: boolean;
  agreedMarketing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileRow {
  id: string;
  email: string;
  name: string;
  gender: Gender;
  birth_date: string;
  birth_time_code: BirthTimeCode;
  phone: string;
  sido: string;
  sigungu: string;
  agreed_terms: boolean;
  agreed_privacy: boolean;
  agreed_sensitive_info: boolean;
  agreed_third_party: boolean;
  agreed_age_over_19: boolean;
  agreed_marketing: boolean;
  created_at: string;
  updated_at: string;
}
