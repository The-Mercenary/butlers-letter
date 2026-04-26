import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-stone-950/45" />
      <div className="container-page relative flex min-h-[calc(100vh-4rem)] items-center pb-20 pt-12">
        <div className="max-w-3xl text-white">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-teal-100">Private matching letter</p>
          <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            필요한 인연을, 조용하고 신중하게 받아보세요.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-100 sm:text-lg">
            버틀러스레터는 데이트 상대, 취미 인맥, 동네 친구, 동종 업계 멘토처럼 내가 원하는 목적에 맞는 사람을 추천받을 수 있는 프라이빗 인맥 추천 서비스입니다.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              시작하기
              <ArrowRight size={18} />
            </Link>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-stone-200">
            연락처는 양쪽이 모두 동의한 경우에만 공개됩니다.
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[color:var(--background)] to-transparent" />
    </section>
  );
}
