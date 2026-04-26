"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SelectField } from "@/components/common/SelectField";
import { DEFAULT_DONG, SIDO_OPTIONS, getDongOptions, getSigunguOptions } from "@/lib/constants/regions";
import type { PreferredRegion } from "@/types/card";

interface RegionSelectorProps {
  value: PreferredRegion[];
  onChange: (regions: PreferredRegion[]) => void;
  error?: string;
}

export function RegionSelector({ value, onChange, error }: RegionSelectorProps) {
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [dong, setDong] = useState(DEFAULT_DONG);
  const sigunguOptions = useMemo(() => getSigunguOptions(sido), [sido]);
  const dongOptions = useMemo(() => getDongOptions(sido, sigungu), [sido, sigungu]);

  function addRegion() {
    if (!sido || !sigungu || !dong) return;
    if (value.some((region) => region.sido === sido && region.sigungu === sigungu && region.dong === dong)) return;

    onChange([...value, { sido, sigungu, dong }]);
    setSigungu("");
    setDong(DEFAULT_DONG);
  }

  function removeRegion(regionToRemove: PreferredRegion) {
    onChange(
      value.filter(
        (region) =>
          region.sido !== regionToRemove.sido ||
          region.sigungu !== regionToRemove.sigungu ||
          region.dong !== regionToRemove.dong,
      ),
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <SelectField
          id="preferred-region-sido"
          label="시/도"
          options={SIDO_OPTIONS}
          value={sido}
          onChange={(event) => {
            setSido(event.target.value);
            setSigungu("");
            setDong(DEFAULT_DONG);
          }}
        />
        <SelectField
          id="preferred-region-sigungu"
          label="시/군/구"
          options={sigunguOptions}
          value={sigungu}
          onChange={(event) => {
            setSigungu(event.target.value);
            setDong(DEFAULT_DONG);
          }}
          disabled={!sido}
        />
        <SelectField
          id="preferred-region-dong"
          label="읍/면/동"
          options={dongOptions}
          value={dong}
          onChange={(event) => setDong(event.target.value)}
          disabled={!sigungu}
        />
        <Button type="button" variant="secondary" onClick={addRegion} disabled={!sido || !sigungu || !dong}>
          추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((region) => (
          <span
            key={`${region.sido}-${region.sigungu}-${region.dong}`}
            className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-900"
          >
            {region.sido} {region.sigungu} {region.dong}
            <button type="button" onClick={() => removeRegion(region)} aria-label={`${region.sido} ${region.sigungu} ${region.dong} 삭제`}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
