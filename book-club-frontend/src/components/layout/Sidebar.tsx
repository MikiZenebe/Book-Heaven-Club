import { useEffect } from "react";
import { Compass, Library, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useShelfStore } from "@/stores/shelfStore";

export default function Sidebar() {
  const location = useLocation();

  // Authentication state
  const user = useAuthStore((state) => state.user);

  const loadBookshelf = useShelfStore((state) => state.loadBookshelf);
  const clearShelf = useShelfStore((state) => state.clearShelf);

  // Load the current user's shelf when signed in.
  useEffect(() => {
    if (user) {
      void loadBookshelf();
    } else {
      clearShelf();
    }
  }, [user, loadBookshelf, clearShelf]);

  const navigation = [
    {
      label: "Discover",
      href: "/",
      icon: Compass,
    },
    {
      label: "My shelf",
      href: "/my-shelf",
      icon: Library,
    },
    {
      label: "Book clubs",
      href: "/book-clubs",
      icon: Users,
    },
  ];

  return (
    <aside className="z-20 flex flex-col border-b border-[#2b2420]/15 bg-[#ebe3d5] px-5 py-5 md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-r md:border-b-0 md:px-7 md:py-9 xl:w-65">
      {/* Logo */}
      <Link to="/" className="group flex w-fit items-end gap-2">
        <span className="font-serif text-3xl leading-none tracking-tight text-[#2b2420]">
          book<em className="text-[#8b4513]">heaven</em>
        </span>
        <span className="mb-1 h-2 w-2 rounded-full bg-[#8b4513]" />
      </Link>

      <p className="mt-2 text-[10px] italic text-[#6b5d52]">
        a quiet reading room
      </p>

      {/* Navigation */}
      <p className="mb-5 mt-12 text-[10px] font-medium tracking-[3px] text-[#6b5d52]">
        BROWSE
      </p>

      <nav
        aria-label="Main navigation"
        className="flex gap-2 overflow-x-auto md:grid md:gap-1"
      >
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = href.startsWith("/") && location.pathname === href;

          return (
            <Link
              key={label}
              to={href}
              aria-current={active ? "page" : undefined}
              className={`group flex shrink-0 items-center justify-between gap-3 border-l-2 py-2.5 pl-3 pr-2 text-sm transition-all ${
                active
                  ? "border-[#8b4513] bg-[#f5f0e8] text-[#2b2420]"
                  : "border-transparent text-[#6b5d52] hover:border-[#d4a574] hover:text-[#2b2420]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Quote card */}
      <div className="mt-auto hidden md:block">
        <div className="relative border-t border-dashed border-[#2b2420]/20 pt-6">
          <p className="font-serif text-base leading-snug italic text-[#2b2420]">
            "I have always imagined that paradise will be a kind of library."
          </p>
          <p className="mt-3 text-[10px] tracking-[2px] text-[#8b4513]">
            — J.L. BORGES
          </p>
        </div>
      </div>
    </aside>
  );
}
