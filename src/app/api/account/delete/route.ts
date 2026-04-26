import { NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { extractStoragePathFromPublicUrl } from "@/lib/utils/storage";

export async function DELETE() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  if (!admin) {
    return NextResponse.json(
      { message: "SUPABASE_SERVICE_ROLE_KEY가 없어 Auth 계정 삭제를 완료할 수 없습니다. README의 Edge Function/API 분리 안내를 확인해 주세요." },
      { status: 501 },
    );
  }

  const { data: cards } = await admin.from("matching_cards").select("id, main_image_url").eq("user_id", user.id);
  const cardIds = (cards ?? []).map((card) => card.id as string);

  const { data: galleryImages } = cardIds.length
    ? await admin.from("matching_card_images").select("image_url").in("card_id", cardIds)
    : { data: [] };

  const profilePaths = (cards ?? [])
    .map((card) => extractStoragePathFromPublicUrl(String(card.main_image_url ?? ""), "profile-images"))
    .filter(Boolean);
  const galleryPaths = (galleryImages ?? [])
    .map((image) => extractStoragePathFromPublicUrl(String(image.image_url ?? ""), "card-gallery-images"))
    .filter(Boolean);

  await Promise.all([
    profilePaths.length ? admin.storage.from("profile-images").remove(profilePaths) : Promise.resolve(),
    galleryPaths.length ? admin.storage.from("card-gallery-images").remove(galleryPaths) : Promise.resolve(),
  ]);

  if (cardIds.length) {
    await admin.from("social_accounts").delete().in("card_id", cardIds);
    await admin.from("matching_card_images").delete().in("card_id", cardIds);
  }

  await admin.from("matching_cards").delete().eq("user_id", user.id);
  await admin.from("user_profiles").delete().eq("id", user.id);

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    return NextResponse.json({ message: deleteUserError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
