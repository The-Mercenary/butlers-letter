import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <div className="rounded-lg bg-teal-800 px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-black sm:text-4xl">이제, 나에게 맞는 인연을 기다려보세요.</h2>
          <Link
            href="/signup"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-teal-900 transition hover:bg-stone-100"
          >
            회원가입하고 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}
