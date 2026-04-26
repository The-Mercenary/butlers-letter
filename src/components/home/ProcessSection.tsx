const processSteps = [
  ["01", "회원가입", "이메일 인증과 기본 정보를 등록합니다."],
  ["02", "내 카드 생성", "나를 표현하는 목적별 카드를 만듭니다."],
  ["03", "추천 목적 선택", "데이트, 취미, 동네 친구, 업계 네트워크 중 원하는 목적을 정합니다."],
  ["04", "추천 카드 확인", "해당 목적에 맞는 사람을 추천받을 수 있도록 구조를 준비합니다."],
  ["05", "서로 동의 시 연락처 공개", "양쪽이 모두 동의한 경우에만 연락처 공개로 확장합니다."],
];

export function ProcessSection() {
  return (
    <section className="bg-stone-950 py-16 text-white sm:py-20">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold text-teal-200">어떻게 이용하나요?</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">목적을 고르고, 신중하게 연결되는 흐름</h2>
            <p className="mt-5 text-sm leading-6 text-stone-300">
              먼저 나를 표현하는 카드를 만듭니다. 이후 데이트, 취미, 동네 친구, 동종 업계 네트워크 등 원하는 추천 목적을 선택하면,
              해당 목적에 맞는 사람을 추천받을 수 있습니다. 양쪽이 모두 동의한 경우에만 연락처가 공개됩니다.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {processSteps.map(([number, title, description]) => (
              <article key={title} className="rounded-lg border border-white/15 bg-white/8 p-5">
                <span className="text-sm font-black text-teal-200">{number}</span>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
