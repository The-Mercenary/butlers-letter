"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ConsentModal } from "@/components/common/ConsentModal";
import { FormField } from "@/components/common/FormField";
import { Modal } from "@/components/common/Modal";
import { SelectField } from "@/components/common/SelectField";
import { ImageUploader } from "@/components/cards/ImageUploader";
import { PrioritySorter } from "@/components/cards/PrioritySorter";
import { RegionSelector } from "@/components/cards/RegionSelector";
import { SocialAccountsEditor } from "@/components/cards/SocialAccountsEditor";
import { BIRTH_TIME_OPTIONS, getBirthTimeLabel } from "@/lib/constants/birthTimes";
import {
  AGE_RANGE_OPTIONS,
  AVAILABLE_TIME_OPTIONS,
  CAREER_RANGE_OPTIONS,
  DATING_VALUE_OPTIONS,
  DEFAULT_PARTNER_PRIORITIES,
  HOBBY_LEVEL_OPTIONS,
  HOBBY_PARTICIPATION_OPTIONS,
  INDUSTRY_ROLE_OPTIONS,
  LOCAL_ACTIVITY_OPTIONS,
  LOCAL_DISTANCE_OPTIONS,
  MEETING_TIMELINE_OPTIONS,
  NETWORK_MEETING_TYPE_OPTIONS,
} from "@/lib/constants/cardOptions";
import { HOBBIES } from "@/lib/constants/hobbies";
import { CARD_PURPOSES, getCardPurposeLabel } from "@/lib/constants/recommendationPurposes";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toMatchingCard, toMatchingCardImage, toSocialAccount, toUserProfile } from "@/lib/supabase/mappers";
import {
  EMPTY_CARD_FORM_VALUES,
  getValuesForPurpose,
  validateCard,
  type CardFormValues,
} from "@/lib/validation/cardValidation";
import type { ConsentContent } from "@/types/consent";
import type {
  CardPurpose,
  CardStatus,
  MatchingCardImageRow,
  MatchingCardRow,
  SocialAccountRow,
} from "@/types/card";
import type { UserProfile, UserProfileRow } from "@/types/user";

interface CardFormProps {
  mode: "create" | "edit";
  cardId?: string;
}

const cardConsentContents: ConsentContent[] = [
  {
    key: "cardDisclosure",
    title: "카드 공개 동의",
    required: true,
    body: "향후 추천 대상에게 목적별 카드의 프로필 이미지, 자기소개, 선호 조건 일부가 공개될 수 있습니다. MVP에서는 실제 카드 공개 기능을 실행하지 않습니다.",
  },
  {
    key: "contactDisclosure",
    title: "상호 동의 시 연락처 공개 동의",
    required: true,
    body: "서로 관심 의사가 확인된 경우에만 연락처 등 추가 정보가 공개될 수 있는 구조를 준비하기 위한 동의입니다. MVP에서는 연락처 자동 공개 기능을 실행하지 않습니다.",
  },
];

function makeDraftCardName() {
  return `임시 카드 ${new Date().toLocaleDateString("ko-KR").replace(/\./g, "").replace(/\s/g, "")}`;
}

function toggleLimited(current: string[], item: string, limit: number) {
  if (current.includes(item)) {
    return current.filter((value) => value !== item);
  }

  if (current.length >= limit) {
    return current;
  }

  return [...current, item];
}

function toggleItem(current: string[], item: string) {
  return current.includes(item) ? current.filter((value) => value !== item) : [...current, item];
}

function checkboxButtonClass(active: boolean) {
  return `min-h-10 rounded-md border px-3 text-sm font-semibold transition ${
    active ? "border-teal-700 bg-teal-50 text-teal-900" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
  }`;
}

function formatLocation(profile: UserProfile | null) {
  if (!profile) return "-";
  return [profile.sido, profile.sigungu, profile.dong].filter(Boolean).join(" ") || "-";
}

export function CardForm({ mode, cardId }: CardFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CardFormValues>(EMPTY_CARD_FORM_VALUES);
  const [savedPurpose, setSavedPurpose] = useState<CardPurpose | "">("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState<"save" | "draft" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const missingConfig = !isSupabaseConfigured();

  const title = mode === "create" ? "새 카드 만들기" : "카드 수정";
  const purposeLocked = mode === "edit" && Boolean(savedPurpose);
  const showDetailForm = Boolean(values.cardPurpose);

  useEffect(() => {
    async function loadInitialData() {
      if (!isSupabaseConfigured()) {
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

      const { data: profileData } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(profileData ? toUserProfile(profileData as UserProfileRow) : null);

      if (mode === "edit" && cardId) {
        const [{ data: cardData, error: cardError }, { data: imageData }, { data: socialData }] = await Promise.all([
          supabase.from("matching_cards").select("*").eq("id", cardId).eq("user_id", user.id).maybeSingle(),
          supabase.from("matching_card_images").select("*").eq("card_id", cardId).order("sort_order", { ascending: true }),
          supabase.from("social_accounts").select("*").eq("card_id", cardId).order("created_at", { ascending: true }),
        ]);

        if (cardError || !cardData) {
          setFormError("카드를 찾을 수 없습니다.");
          setLoading(false);
          return;
        }

        const card = toMatchingCard(cardData as MatchingCardRow);
        const images = ((imageData ?? []) as MatchingCardImageRow[]).map(toMatchingCardImage);
        const socialAccounts = ((socialData ?? []) as SocialAccountRow[]).map(toSocialAccount);

        setSavedPurpose(card.cardPurpose);
        setValues({
          cardPurpose: card.cardPurpose,
          cardName: card.cardName,
          mainImageUrl: card.mainImageUrl,
          selfIntroduction: card.selfIntroduction,
          educationLevel: card.educationLevel,
          jobType: card.jobType,
          preferredAgeRanges: card.preferredAgeRanges,
          meetingTimelines: card.meetingTimelines,
          partnerPriority: card.partnerPriority.length ? card.partnerPriority : DEFAULT_PARTNER_PRIORITIES,
          reasonsForUse: card.reasonsForUse,
          preferredRegions: card.preferredRegions,
          industryRole: card.industryRole,
          careerRange: card.careerRange,
          desiredIndustryRoles: card.desiredIndustryRoles,
          networkMeetingTypes: card.networkMeetingTypes,
          datingValues: card.datingValues,
          localDistance: card.localDistance,
          localActivities: card.localActivities,
          availableTimes: card.availableTimes,
          hobbyIds: card.hobbyIds,
          hobbyLevel: card.hobbyLevel,
          hobbyParticipationTypes: card.hobbyParticipationTypes,
          agreedCardDisclosure: card.agreedCardDisclosure,
          agreedContactDisclosure: card.agreedContactDisclosure,
          additionalImageUrls: images.map((image) => image.imageUrl),
          socialAccounts: socialAccounts.map((account) => ({
            platform: account.platform,
            urlOrId: account.urlOrId,
          })),
        });
      }

      setLoading(false);
    }

    loadInitialData();
  }, [cardId, mode]);

  const accountRows = useMemo(
    () => [
      ["이름", profile?.name ?? "-"],
      ["성별", profile?.gender === "male" ? "남성" : profile?.gender === "female" ? "여성" : "-"],
      ["생년월일", profile?.birthDate ?? "-"],
      ["태어난 시간", profile?.birthTimeCode ? getBirthTimeLabel(profile.birthTimeCode) : BIRTH_TIME_OPTIONS[0].label],
      ["이메일 주소", profile?.email ?? "-"],
      ["휴대전화번호", profile?.phone ?? "-"],
      ["거주지", formatLocation(profile)],
      ["직종", profile?.industryType ?? "-"],
    ],
    [profile],
  );

  function setValue<T extends keyof CardFormValues>(key: T, value: CardFormValues[T]) {
    if (key === "cardPurpose" && purposeLocked) return;

    setValues((current) => ({
      ...current,
      [key]: value,
    }));
    setDirty(true);
  }

  function scrollToFirstError(nextErrors: Record<string, string>) {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
    document.querySelector(`[data-error-key="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function persist(status: CardStatus) {
    if (!isSupabaseConfigured()) {
      setFormError("Supabase 환경변수를 설정한 뒤 저장할 수 있습니다.");
      return;
    }

    const draft = status === "draft";
    const normalizedValues = getValuesForPurpose({
      ...values,
      cardName: values.cardName.trim() || makeDraftCardName(),
      socialAccounts: values.socialAccounts.filter((account) => account.urlOrId.trim()),
    });
    const nextErrors = validateCard(normalizedValues, { draft });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      return;
    }

    setSaving(draft ? "draft" : "save");
    setFormError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving("");
      setFormError("로그인 세션을 확인할 수 없습니다.");
      return;
    }

    const row = {
      user_id: user.id,
      card_purpose: normalizedValues.cardPurpose,
      card_name: normalizedValues.cardName,
      status,
      main_image_url: normalizedValues.mainImageUrl || null,
      self_introduction: normalizedValues.selfIntroduction,
      education_level: normalizedValues.educationLevel || null,
      job_type: normalizedValues.jobType || null,
      preferred_age_ranges: normalizedValues.preferredAgeRanges,
      meeting_timelines: normalizedValues.meetingTimelines,
      partner_priority: normalizedValues.partnerPriority,
      reasons_for_use: normalizedValues.reasonsForUse,
      preferred_regions: normalizedValues.preferredRegions,
      industry_role: normalizedValues.industryRole || null,
      career_range: normalizedValues.careerRange || null,
      desired_industry_roles: normalizedValues.desiredIndustryRoles,
      network_meeting_types: normalizedValues.networkMeetingTypes,
      dating_values: normalizedValues.datingValues,
      local_distance: normalizedValues.localDistance || null,
      local_activities: normalizedValues.localActivities,
      available_times: normalizedValues.availableTimes,
      hobby_ids: normalizedValues.hobbyIds,
      hobby_level: normalizedValues.hobbyLevel || null,
      hobby_participation_types: normalizedValues.hobbyParticipationTypes,
      agreed_card_disclosure: normalizedValues.agreedCardDisclosure,
      agreed_contact_disclosure: normalizedValues.agreedContactDisclosure,
      updated_at: new Date().toISOString(),
    };

    let savedCardId = cardId;

    if (mode === "edit" && cardId) {
      const { error: updateError } = await supabase.from("matching_cards").update(row).eq("id", cardId).eq("user_id", user.id);
      if (updateError) {
        setSaving("");
        setFormError(updateError.message);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase.from("matching_cards").insert(row).select("id").single();
      if (insertError || !data) {
        setSaving("");
        setFormError(insertError?.message ?? "카드 저장에 실패했습니다.");
        return;
      }
      savedCardId = data.id as string;
    }

    if (!savedCardId) {
      setSaving("");
      setFormError("저장된 카드 ID를 확인할 수 없습니다.");
      return;
    }

    const [deleteImagesResult, deleteSocialsResult] = await Promise.all([
      supabase.from("matching_card_images").delete().eq("card_id", savedCardId),
      supabase.from("social_accounts").delete().eq("card_id", savedCardId),
    ]);

    if (deleteImagesResult.error || deleteSocialsResult.error) {
      setSaving("");
      setFormError(deleteImagesResult.error?.message ?? deleteSocialsResult.error?.message ?? "연결 정보 정리에 실패했습니다.");
      return;
    }

    if (normalizedValues.additionalImageUrls.length) {
      const { error: imageInsertError } = await supabase.from("matching_card_images").insert(
        normalizedValues.additionalImageUrls.map((imageUrl, index) => ({
          card_id: savedCardId,
          image_url: imageUrl,
          sort_order: index,
        })),
      );

      if (imageInsertError) {
        setSaving("");
        setFormError(imageInsertError.message);
        return;
      }
    }

    if (normalizedValues.socialAccounts.length) {
      const { error: socialInsertError } = await supabase.from("social_accounts").insert(
        normalizedValues.socialAccounts.map((account) => ({
          card_id: savedCardId,
          platform: account.platform,
          url_or_id: account.urlOrId.trim(),
        })),
      );

      if (socialInsertError) {
        setSaving("");
        setFormError(socialInsertError.message);
        return;
      }
    }

    setDirty(false);
    router.push(`/dashboard/cards/${savedCardId}`);
    router.refresh();
  }

  function renderChipGroup(
    key: keyof CardFormValues,
    items: readonly string[],
    selected: string[],
    options: { limit?: number } = {},
  ) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setValue(key, options.limit ? toggleLimited(selected, item, options.limit) : toggleItem(selected, item) as never)}
            className={checkboxButtonClass(selected.includes(item))}
          >
            {item}
          </button>
        ))}
      </div>
    );
  }

  function renderPurposeFields() {
    if (values.cardPurpose === "industry_network") {
      return (
        <section className="surface rounded-lg p-5">
          <h2 className="text-lg font-black text-stone-950">업계 네트워크 정보</h2>
          <div className="mt-5 grid gap-5">
            <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-3">
              <p className="text-xs font-bold text-stone-500">현재 직종</p>
              <p className="mt-1 text-sm font-semibold text-stone-900">{profile?.industryType ?? "회원 정보에서 직종을 설정해 주세요."}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="industryRole"
                label="현재 직무"
                options={INDUSTRY_ROLE_OPTIONS}
                value={values.industryRole}
                onChange={(event) => setValue("industryRole", event.target.value)}
                error={errors.industryRole}
              />
              <SelectField
                id="careerRange"
                label="경력 구간"
                options={CAREER_RANGE_OPTIONS}
                value={values.careerRange}
                onChange={(event) => setValue("careerRange", event.target.value)}
                error={errors.careerRange}
              />
            </div>
            <div data-error-key="desiredIndustryRoles">
              <p className="label-base">만나고 싶은 업계/직무</p>
              {renderChipGroup("desiredIndustryRoles", INDUSTRY_ROLE_OPTIONS, values.desiredIndustryRoles)}
              {errors.desiredIndustryRoles ? <p className="error-text mt-2">{errors.desiredIndustryRoles}</p> : null}
            </div>
            <div data-error-key="networkMeetingTypes">
              <p className="label-base">기대하는 만남 유형</p>
              {renderChipGroup("networkMeetingTypes", NETWORK_MEETING_TYPE_OPTIONS, values.networkMeetingTypes)}
              {errors.networkMeetingTypes ? <p className="error-text mt-2">{errors.networkMeetingTypes}</p> : null}
            </div>
          </div>
        </section>
      );
    }

    if (values.cardPurpose === "dating") {
      return (
        <section className="surface rounded-lg p-5">
          <h2 className="text-lg font-black text-stone-950">연애 목적 정보</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            MVP에서는 실제 추천 로직을 실행하지 않지만, 추후 성별 반대 조건을 추천 기준으로 적용할 수 있도록 설계합니다.
          </p>
          <div className="mt-5 space-y-8">
            <div data-error-key="preferredAgeRanges">
              <p className="label-base">만나고 싶은 사람의 연령대</p>
              <p className="help-text mt-1">최대 4개까지 선택할 수 있습니다.</p>
              {renderChipGroup("preferredAgeRanges", AGE_RANGE_OPTIONS, values.preferredAgeRanges, { limit: 4 })}
              <div className="mt-3">
                <PrioritySorter
                  items={values.preferredAgeRanges}
                  onChange={(items) => setValue("preferredAgeRanges", items)}
                  removable
                  error={errors.preferredAgeRanges}
                />
              </div>
            </div>
            <div data-error-key="preferredRegions">
              <p className="label-base">선호 지역</p>
              <p className="help-text mt-1">시/도, 시/군/구, 읍/면/동을 선택해 여러 지역을 추가할 수 있습니다.</p>
              <div className="mt-3">
                <RegionSelector
                  value={values.preferredRegions}
                  onChange={(regions) => setValue("preferredRegions", regions)}
                  error={errors.preferredRegions}
                />
              </div>
            </div>
            <div data-error-key="meetingTimelines">
              <p className="label-base">만남 희망 시점</p>
              <p className="help-text mt-1">최대 2개까지 선택할 수 있습니다.</p>
              {renderChipGroup("meetingTimelines", MEETING_TIMELINE_OPTIONS, values.meetingTimelines, { limit: 2 })}
              <div className="mt-3">
                <PrioritySorter
                  items={values.meetingTimelines}
                  onChange={(items) => setValue("meetingTimelines", items)}
                  removable
                  error={errors.meetingTimelines}
                />
              </div>
            </div>
            <div data-error-key="partnerPriority">
              <p className="label-base">중요하게 보는 조건 우선순위</p>
              <p className="help-text mt-1">모든 항목을 위/아래 버튼으로 정렬해 주세요.</p>
              <div className="mt-3">
                <PrioritySorter
                  items={values.partnerPriority}
                  onChange={(items) => setValue("partnerPriority", items)}
                  error={errors.partnerPriority}
                />
              </div>
            </div>
            <div data-error-key="datingValues">
              <p className="label-base">연애에서 중요하게 생각하는 가치</p>
              {renderChipGroup("datingValues", DATING_VALUE_OPTIONS, values.datingValues)}
              {errors.datingValues ? <p className="error-text mt-2">{errors.datingValues}</p> : null}
            </div>
          </div>
        </section>
      );
    }

    if (values.cardPurpose === "local_friend") {
      return (
        <section className="surface rounded-lg p-5">
          <h2 className="text-lg font-black text-stone-950">동네친구 정보</h2>
          <div className="mt-5 space-y-8">
            <div data-error-key="preferredRegions">
              <p className="label-base">선호 지역</p>
              <p className="help-text mt-1">읍/면/동에서 전체를 선택하면 해당 시/군/구 전체를 의미합니다.</p>
              <div className="mt-3">
                <RegionSelector
                  value={values.preferredRegions}
                  onChange={(regions) => setValue("preferredRegions", regions)}
                  error={errors.preferredRegions}
                />
              </div>
            </div>
            <div data-error-key="localDistance">
              <p className="label-base">만나고 싶은 거리감</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {LOCAL_DISTANCE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setValue("localDistance", item)}
                    className={checkboxButtonClass(values.localDistance === item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {errors.localDistance ? <p className="error-text mt-2">{errors.localDistance}</p> : null}
            </div>
            <div data-error-key="localActivities">
              <p className="label-base">선호 활동</p>
              {renderChipGroup("localActivities", LOCAL_ACTIVITY_OPTIONS, values.localActivities)}
              {errors.localActivities ? <p className="error-text mt-2">{errors.localActivities}</p> : null}
            </div>
            <div data-error-key="availableTimes">
              <p className="label-base">만남 가능 시간대</p>
              {renderChipGroup("availableTimes", AVAILABLE_TIME_OPTIONS, values.availableTimes)}
              {errors.availableTimes ? <p className="error-text mt-2">{errors.availableTimes}</p> : null}
            </div>
          </div>
        </section>
      );
    }

    if (values.cardPurpose === "hobby_buddy") {
      return (
        <section className="surface rounded-lg p-5">
          <h2 className="text-lg font-black text-stone-950">취미 정보</h2>
          <div className="mt-5 space-y-8">
            <div data-error-key="hobbyIds">
              <p className="label-base">함께하고 싶은 취미</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {HOBBIES.map((hobby) => (
                  <button
                    key={hobby.id}
                    type="button"
                    onClick={() => setValue("hobbyIds", toggleItem(values.hobbyIds, hobby.id))}
                    className={checkboxButtonClass(values.hobbyIds.includes(hobby.id))}
                  >
                    {hobby.label}
                  </button>
                ))}
              </div>
              {errors.hobbyIds ? <p className="error-text mt-2">{errors.hobbyIds}</p> : null}
            </div>
            <SelectField
              id="hobbyLevel"
              label="취미 숙련도"
              options={HOBBY_LEVEL_OPTIONS}
              value={values.hobbyLevel}
              onChange={(event) => setValue("hobbyLevel", event.target.value)}
              error={errors.hobbyLevel}
            />
            <div data-error-key="preferredRegions">
              <p className="label-base">선호 지역</p>
              <div className="mt-3">
                <RegionSelector
                  value={values.preferredRegions}
                  onChange={(regions) => setValue("preferredRegions", regions)}
                  error={errors.preferredRegions}
                />
              </div>
            </div>
            <div data-error-key="availableTimes">
              <p className="label-base">만남 가능 시간대</p>
              {renderChipGroup("availableTimes", AVAILABLE_TIME_OPTIONS, values.availableTimes)}
              {errors.availableTimes ? <p className="error-text mt-2">{errors.availableTimes}</p> : null}
            </div>
            <div data-error-key="hobbyParticipationTypes">
              <p className="label-base">원하는 참여 방식</p>
              {renderChipGroup("hobbyParticipationTypes", HOBBY_PARTICIPATION_OPTIONS, values.hobbyParticipationTypes)}
              {errors.hobbyParticipationTypes ? <p className="error-text mt-2">{errors.hobbyParticipationTypes}</p> : null}
            </div>
          </div>
        </section>
      );
    }

    return null;
  }

  if (loading) {
    return <div className="surface min-h-96 animate-pulse rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-teal-800">{mode === "create" ? "New card" : "Edit card"}</p>
        <h1 className="mt-2 text-3xl font-black text-stone-950">{title}</h1>
      </div>

      {missingConfig ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900">
          Supabase 환경변수가 아직 설정되지 않았습니다. 저장과 이미지 업로드는 환경변수 설정 후 동작합니다.
        </div>
      ) : null}

      <section className="surface rounded-lg p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-teal-800" size={20} />
          <div>
            <h2 className="text-lg font-black text-stone-950">계정 회원정보</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              이 정보는 계정 정보와 연결되어 표시됩니다. 수정이 필요한 경우 계정 설정에서 변경해 주세요.
            </p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {accountRows.map(([label, value]) => (
            <div key={label} className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
              <dt className="text-xs font-bold text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-stone-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="surface rounded-lg p-5" data-error-key="cardPurpose">
        <h2 className="text-lg font-black text-stone-950">이 카드는 어떤 인맥을 만나기 위한 카드인가요?</h2>
        {purposeLocked ? (
          <div className="mt-4 rounded-md border border-teal-100 bg-teal-50 px-4 py-3">
            <p className="text-sm font-bold text-teal-950">카드 목적: {getCardPurposeLabel(savedPurpose)}</p>
            <p className="mt-1 text-xs leading-5 text-teal-900">카드 목적은 생성 후 변경할 수 없습니다. 목적이 다른 카드는 새로 만들어 주세요.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {CARD_PURPOSES.map((purpose) => (
                <button
                  key={purpose.id}
                  type="button"
                  onClick={() => setValue("cardPurpose", purpose.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    values.cardPurpose === purpose.id
                      ? "border-teal-700 bg-teal-50 text-teal-950"
                      : "border-stone-200 bg-white text-stone-800 hover:bg-stone-50"
                  }`}
                >
                  <span className="text-base font-black">{purpose.label}</span>
                  <span className="mt-2 block text-sm leading-6 text-stone-600">{purpose.description}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              카드 목적은 저장 후 변경할 수 없습니다. 다른 목적의 카드를 만들고 싶다면 새 카드를 생성해 주세요.
            </p>
          </>
        )}
        {errors.cardPurpose ? <p className="error-text mt-2">{errors.cardPurpose}</p> : null}
      </section>

      {showDetailForm ? (
        <>
          <section className="surface rounded-lg p-5">
            <h2 className="text-lg font-black text-stone-950">기본 카드 정보</h2>
            <div className="mt-5 grid gap-5">
              <FormField
                id="cardName"
                label="카드 이름"
                value={values.cardName}
                onChange={(event) => setValue("cardName", event.target.value)}
                error={errors.cardName}
                help="카드 이름은 본인이 카드를 구분하기 위한 이름이며, 상대방에게 노출되지 않을 수 있습니다."
                maxLength={12}
              />
              <div data-error-key="mainImageUrl">
                <ImageUploader
                  label="카드 대표 프로필 이미지"
                  bucket="profile-images"
                  value={values.mainImageUrl ? [values.mainImageUrl] : []}
                  onChange={(urls) => setValue("mainImageUrl", urls[0] ?? "")}
                  maxFiles={1}
                  error={errors.mainImageUrl}
                  help="상대방에게 가장 먼저 보이는 대표 사진입니다. 본인을 잘 보여줄 수 있는 사진을 등록해 주세요."
                />
              </div>
              <div className="space-y-1.5" data-error-key="selfIntroduction">
                <label htmlFor="selfIntroduction" className="label-base">
                  자기소개
                </label>
                <textarea
                  id="selfIntroduction"
                  className="input-base min-h-36 resize-y"
                  value={values.selfIntroduction}
                  onChange={(event) => setValue("selfIntroduction", event.target.value)}
                  maxLength={600}
                  placeholder="이 목적의 카드에서 보여주고 싶은 나를 소개해 주세요."
                />
                <p className="help-text">20자 이상, 600자 이내로 입력해 주세요.</p>
                {errors.selfIntroduction ? <p className="error-text">{errors.selfIntroduction}</p> : null}
              </div>
            </div>
          </section>

          {renderPurposeFields()}

          <section className="surface rounded-lg p-5">
            <h2 className="text-lg font-black text-stone-950">선택 정보</h2>
            <div className="mt-5 space-y-7">
              <div data-error-key="additionalImageUrls">
                <ImageUploader
                  label="추가 이미지"
                  bucket="card-gallery-images"
                  value={values.additionalImageUrls}
                  onChange={(urls) => setValue("additionalImageUrls", urls)}
                  maxFiles={6}
                  error={errors.additionalImageUrls}
                  help="최대 6장까지 등록할 수 있습니다."
                />
              </div>
              <div data-error-key="socialAccounts">
                <p className="label-base">소셜 계정 ID</p>
                <p className="help-text mt-1">선택 항목이며 여러 행을 추가할 수 있습니다.</p>
                <div className="mt-3">
                  <SocialAccountsEditor
                    value={values.socialAccounts}
                    onChange={(accounts) => setValue("socialAccounts", accounts)}
                    error={errors.socialAccounts}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="surface rounded-lg p-5">
            <h2 className="text-lg font-black text-stone-950">정보 제공 동의</h2>
            <div className="mt-4 space-y-3">
              <div data-error-key="agreedCardDisclosure">
                <ConsentModal
                  content={cardConsentContents[0]}
                  checked={values.agreedCardDisclosure}
                  onChange={(checked) => setValue("agreedCardDisclosure", checked)}
                />
                {errors.agreedCardDisclosure ? <p className="error-text mt-1">{errors.agreedCardDisclosure}</p> : null}
              </div>
              <div data-error-key="agreedContactDisclosure">
                <ConsentModal
                  content={cardConsentContents[1]}
                  checked={values.agreedContactDisclosure}
                  onChange={(checked) => setValue("agreedContactDisclosure", checked)}
                />
                {errors.agreedContactDisclosure ? <p className="error-text mt-1">{errors.agreedContactDisclosure}</p> : null}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {formError ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{formError}</p> : null}

      {showDetailForm ? (
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-[color:var(--line)] bg-[color:var(--background)]/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => persist("draft")} disabled={Boolean(saving)}>
              {saving === "draft" ? "임시저장 중" : "임시저장"}
            </Button>
            <Button type="button" icon={<Save size={17} />} onClick={() => persist("active")} disabled={Boolean(saving)}>
              {saving === "save" ? "저장 중" : "저장"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (dirty) setCancelOpen(true);
                else router.back();
              }}
            >
              취소
            </Button>
            <Link href="/dashboard/cards" className="inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">
              목록
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Link href="/dashboard/cards" className="inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">
            목록
          </Link>
        </div>
      )}

      <Modal
        open={cancelOpen}
        title="작성 취소"
        confirmLabel="나가기"
        onClose={() => setCancelOpen(false)}
        onConfirm={() => router.back()}
      >
        작성 중인 내용이 저장되지 않고 사라집니다. 나가시겠습니까?
      </Modal>
    </div>
  );
}
