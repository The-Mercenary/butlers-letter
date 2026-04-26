import type { BirthTimeCode } from "@/types/user";

export interface SajuProfile {
  id: string;
  userId: string;
  calendarType: "solar";
  birthDate: string;
  birthTimeCode: BirthTimeCode;
  dayPillar?: string;
  personalitySummary?: string;
  datingPoints?: string[];
  compatibilityKeywords?: string[];
  rawResult?: Record<string, unknown>;
  calculatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SajuProfileRow {
  id: string;
  user_id: string;
  calendar_type: "solar";
  birth_date: string;
  birth_time_code: BirthTimeCode;
  day_pillar: string | null;
  personality_summary: string | null;
  dating_points: string[] | null;
  compatibility_keywords: string[] | null;
  raw_result: Record<string, unknown> | null;
  calculated_at: string | null;
  created_at: string;
  updated_at: string;
}
