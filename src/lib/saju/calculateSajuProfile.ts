import type { SajuProfile } from "@/types/saju";
import type { BirthTimeCode } from "@/types/user";

interface CalculateSajuInput {
  userId: string;
  birthDate: string;
  birthTimeCode: BirthTimeCode;
}

export function calculateSajuProfile(input: CalculateSajuInput): Omit<SajuProfile, "id" | "createdAt" | "updatedAt"> {
  // TODO: Implement only after selecting and documenting a reliable calculation basis.
  // MVP stores birth information for future matching, but does not expose unverified interpretation.
  return {
    userId: input.userId,
    calendarType: "solar",
    birthDate: input.birthDate,
    birthTimeCode: input.birthTimeCode,
    rawResult: {
      status: "pending_research",
      note: "Calculation intentionally not performed in MVP.",
    },
  };
}
