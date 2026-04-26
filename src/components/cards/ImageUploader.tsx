"use client";

import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { extractStoragePathFromPublicUrl } from "@/lib/utils/storage";
import { MAX_GALLERY_IMAGES, validateImageFile } from "@/lib/validation/cardValidation";

interface ImageUploaderProps {
  label: string;
  bucket: "profile-images" | "card-gallery-images";
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles: number;
  help?: string;
  error?: string;
}

export function ImageUploader({ label, bucket, value, onChange, maxFiles, help, error }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");

  async function removeImage(url: string) {
    onChange(value.filter((current) => current !== url));

    if (!isSupabaseConfigured()) return;
    const path = extractStoragePathFromPublicUrl(url, bucket);
    if (!path) return;

    const supabase = createClient();
    await supabase.storage.from(bucket).remove([path]);
  }

  async function handleFiles(files: FileList | null) {
    setLocalError("");

    if (!files?.length) return;

    if (!isSupabaseConfigured()) {
      setLocalError("Supabase 환경변수를 설정한 뒤 이미지를 업로드할 수 있습니다.");
      return;
    }

    const incoming = Array.from(files);

    if (value.length + incoming.length > maxFiles) {
      setLocalError(maxFiles === 1 ? "대표 이미지는 1장만 등록할 수 있습니다." : `추가 이미지는 최대 ${MAX_GALLERY_IMAGES}장까지 등록할 수 있습니다.`);
      return;
    }

    const invalid = incoming.map(validateImageFile).find(Boolean);
    if (invalid) {
      setLocalError(invalid);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLocalError("로그인 후 이미지를 업로드할 수 있습니다.");
      setUploading(false);
      return;
    }

    const uploadedUrls: string[] = [];

    for (const file of incoming) {
      const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "-");
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        cacheControl: "3600",
      });

      if (uploadError) {
        setLocalError(uploadError.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    onChange(maxFiles === 1 ? uploadedUrls.slice(0, 1) : [...value, ...uploadedUrls]);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="label-base">{label}</p>
        {help ? <p className="help-text mt-1">{help}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {value.map((url) => (
          <div key={url} className="relative aspect-[4/5] overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
            <Image src={url} alt="업로드 이미지 미리보기" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-rose-700 shadow-sm hover:bg-white"
              aria-label="이미지 삭제"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        {value.length < maxFiles ? (
          <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white px-4 text-center text-sm font-semibold text-stone-600 hover:border-teal-700 hover:text-teal-900">
            <ImagePlus className="mb-2" size={26} />
            {uploading ? "업로드 중" : "이미지 선택"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple={maxFiles > 1}
              className="sr-only"
              onChange={(event) => handleFiles(event.target.files)}
              disabled={uploading}
            />
          </label>
        ) : null}
      </div>
      {localError || error ? <p className="error-text">{localError || error}</p> : null}
    </div>
  );
}
