export function Footer() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-white">
      <div className="container-page flex flex-col gap-3 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Butler&apos;s Letter. All rights reserved.</p>
        <p>프라이빗 매칭 레터 MVP</p>
      </div>
    </footer>
  );
}
