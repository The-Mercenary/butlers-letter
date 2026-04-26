const processSteps = [
  ["01", "회원가입", "이메일 인증과 기본 정보를 등록합니다."],
  ["02", "내 매칭 카드 생성", "사진, 선호 조건, 가치관 정보를 카드에 정리합니다."],
  ["03", "매칭 Pool 등록", "완성된 카드는 추후 매칭 Pool에 등록될 수 있습니다."],
  ["04", "매주 레터 수신", "매주 목요일 오후 8시, 1명의 후보 카드를 받는 경험을 지향합니다."],
  ["05", "서로 관심 시 공개", "상호 동의 후 전체 프로필 및 연락처 공개로 확장합니다."],
];

export function ProcessSection() {
  return (
    <section className="bg-stone-950 py-16 text-white sm:py-20">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold text-teal-200">어떻게 받게 되나요?</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">내 카드에서 시작되는 매칭 레터 흐름</h2>
            <p className="mt-5 text-sm leading-6 text-stone-300">
              이번 MVP에서는 실제 매칭, 이메일 발송, 연락처 상호 공개 기능은 구현하지 않습니다. 서비스
              컨셉과 확장 가능한 구조를 먼저 준비합니다.
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
