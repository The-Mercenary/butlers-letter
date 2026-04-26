"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SelectField } from "@/components/common/SelectField";
import { SIDO_OPTIONS, getSigunguOptions } from "@/lib/constants/regions";
import type { PreferredRegion } from "@/types/card";

interface RegionSelectorProps {
  value: PreferredRegion[];
  onChange: (regions: PreferredRegion[]) => void;
  error?: string;
}

export function RegionSelector({ value, onChange, error }: RegionSelectorProps) {
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const sigunguOptions = useMemo(() => getSigunguOptions(sido), [sido]);

  function addRegion() {
    if (!sido || !sigungu) return;
    if (value.some((region) => region.sido === sido && region.sigungu === sigungu)) return;

    onChange([...value, { sido, sigungu }]);
    setSigungu("");
  }

  function removeRegion(regionToRemove: PreferredRegion) {
    onChange(value.filter((region) => region.sido !== regionToRemove.sido || region.sigungu !== regionToRemove.sigungu));
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <SelectField
          id="preferred-region-sido"
          label="시/도"
          options={SIDO_OPTIONS}
          value={sido}
          onChange={(event) => {
            setSido(event.target.value);
            setSigungu("");
          }}
        />
        <SelectField
          id="preferred-region-sigungu"
          label="시/군/구"
          options={sigunguOptions}
          value={sigungu}
          onChange={(event) => setSigungu(event.target.value)}
          disabled={!sido}
        />
        <Button type="button" variant="secondary" onClick={addRegion} disabled={!sido || !sigungu}>
          추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((region) => (
          <span
            key={`${region.sido}-${region.sigungu}`}
            className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-900"
          >
            {region.sido} {region.sigungu}
            <button type="button" onClick={() => removeRegion(region)} aria-label={`${region.sido} ${region.sigungu} 삭제`}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
