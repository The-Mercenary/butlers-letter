import { LockKeyhole, SearchCheck, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";

const trustItems = [
  {
    title: "개인정보 보호",
    description: "사용자의 개인정보와 프로필 정보는 매칭 검토 목적에 한해 사용되며, 동의 없이 외부에 판매하거나 공개하지 않습니다.",
    icon: LockKeyhole,
  },
  {
    title: "프로필 검수",
    description: "허위 또는 부적절한 프로필은 검수 및 제한될 수 있는 구조로 확장할 수 있습니다.",
    icon: ShieldCheck,
  },
  {
    title: "신중한 매칭",
    description: "단순 조건뿐 아니라 선호 조건, 소개 내용, 가치관 정보를 함께 고려하는 구조를 지향합니다.",
    icon: SearchCheck,
  },
  {
    title: "합리적인 이용 구조",
    description: "적합한 후보가 없는 경우 무리하게 소개하지 않는 정책을 지향합니다. 결제 정책은 추후 확정합니다.",
    icon: SlidersHorizontal,
  },
  {
    title: "프라이빗 공개 방식",
    description: "서로 관심 의사를 표현한 경우에만 더 많은 프로필 정보와 연락처 공개가 가능하도록 확장합니다.",
    icon: UsersRound,
  },
];

export function TrustSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-teal-800">왜 믿을 수 있나요?</p>
          <h2 className="mt-3 text-3xl font-black text-stone-950 sm:text-4xl">신중한 만남을 위한 기본 원칙</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="surface rounded-lg p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-800">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-stone-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
