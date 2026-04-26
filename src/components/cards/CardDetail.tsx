"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { BIRTH_TIME_OPTIONS, getBirthTimeLabel } from "@/lib/constants/birthTimes";
import { CARD_STATUS_LABELS, getEducationLabel, getJobLabel, getSocialPlatformLabel } from "@/lib/constants/cardOptions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toMatchingCard, toMatchingCardImage, toSocialAccount, toUserProfile } from "@/lib/supabase/mappers";
import { extractStoragePathFromPublicUrl } from "@/lib/utils/storage";
import type { MatchingCard, MatchingCardImage, MatchingCardImageRow, MatchingCardRow, SocialAccount, SocialAccountRow } from "@/types/card";
import type { UserProfile, UserProfileRow } from "@/types/user";

interface CardDetailProps {
  cardId: string;
}

export function CardDetail({ cardId }: CardDetailProps) {
  const router = useRouter();
  const [card, setCard] = useState<MatchingCard | null>(null);
  const [images, setImages] = useState<MatchingCardImage[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadCard() {
      if (!isSupabaseConfigured()) {
        setError("Supabase 환경변수를 설정하면 카드 정보를 불러올 수 있습니다.");
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

      const [{ data: cardData, error: cardError }, { data: profileData }, { data: imageData }, { data: socialData }] = await Promise.all([
        supabase.from("matching_cards").select("*").eq("id", cardId).eq("user_id", user.id).maybeSingle(),
        supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("matching_card_images").select("*").eq("card_id", cardId).order("sort_order", { ascending: true }),
        supabase.from("social_accounts").select("*").eq("card_id", cardId).order("created_at", { ascending: true }),
      ]);

      if (cardError || !cardData) {
        setError("카드를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      setCard(toMatchingCard(cardData as MatchingCardRow));
      setProfile(profileData ? toUserProfile(profileData as UserProfileRow) : null);
      setImages(((imageData ?? []) as MatchingCardImageRow[]).map(toMatchingCardImage));
      setSocialAccounts(((socialData ?? []) as SocialAccountRow[]).map(toSocialAccount));
      setLoading(false);
    }

    loadCard();
  }, [cardId]);

  async function handleDelete() {
    if (!card || !isSupabaseConfigured()) return;

    setDeleting(true);
    const supabase = createClient();

    const paths = [
      { bucket: "profile-images" as const, url: card.mainImageUrl },
      ...images.map((image) => ({ bucket: "card-gallery-images" as const, url: image.imageUrl })),
    ]
      .map(({ bucket, url }) => ({ bucket, path: extractStoragePathFromPublicUrl(url, bucket) }))
      .filter((item) => item.path);

    const profileImagePaths = paths.filter((item) => item.bucket === "profile-images").map((item) => item.path);
    const galleryPaths = paths.filter((item) => item.bucket === "card-gallery-images").map((item) => item.path);

    await Promise.all([
      profileImagePaths.length ? supabase.storage.from("profile-images").remove(profileImagePaths) : Promise.resolve(),
      galleryPaths.length ? supabase.storage.from("card-gallery-images").remove(galleryPaths) : Promise.resolve(),
    ]);

    const { error: deleteError } = await supabase.from("matching_cards").delete().eq("id", card.id).eq("user_id", card.userId);

    setDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.push("/dashboard/cards");
    router.refresh();
  }

  if (loading) {
    return <div className="surface min-h-96 animate-pulse rounded-lg" />;
  }

  if (error || !card) {
    return <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error || "카드를 찾을 수 없습니다."}</p>;
  }

  const rows = [
    ["이름", profile?.name ?? "-"],
    ["성별", profile?.gender === "male" ? "남성" : profile?.gender === "female" ? "여성" : "-"],
    ["생년월일", profile?.birthDate ?? "-"],
    ["태어난 시간", profile?.birthTimeCode ? getBirthTimeLabel(profile.birthTimeCode) : BIRTH_TIME_OPTIONS[0].label],
    ["이메일", profile?.email ?? "-"],
    ["휴대전화번호", profile?.phone ?? "-"],
    ["거주지", profile ? `${profile.sido} ${profile.sigungu}` : "-"],
    ["최종 학력", getEducationLabel(card.educationLevel)],
    ["현재 직업", getJobLabel(card.jobType)],
    ["매칭 가능 연령대", card.preferredAgeRanges.join(" > ") || "-"],
    ["결혼 희망 시기", card.marriageTimelines.join(" > ") || "-"],
    ["상대방 조건 우선순위", card.partnerPriority.join(" > ") || "-"],
    ["자신 설명", card.reasonsForUse.join(", ") || "-"],
    ["희망 상대 거주지", card.preferredRegions.map((region) => `${region.sido} ${region.sigungu}`).join(", ") || "-"],
    ["카드 상태", CARD_STATUS_LABELS[card.status]],
    ["생성일", new Date(card.createdAt).toLocaleString("ko-KR")],
    ["수정일", new Date(card.updatedAt).toLocaleString("ko-KR")],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal-800">Card detail</p>
          <h1 className="mt-2 text-3xl font-black text-stone-950">{card.cardName}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/cards/${card.id}/edit`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-900 transition hover:bg-stone-50"
          >
            <Pencil size={17} />
            수정
          </Link>
          <Button type="button" variant="danger" icon={<Trash2 size={17} />} onClick={() => setDeleteOpen(true)}>
            삭제
          </Button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="surface overflow-hidden rounded-lg">
          <div className="relative aspect-[4/5] bg-stone-100">
            {card.mainImageUrl ? <Image src={card.mainImageUrl} alt={`${card.cardName} 대표 이미지`} fill className="object-cover" unoptimized /> : null}
          </div>
        </div>
        <div className="surface rounded-lg p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="border-b border-stone-100 pb-3">
                <dt className="text-xs font-bold text-stone-500">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold leading-6 text-stone-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="surface rounded-lg p-5">
        <h2 className="text-lg font-black text-stone-950">추가 이미지</h2>
        {images.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-100">
                <Image src={image.imageUrl} alt="추가 이미지" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500">등록된 추가 이미지가 없습니다.</p>
        )}
      </section>

      <section className="surface rounded-lg p-5">
        <h2 className="text-lg font-black text-stone-950">소셜 계정</h2>
        {socialAccounts.length ? (
          <ul className="mt-3 space-y-2">
            {socialAccounts.map((account) => (
              <li key={account.id} className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
                <span className="font-bold text-stone-950">{getSocialPlatformLabel(account.platform)}</span> · {account.urlOrId}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-stone-500">등록된 소셜 계정이 없습니다.</p>
        )}
      </section>

      <Modal
        open={deleteOpen}
        title="카드 삭제"
        danger
        confirmLabel={deleting ? "삭제 중" : "삭제"}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleting ? undefined : handleDelete}
      >
        이 카드를 삭제하시겠습니까? 삭제된 카드는 복구할 수 없습니다.
      </Modal>
    </div>
  );
}
