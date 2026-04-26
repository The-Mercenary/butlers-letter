export function IntroSection() {
  return (
    <section className="bg-[color:var(--background)] py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-bold text-teal-800">버틀러스레터란 무엇인가?</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
            조건표보다 더 천천히, 사람을 읽는 방식
          </h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-stone-700">
          <p>
            버틀러스레터는 단순히 조건만 맞는 사람을 소개하는 서비스가 아닙니다. 사용자가 등록한 기본
            정보, 선호 조건, 가치관, 자기소개를 바탕으로 더 신중하고 정성스러운 만남을 돕는 프라이빗
            매칭 서비스입니다.
          </p>
          <p>
            큰 비용을 먼저 지불하고 무작정 사람을 만나는 방식이 아니라, 나에게 어울릴 가능성이 높은
            사람을 선별해 레터 형태로 받아보는 경험을 지향합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
