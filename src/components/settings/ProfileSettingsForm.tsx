"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import { SelectField } from "@/components/common/SelectField";
import { BIRTH_TIME_OPTIONS, getBirthTimeLabel } from "@/lib/constants/birthTimes";
import { SIDO_OPTIONS, getSigunguOptions } from "@/lib/constants/regions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toUserProfile } from "@/lib/supabase/mappers";
import { normalizePhone } from "@/lib/utils/formatPhone";
import { validateProfileEdit, type ProfileEditValues } from "@/lib/validation/authValidation";
import type { BirthTimeCode, UserProfile, UserProfileRow } from "@/types/user";

export function ProfileSettingsForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [values, setValues] = useState<ProfileEditValues>({
    name: "",
    phone: "",
    sido: "",
    sigungu: "",
    birthTimeCode: "unknown",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sigunguOptions = useMemo(() => getSigunguOptions(values.sido), [values.sido]);

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured()) {
        setError("Supabase 환경변수를 설정하면 회원 정보를 불러올 수 있습니다.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const mapped = data
        ? toUserProfile(data as UserProfileRow)
        : ({
            id: user.id,
            email: user.email ?? "",
            name: String(user.user_metadata?.name ?? ""),
            gender: user.user_metadata?.gender ?? "male",
            birthDate: String(user.user_metadata?.birth_date ?? ""),
            birthTimeCode: user.user_metadata?.birth_time_code ?? "unknown",
            phone: String(user.user_metadata?.phone ?? ""),
            sido: String(user.user_metadata?.sido ?? ""),
            sigungu: String(user.user_metadata?.sigungu ?? ""),
            agreedTerms: Boolean(user.user_metadata?.agreed_terms),
            agreedPrivacy: Boolean(user.user_metadata?.agreed_privacy),
            agreedSensitiveInfo: Boolean(user.user_metadata?.agreed_sensitive_info),
            agreedThirdParty: Boolean(user.user_metadata?.agreed_third_party),
            agreedAgeOver19: Boolean(user.user_metadata?.agreed_age_over_19),
            agreedMarketing: Boolean(user.user_metadata?.agreed_marketing),
            createdAt: user.created_at,
            updatedAt: user.updated_at ?? user.created_at,
          } as UserProfile);

      setProfile(mapped);
      setValues({
        name: mapped.name,
        phone: mapped.phone,
        sido: mapped.sido,
        sigungu: mapped.sigungu,
        birthTimeCode: mapped.birthTimeCode,
      });
      setLoading(false);
    }

    loadProfile();
  }, []);

  function setValue<T extends keyof ProfileEditValues>(key: T, value: ProfileEditValues[T]) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "sido" ? { sigungu: "" } : {}),
    }));
  }

  async function saveProfile() {
    setMessage("");
    setError("");

    const nextErrors = validateProfileEdit(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;
    if (!profile || !isSupabaseConfigured()) return;

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        name: values.name.trim(),
        phone: normalizePhone(values.phone),
        sido: values.sido,
        sigungu: values.sigungu,
        birth_time_code: values.birthTimeCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfile({
      ...profile,
      name: values.name.trim(),
      phone: normalizePhone(values.phone),
      sido: values.sido,
      sigungu: values.sigungu,
      birthTimeCode: values.birthTimeCode,
      updatedAt: new Date().toISOString(),
    });
    setEditMode(false);
    setMessage("회원 정보가 저장되었습니다.");
  }

  if (loading) {
    return <div className="surface min-h-96 animate-pulse rounded-lg" />;
  }

  if (!profile) {
    return <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error || "회원 정보를 찾을 수 없습니다."}</p>;
  }

  const readonlyRows = [
    ["이메일", profile.email],
    ["이름", profile.name],
    ["생년월일", profile.birthDate],
    ["태어난 시간", getBirthTimeLabel(profile.birthTimeCode)],
    ["성별", profile.gender === "male" ? "남성" : "여성"],
    ["휴대전화번호", profile.phone],
    ["거주지", `${profile.sido} ${profile.sigungu}`],
  ];

  return (
    <div className="surface rounded-lg p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal-800">Profile</p>
          <h1 className="mt-2 text-3xl font-black text-stone-950">회원 정보</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">이메일, 성별, 생년월일은 MVP에서 수정할 수 없습니다.</p>
        </div>
        {!editMode ? (
          <Button type="button" variant="secondary" onClick={() => setEditMode(true)}>
            수정
          </Button>
        ) : null}
      </div>

      {message ? <p className="mt-5 rounded-md bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">{message}</p> : null}
      {error ? <p className="mt-5 rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

      {!editMode ? (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {readonlyRows.map(([label, value]) => (
            <div key={label} className="rounded-md border border-stone-200 bg-stone-50 px-3 py-3">
              <dt className="text-xs font-bold text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-stone-900">{value || "-"}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FormField
            id="name"
            label="이름"
            value={values.name}
            onChange={(event) => setValue("name", event.target.value)}
            error={errors.name}
          />
          <FormField
            id="phone"
            label="휴대전화번호"
            value={values.phone}
            onChange={(event) => setValue("phone", event.target.value)}
            error={errors.phone}
          />
          <SelectField
            id="birthTimeCode"
            label="태어난 시간"
            options={BIRTH_TIME_OPTIONS}
            value={values.birthTimeCode}
            onChange={(event) => setValue("birthTimeCode", event.target.value as BirthTimeCode)}
          />
          <div className="hidden sm:block" />
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
          <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>
              취소
            </Button>
            <Button type="button" onClick={saveProfile} disabled={saving}>
              {saving ? "저장 중" : "저장"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
