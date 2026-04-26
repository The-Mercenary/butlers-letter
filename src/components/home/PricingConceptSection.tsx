import { LETTER_PRICE_KRW } from "@/lib/constants/cardOptions";

const flow = ["회원가입", "내 카드 생성", "정보 입력", "레터 수신", "관심 표현", "상호 동의 시 연락처 공개"];

export function PricingConceptSection() {
  return (
    <section className="bg-[color:var(--background)] py-16 sm:py-20">
      <div className="container-page">
        <div className="surface rounded-lg p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-teal-800">가입하면 무엇이 기다리나요?</p>
              <h2 className="mt-3 text-3xl font-black text-stone-950 sm:text-4xl">카드를 만들고, 레터를 기다리는 구조</h2>
              <p className="mt-5 text-sm leading-6 text-stone-600">
                파트너 카드 1명을 받아보는 기준 가격은 {LETTER_PRICE_KRW.toLocaleString("ko-KR")}원을 지향합니다.
                이번 MVP에서는 결제 기능을 구현하지 않습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {flow.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800">
                    {item}
                  </span>
                  {index < flow.length - 1 ? <span className="text-stone-400">→</span> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
