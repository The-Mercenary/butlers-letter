"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { ConsentModal } from "@/components/common/ConsentModal";
import { FormField } from "@/components/common/FormField";
import { SelectField } from "@/components/common/SelectField";
import { BIRTH_TIME_OPTIONS } from "@/lib/constants/birthTimes";
import { INDUSTRY_TYPES } from "@/lib/constants/industries";
import { DEFAULT_DONG, SIDO_OPTIONS, getDongOptions, getSigunguOptions } from "@/lib/constants/regions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getBirthDate, getBirthYearOptions, getDayOptions, getPasswordStrength, toProfileRow, validateSignup, type SignupFormValues } from "@/lib/validation/authValidation";
import { normalizePhone } from "@/lib/utils/formatPhone";
import type { ConsentContent } from "@/types/consent";

const consentContents: ConsentContent[] = [
  {
    key: "terms",
    title: "서비스 이용약관 동의",
    required: true,
    body: "버틀러스레터 MVP 이용을 위한 기본 약관입니다. 사용자는 본인이 입력한 정보가 사실에 기반하도록 관리해야 하며, 허위 또는 부적절한 정보는 서비스 이용 제한 사유가 될 수 있습니다.",
  },
  {
    key: "privacy",
    title: "개인정보 수집 및 이용 동의",
    required: true,
    body: "이메일, 이름, 생년월일, 성별, 휴대전화번호, 거주지, 직종 등 회원 기본 정보를 계정 생성, 본인 프로필 관리, 인맥 추천 준비 목적에 한해 수집 및 이용합니다.",
  },
  {
    key: "thirdParty",
    title: "상호 동의 시 연락처 공개 동의",
    required: true,
    body: "MVP에서는 연락처 자동 공개 기능을 실행하지 않습니다. 다만 향후 서로가 더 알아가고 싶다고 동의한 경우에만 연락처가 공개될 수 있는 구조를 준비하기 위한 동의 항목입니다.",
  },
  {
    key: "sensitiveInfo",
    title: "프로필 정보 활용 동의",
    required: true,
    body: "성별, 생년월일, 태어난 시간, 지역, 관심사 등 사용자가 입력한 프로필 정보를 목적 기반 사람 추천 기능을 준비하기 위해 활용합니다.",
  },
  {
    key: "ageOver19",
    title: "만 19세 이상 확인",
    required: true,
    body: "버틀러스레터는 서비스 정책상 만 19세 이상 성인 이용자를 대상으로 제공됩니다.",
  },
  {
    key: "marketing",
    title: "마케팅 정보 수신 동의",
    required: false,
    body: "서비스 업데이트, 이벤트, 운영 안내 등 선택적 마케팅 정보를 이메일 또는 문자로 받을 수 있습니다. 동의하지 않아도 회원가입은 가능합니다.",
  },
  {
    key: "sajuAnalysis",
    title: "생년월일 및 태어난 시간 기반 성향 정보 생성/활용 동의",
    required: true,
    body: "입력한 생년월일과 태어난 시간은 향후 성향 기반 추천 기능을 위해 활용될 수 있습니다. 단, 이는 참고 정보이며 특정 관계나 만남의 결과를 보장하지 않습니다.",
  },
];

const initialValues: SignupFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  birthTimeCode: "unknown",
  gender: "",
  phone: "",
  sido: "",
  sigungu: "",
  dong: DEFAULT_DONG,
  industryType: "",
  agreedTerms: false,
  agreedPrivacy: false,
  agreedSensitiveInfo: false,
  agreedThirdParty: false,
  agreedAgeOver19: false,
  agreedMarketing: false,
  agreedSajuAnalysis: false,
};

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<SignupFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const missingConfig = !isSupabaseConfigured();

  const yearOptions = useMemo(() => getBirthYearOptions(), []);
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => String(index + 1)), []);
  const dayOptions = useMemo(() => getDayOptions(values.birthYear, values.birthMonth), [values.birthMonth, values.birthYear]);
  const sigunguOptions = useMemo(() => getSigunguOptions(values.sido), [values.sido]);
  const dongOptions = useMemo(() => getDongOptions(values.sido, values.sigungu), [values.sido, values.sigungu]);

  function setValue<T extends keyof SignupFormValues>(key: T, value: SignupFormValues[T]) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "sido" ? { sigungu: "", dong: DEFAULT_DONG } : {}),
      ...(key === "sigungu" ? { dong: DEFAULT_DONG } : {}),
    }));
  }

  function scrollToFirstError(nextErrors: Record<string, string>) {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
    document.querySelector(`[data-error-key="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      return;
    }

    if (missingConfig) {
      setFormError("Supabase 환경변수를 설정한 뒤 회원가입할 수 있습니다.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const profileRow = toProfileRow(values);
    const redirectTo = `${window.location.origin}/api/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          ...profileRow,
          phone: normalizePhone(values.phone),
        },
      },
    });

    if (error) {
      setLoading(false);
      setFormError(error.message);
      return;
    }

    if (data.user && data.session) {
      const { error: profileError } = await supabase.from("user_profiles").upsert({
        id: data.user.id,
        ...profileRow,
      });

      if (profileError) {
        setLoading(false);
        setFormError("회원 계정은 생성되었지만 프로필 저장에 실패했습니다. Supabase RLS/트리거 설정을 확인해 주세요.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    setLoading(false);
    setSuccessMessage("회원가입 요청이 완료되었습니다. 이메일 인증 메일을 확인한 뒤 로그인해 주세요.");
    setValues(initialValues);
  }

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto w-full max-w-3xl rounded-lg p-6 sm:p-8">
      <div className="mb-7">
        <p className="text-sm font-bold text-teal-800">Signup</p>
        <h1 className="mt-2 text-3xl font-black text-stone-950">회원가입</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">기본 회원 정보를 등록하고 목적별 인맥 카드를 준비해 주세요.</p>
      </div>

      {missingConfig ? (
        <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900">
          Supabase 환경변수가 아직 설정되지 않았습니다. `.env.local`을 준비하면 회원가입 기능이 동작합니다.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="email"
          label="이메일 주소"
          type="email"
          value={values.email}
          onChange={(event) => setValue("email", event.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <FormField
          id="name"
          label="이름"
          value={values.name}
          onChange={(event) => setValue("name", event.target.value)}
          error={errors.name}
          autoComplete="name"
        />
        <FormField
          id="password"
          label="비밀번호"
          type="password"
          value={values.password}
          onChange={(event) => setValue("password", event.target.value)}
          error={errors.password}
          suffix={values.password ? getPasswordStrength(values.password) : undefined}
          autoComplete="new-password"
        />
        <FormField
          id="confirmPassword"
          label="비밀번호 재확인"
          type="password"
          value={values.confirmPassword}
          onChange={(event) => setValue("confirmPassword", event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3" data-error-key="birthDate">
        <SelectField
          id="birthYear"
          label="생년월일"
          options={yearOptions}
          placeholder="연도"
          value={values.birthYear}
          onChange={(event) => setValue("birthYear", event.target.value)}
        />
        <SelectField
          id="birthMonth"
          label="월"
          options={monthOptions}
          placeholder="월"
          value={values.birthMonth}
          onChange={(event) => setValue("birthMonth", event.target.value)}
        />
        <SelectField
          id="birthDay"
          label="일"
          options={dayOptions}
          placeholder="일"
          value={values.birthDay}
          onChange={(event) => setValue("birthDay", event.target.value)}
        />
        {errors.birthDate ? <p className="error-text sm:col-span-3">{errors.birthDate}</p> : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SelectField
          id="birthTimeCode"
          label="태어난 시간"
          options={BIRTH_TIME_OPTIONS}
          value={values.birthTimeCode}
          onChange={(event) => setValue("birthTimeCode", event.target.value as SignupFormValues["birthTimeCode"])}
        />
        <div className="space-y-1.5" data-error-key="gender">
          <span className="label-base">성별</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["male", "남성"],
              ["female", "여성"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue("gender", value as SignupFormValues["gender"])}
                className={`min-h-10 rounded-md border px-3 text-sm font-semibold transition ${
                  values.gender === value ? "border-teal-700 bg-teal-50 text-teal-900" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.gender ? <p className="error-text">{errors.gender}</p> : null}
        </div>
        <FormField
          id="phone"
          label="휴대전화번호"
          value={values.phone}
          onChange={(event) => setValue("phone", event.target.value)}
          error={errors.phone}
          placeholder="010-1234-5678"
          autoComplete="tel"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SelectField
          id="sido"
          label="거주지 시/도"
          options={SIDO_OPTIONS}
          value={values.sido}
          onChange={(event) => setValue("sido", event.target.value)}
          error={errors.sido}
        />
        <SelectField
          id="sigungu"
          label="거주지 시/군/구"
          options={sigunguOptions}
          value={values.sigungu}
          onChange={(event) => setValue("sigungu", event.target.value)}
          error={errors.sigungu}
          disabled={!values.sido}
        />
        <SelectField
          id="dong"
          label="거주지 읍/면/동"
          options={dongOptions}
          value={values.dong}
          onChange={(event) => setValue("dong", event.target.value)}
          error={errors.dong}
          disabled={!values.sigungu}
          help="특정 동을 정하지 않으려면 전체를 선택해 주세요."
        />
        <SelectField
          id="industryType"
          label="직종"
          options={INDUSTRY_TYPES}
          value={values.industryType}
          onChange={(event) => setValue("industryType", event.target.value)}
          error={errors.industryType}
        />
      </div>

      <div className="mt-8 space-y-3">
        <h2 className="text-base font-bold text-stone-950">약관 동의</h2>
        {consentContents.map((content) => {
          const fieldMap = {
            terms: "agreedTerms",
            privacy: "agreedPrivacy",
            thirdParty: "agreedThirdParty",
            sensitiveInfo: "agreedSensitiveInfo",
            ageOver19: "agreedAgeOver19",
            marketing: "agreedMarketing",
            sajuAnalysis: "agreedSajuAnalysis",
            cardDisclosure: "agreedTerms",
            contactDisclosure: "agreedTerms",
          } as const;
          const field = fieldMap[content.key];

          return (
            <div key={content.key} data-error-key={field}>
              <ConsentModal
                content={content}
                checked={Boolean(values[field])}
                onChange={(checked) => setValue(field, checked)}
              />
              {errors[field] ? <p className="error-text mt-1">{errors[field]}</p> : null}
            </div>
          );
        })}
      </div>

      {formError ? <p className="mt-5 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{formError}</p> : null}
      {successMessage ? <p className="mt-5 rounded-md bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">{successMessage}</p> : null}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={loading}>
          {loading ? "가입 처리 중" : "회원가입"}
        </Button>
        <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-50">
          로그인으로 이동
        </Link>
      </div>

      <p className="mt-5 text-xs leading-5 text-stone-500">선택된 생년월일: {getBirthDate(values) || "-"}</p>
    </form>
  );
}
