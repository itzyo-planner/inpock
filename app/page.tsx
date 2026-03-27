const links = [
  {
    id: 1,
    title: "쿠팡파트너스",
    description: "추천 상품 모음",
    url: "https://link.coupang.com/YOUR_LINK_HERE",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
    hoverBg: "hover:bg-red-100",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center px-4 py-12">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-white text-3xl font-bold">잇</span>
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">잇지요</h1>
        <p className="text-gray-500 text-sm font-medium tracking-widest">@itzyo</p>

        {/* Bio */}
        <p className="text-gray-600 text-sm mt-3 text-center max-w-xs leading-relaxed">
          좋은 상품을 함께 나눠요 ✨
        </p>

        {/* Social Icons */}
        <div className="flex gap-3 mt-4">
          <a
            href="https://www.instagram.com/ziziingod"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-pink-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Links Section */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${link.bgColor} ${link.borderColor} ${link.hoverBg} transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group`}
          >
            <div className={`flex-shrink-0 ${link.iconColor}`}>{link.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{link.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{link.description}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-gray-400 text-xs">
        © 2026 itzyo · 잇지요
      </p>
    </main>
  );
}
