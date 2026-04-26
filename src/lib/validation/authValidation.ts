import type { BirthTimeCode, Gender } from "@/types/user";
import { calculateAge } from "@/lib/utils/calculateAge";
import { isKoreanMobilePhone, normalizePhone } from "@/lib/utils/formatPhone";
import { getSigunguOptions } from "@/lib/constants/regions";

export interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTimeCode: BirthTimeCode;
  gender: Gender | "";
  phone: string;
  sido: string;
  sigungu: string;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  agreedSensitiveInfo: boolean;
  agreedThirdParty: boolean;
  agreedAgeOver19: boolean;
  agreedMarketing: boolean;
}

export interface ProfileEditValues {
  name: string;
  phone: string;
  sido: string;
  sigungu: string;
  birthTimeCode: BirthTimeCode;
}

export type ValidationErrors<T extends string = string> = Partial<Record<T, string>>;

export function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidName(name: string) {
  return /^[A-Za-z가-힣\s]{2,20}$/.test(name.trim());
}

export function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "약함";
  if (score <= 3) return "보통";
  return "좋음";
}

export function getBirthDate(values: Pick<SignupFormValues, "birthYear" | "birthMonth" | "birthDay">) {
  if (!values.birthYear || !values.birthMonth || !values.birthDay) {
    return "";
  }

  return `${values.birthYear}-${values.birthMonth.padStart(2, "0")}-${values.birthDay.padStart(2, "0")}`;
}

export function getBirthYearOptions(referenceDate = new Date()) {
  const currentYear = referenceDate.getFullYear();
  return Array.from({ length: 81 }, (_, index) => String(currentYear - index));
}

export function getDayOptions(year: string, month: string) {
  if (!year || !month) {
    return Array.from({ length: 31 }, (_, index) => String(index + 1));
  }

  const days = new Date(Number(year), Number(month), 0).getDate();
  return Array.from({ length: days }, (_, index) => String(index + 1));
}

export function validateSignup(values: SignupFormValues): ValidationErrors<keyof SignupFormValues | "birthDate"> {
  const errors: ValidationErrors<keyof SignupFormValues | "birthDate"> = {};
  const birthDate = getBirthDate(values);
  const today = new Date();

  if (!isEmail(values.email)) {
    errors.email = "올바른 이메일 주소를 입력해 주세요.";
  }

  if (!isStrongPassword(values.password)) {
    errors.password = "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
  }

  if (!isValidName(values.name)) {
    errors.name = "이름은 한글 또는 영문 2~20자로 입력해 주세요.";
  }

  if (!birthDate || Number.isNaN(new Date(`${birthDate}T00:00:00`).getTime())) {
    errors.birthDate = "생년월일을 선택해 주세요.";
  } else if (new Date(`${birthDate}T00:00:00`) > today) {
    errors.birthDate = "미래 날짜는 선택할 수 없습니다.";
  } else if (calculateAge(birthDate, today) < 19) {
    errors.birthDate = "버틀러스레터는 성인 이용자를 대상으로 제공됩니다.";
  }

  if (!values.gender) {
    errors.gender = "성별을 선택해 주세요.";
  }

  if (!isKoreanMobilePhone(values.phone)) {
    errors.phone = "한국 휴대전화번호 형식으로 입력해 주세요.";
  }

  if (!values.sido) {
    errors.sido = "시/도를 선택해 주세요.";
  }

  if (!values.sigungu || !getSigunguOptions(values.sido).includes(values.sigungu)) {
    errors.sigungu = "시/군/구를 선택해 주세요.";
  }

  if (!values.agreedTerms) errors.agreedTerms = "서비스 이용약관에 동의해 주세요.";
  if (!values.agreedPrivacy) errors.agreedPrivacy = "개인정보 수집 및 이용에 동의해 주세요.";
  if (!values.agreedSensitiveInfo) errors.agreedSensitiveInfo = "민감정보 처리에 동의해 주세요.";
  if (!values.agreedThirdParty) errors.agreedThirdParty = "개인정보 제3자 제공 동의가 필요합니다.";
  if (!values.agreedAgeOver19) errors.agreedAgeOver19 = "만 19세 이상임을 확인해 주세요.";

  return errors;
}

export function validateProfileEdit(values: ProfileEditValues): ValidationErrors<keyof ProfileEditValues> {
  const errors: ValidationErrors<keyof ProfileEditValues> = {};

  if (!isValidName(values.name)) {
    errors.name = "이름은 한글 또는 영문 2~20자로 입력해 주세요.";
  }

  if (!isKoreanMobilePhone(values.phone)) {
    errors.phone = "한국 휴대전화번호 형식으로 입력해 주세요.";
  }

  if (!values.sido) {
    errors.sido = "시/도를 선택해 주세요.";
  }

  if (!values.sigungu || !getSigunguOptions(values.sido).includes(values.sigungu)) {
    errors.sigungu = "시/군/구를 선택해 주세요.";
  }

  return errors;
}

export function toProfileRow(values: SignupFormValues) {
  return {
    email: values.email.trim().toLowerCase(),
    name: values.name.trim(),
    gender: values.gender,
    birth_date: getBirthDate(values),
    birth_time_code: values.birthTimeCode,
    phone: normalizePhone(values.phone),
    sido: values.sido,
    sigungu: values.sigungu,
    agreed_terms: values.agreedTerms,
    agreed_privacy: values.agreedPrivacy,
    agreed_sensitive_info: values.agreedSensitiveInfo,
    agreed_third_party: values.agreedThirdParty,
    agreed_age_over_19: values.agreedAgeOver19,
    agreed_marketing: values.agreedMarketing,
  };
}
