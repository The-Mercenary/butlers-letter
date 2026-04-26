export function IntroSection() {
  return (
    <section className="bg-[color:var(--background)] py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-bold text-teal-800">버틀러스레터란 무엇인가요?</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
            원하는 목적에 맞는 사람을 신중하게 발견하는 방식
          </h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-stone-700">
          <p>
            버틀러스레터는 단순히 많은 사람을 보여주는 서비스가 아닙니다. 사용자가 원하는 만남의 목적과
            기본 프로필, 관심사, 지역, 직종 정보를 바탕으로 나에게 맞을 가능성이 높은 사람을 신중하게
            추천하는 프라이빗 인맥 추천 서비스입니다.
          </p>
          <p>
            데이트 상대를 찾고 싶을 때, 취미를 함께할 사람을 찾고 싶을 때, 같은 동네에서 편하게 만날
            친구가 필요할 때, 또는 동종 업계의 멘토와 연결되고 싶을 때 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
