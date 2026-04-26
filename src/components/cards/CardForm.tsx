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
  DEFAULT_PARTNER_PRIORITIES,
  EDUCATION_OPTIONS,
  JOB_OPTIONS,
  MARRIAGE_TIMELINE_OPTIONS,
  REASON_OPTIONS,
} from "@/lib/constants/cardOptions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toMatchingCard, toMatchingCardImage, toSocialAccount, toUserProfile } from "@/lib/supabase/mappers";
import { EMPTY_CARD_FORM_VALUES, validateCard, type CardFormValues } from "@/lib/validation/cardValidation";
import type { ConsentContent } from "@/types/consent";
import type {
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
    title: "카드 정보 일부 공개 동의",
    required: true,
    body: "향후 매칭 후보에게 카드 이름을 제외한 프로필 이미지, 선호 조건, 자기소개성 정보 일부가 공개될 수 있습니다. MVP에서는 실제 후보 공개 기능을 실행하지 않습니다.",
  },
  {
    key: "contactDisclosure",
    title: "상호 관심 시 추가 정보 공개 동의",
    required: true,
    body: "서로 관심 의사가 확인된 경우, 연락처 등 추가 정보가 공개될 수 있는 구조를 준비하기 위한 동의입니다. MVP에서는 연락처 자동 공개 기능을 실행하지 않습니다.",
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

function checkboxButtonClass(active: boolean) {
  return `min-h-10 rounded-md border px-3 text-sm font-semibold transition ${
    active ? "border-teal-700 bg-teal-50 text-teal-900" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
  }`;
}

export function CardForm({ mode, cardId }: CardFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CardFormValues>(EMPTY_CARD_FORM_VALUES);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState<"save" | "draft" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const missingConfig = !isSupabaseConfigured();

  const title = mode === "create" ? "새 카드 만들기" : "카드 수정";

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

        setValues({
          cardName: card.cardName,
          mainImageUrl: card.mainImageUrl,
          educationLevel: card.educationLevel,
          jobType: card.jobType,
          preferredAgeRanges: card.preferredAgeRanges,
          marriageTimelines: card.marriageTimelines,
          partnerPriority: card.partnerPriority.length ? card.partnerPriority : DEFAULT_PARTNER_PRIORITIES,
          reasonsForUse: card.reasonsForUse,
          preferredRegions: card.preferredRegions,
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
      ["거주지", profile ? `${profile.sido} ${profile.sigungu}` : "-"],
    ],
    [profile],
  );

  function setValue<T extends keyof CardFormValues>(key: T, value: CardFormValues[T]) {
    setValues((current) => ({ ...current, [key]: value }));
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
    const normalizedValues = {
      ...values,
      cardName: values.cardName.trim() || makeDraftCardName(),
      socialAccounts: values.socialAccounts.filter((account) => account.urlOrId.trim()),
    };
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
      card_name: normalizedValues.cardName,
      status,
      main_image_url: normalizedValues.mainImageUrl || null,
      education_level: normalizedValues.educationLevel || null,
      job_type: normalizedValues.jobType || null,
      preferred_age_ranges: normalizedValues.preferredAgeRanges,
      marriage_timelines: normalizedValues.marriageTimelines,
      partner_priority: normalizedValues.partnerPriority,
      reasons_for_use: normalizedValues.reasonsForUse,
      preferred_regions: normalizedValues.preferredRegions,
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
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accountRows.map(([label, value]) => (
            <div key={label} className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
              <dt className="text-xs font-bold text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-stone-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

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
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="educationLevel"
              label="최종 학력"
              options={EDUCATION_OPTIONS}
              value={values.educationLevel}
              onChange={(event) => setValue("educationLevel", event.target.value as CardFormValues["educationLevel"])}
              error={errors.educationLevel}
            />
            <SelectField
              id="jobType"
              label="현재 직업"
              options={JOB_OPTIONS}
              value={values.jobType}
              onChange={(event) => setValue("jobType", event.target.value as CardFormValues["jobType"])}
              error={errors.jobType}
            />
          </div>
        </div>
      </section>

      <section className="surface rounded-lg p-5">
        <h2 className="text-lg font-black text-stone-950">매칭 선호 조건</h2>
        <div className="mt-5 space-y-8">
          <div data-error-key="preferredAgeRanges">
            <p className="label-base">매칭 가능 연령대 및 우선순위</p>
            <p className="help-text mt-1">최대 4개까지 선택할 수 있습니다.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AGE_RANGE_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setValue("preferredAgeRanges", toggleLimited(values.preferredAgeRanges, item, 4))}
                  className={checkboxButtonClass(values.preferredAgeRanges.includes(item))}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <PrioritySorter
                items={values.preferredAgeRanges}
                onChange={(items) => setValue("preferredAgeRanges", items)}
                removable
                error={errors.preferredAgeRanges}
              />
            </div>
          </div>

          <div data-error-key="marriageTimelines">
            <p className="label-base">결혼 희망 시기</p>
            <p className="help-text mt-1">최대 2개까지 선택할 수 있습니다.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {MARRIAGE_TIMELINE_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setValue("marriageTimelines", toggleLimited(values.marriageTimelines, item, 2))}
                  className={checkboxButtonClass(values.marriageTimelines.includes(item))}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <PrioritySorter
                items={values.marriageTimelines}
                onChange={(items) => setValue("marriageTimelines", items)}
                removable
                error={errors.marriageTimelines}
              />
            </div>
          </div>

          <div data-error-key="partnerPriority">
            <p className="label-base">상대방 조건 우선순위</p>
            <p className="help-text mt-1">모든 항목을 위/아래 버튼으로 정렬해 주세요.</p>
            <div className="mt-3">
              <PrioritySorter
                items={values.partnerPriority}
                onChange={(items) => setValue("partnerPriority", items)}
                error={errors.partnerPriority}
              />
            </div>
          </div>

          <div data-error-key="reasonsForUse">
            <p className="label-base">자신 설명: 이 서비스를 찾는 이유</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {REASON_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setValue(
                      "reasonsForUse",
                      values.reasonsForUse.includes(item)
                        ? values.reasonsForUse.filter((value) => value !== item)
                        : [...values.reasonsForUse, item],
                    )
                  }
                  className={checkboxButtonClass(values.reasonsForUse.includes(item))}
                >
                  {item}
                </button>
              ))}
            </div>
            {errors.reasonsForUse ? <p className="error-text mt-2">{errors.reasonsForUse}</p> : null}
          </div>

          <div data-error-key="preferredRegions">
            <p className="label-base">희망하는 상대 거주지</p>
            <p className="help-text mt-1">시/도와 시/군/구를 선택해 여러 지역을 추가할 수 있습니다.</p>
            <div className="mt-3">
              <RegionSelector
                value={values.preferredRegions}
                onChange={(regions) => setValue("preferredRegions", regions)}
                error={errors.preferredRegions}
              />
            </div>
          </div>
        </div>
      </section>

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

      {formError ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{formError}</p> : null}

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
