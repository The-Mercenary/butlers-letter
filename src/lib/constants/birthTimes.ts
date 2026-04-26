import type { BirthTimeCode } from "@/types/user";

export const BIRTH_TIME_OPTIONS: { value: BirthTimeCode; label: string }[] = [
  { value: "unknown", label: "시간 모름" },
  { value: "ja", label: "자시 23:30 ~ 01:30" },
  { value: "chuk", label: "축시 01:30 ~ 03:30" },
  { value: "in", label: "인시 03:30 ~ 05:30" },
  { value: "myo", label: "묘시 05:30 ~ 07:30" },
  { value: "jin", label: "진시 07:30 ~ 09:30" },
  { value: "sa", label: "사시 09:30 ~ 11:30" },
  { value: "oh", label: "오시 11:30 ~ 13:30" },
  { value: "mi", label: "미시 13:30 ~ 15:30" },
  { value: "shin", label: "신시 15:30 ~ 17:30" },
  { value: "yu", label: "유시 17:30 ~ 19:30" },
  { value: "sul", label: "술시 19:30 ~ 21:30" },
  { value: "hae", label: "해시 21:30 ~ 23:30" },
];

export function getBirthTimeLabel(value: BirthTimeCode | string) {
  return BIRTH_TIME_OPTIONS.find((option) => option.value === value)?.label ?? "시간 모름";
}
