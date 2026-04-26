import { LockKeyhole, SearchCheck, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";

const trustItems = [
  {
    title: "목적 기반 추천",
    description: "데이트, 취미, 동네 친구, 업계 네트워크 등 사용자가 원하는 목적에 맞춰 사람을 추천합니다.",
    icon: SearchCheck,
  },
  {
    title: "상호 동의 기반 연락처 공개",
    description: "연락처는 한쪽이 일방적으로 볼 수 없습니다. 서로가 더 알아가고 싶다고 동의한 경우에만 추가 정보가 공개됩니다.",
    icon: UsersRound,
  },
  {
    title: "개인정보 보호",
    description: "등록한 개인정보와 프로필 정보는 서비스 이용 목적에 맞게 관리되며, 동의 없이 외부에 판매하거나 공개하지 않습니다.",
    icon: LockKeyhole,
  },
  {
    title: "신중한 프로필 운영",
    description: "부적절하거나 허위로 의심되는 프로필은 제한될 수 있습니다.",
    icon: ShieldCheck,
  },
  {
    title: "다양한 관계 목적",
    description: "연애뿐 아니라 취미, 동네, 직업 네트워크까지 다양한 목적의 연결을 지원할 수 있도록 설계합니다.",
    icon: SlidersHorizontal,
  },
];

export function TrustSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-teal-800">왜 버틀러스레터인가요?</p>
          <h2 className="mt-3 text-3xl font-black text-stone-950 sm:text-4xl">새로운 사람을 조심스럽게 발견하기 위한 원칙</h2>
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
