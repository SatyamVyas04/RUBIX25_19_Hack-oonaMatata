import { SignOut } from "@/components/auth/signout-button";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const runtime = "edge";

// Custom CSS for glow effects
const glowStyles = {
  primary: "bg-gradient-to-r from-blue-500 to-purple-600",
  glow: "animate-glow",
};

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[#0A0A15] text-[#b4b4b4]">
      {/* Navbar with glass effect */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0A0A15]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Image
            src="/images/logo-dark-nobg.png"
            alt={"logo"}
            height="64"
            width="64"
          />
          {!session?.user && (
            <div className="flex items-center gap-4">
              <Link href="/signin">
                <Button
                  variant="ghost"
                  className="text-[#b4b4b4] transition-all duration-300 hover:bg-white/10 hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="relative inline-flex items-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]">
                  <span className="relative">Get Started</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative">
        {session?.user ? (
          // Authenticated user view
          <div className="flex min-h-screen items-center justify-center">
            <div className="space-y-3 text-center">
              <p className="text-2xl font-medium text-white">
                Welcome back, {session.user.name}!
              </p>
              <SignOut />
            </div>
          </div>
        ) : (
          // Landing page content
          <>
            {/* Hero Section with animated gradient */}
            <div className="relative pt-16">
              <div className="absolute inset-0 mt-2 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
              <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8 lg:pt-32">
                <h1 className="font-display mx-auto max-w-4xl text-5xl font-medium tracking-tight text-white sm:text-7xl">
                  Preserve Your Memories{" "}
                  <span className="relative whitespace-nowrap">
                    <span className="animate-text-shimmer relative z-10 inline-block bg-[linear-gradient(45deg,theme(colors.blue.400),theme(colors.purple.500),theme(colors.blue.400))] bg-[length:200%_100%] bg-clip-text text-transparent">
                      Digitally
                    </span>
                  </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-white/70">
                  Create, store, and share your precious memories in a beautiful
                  digital box. Safe, secure, and always accessible.
                </p>
                <div className="mt-10 flex justify-center gap-x-6">
                  <Link href="/signup">
                    <Button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-lg text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-[0_0_35px_rgba(79,70,229,0.5)]">
                      <span className="relative">Start Your Memory Box</span>
                      <span className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[rgba(255,255,255,0.2)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Section with glowing cards */}
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
              <h2 className="mx-auto mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-center text-3xl font-bold text-transparent text-white">
                Why{" "}
                <Image
                  src="/images/logo-dark-nobg.png"
                  alt={"logo"}
                  height="128"
                  width="128"
                  className="mx-auto"
                />
                ?
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    title: "Secure Storage",
                    description:
                      "Your memories are encrypted and safely stored in the cloud",
                    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                  },
                  {
                    title: "Easy Sharing",
                    description:
                      "Share memories with family and friends with just a click",
                    icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
                  },
                  {
                    title: "Smart Organization",
                    description:
                      "Automatically organize your memories by date, location, and more",
                    icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                  },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className="group relative overflow-hidden border-white/10 bg-[#12121F] transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <CardContent className="relative pt-6">
                      <div className="flex flex-col items-center text-center">
                        <svg
                          className="mb-4 h-12 w-12 text-blue-400 transition-colors duration-300 group-hover:text-blue-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={feature.icon}
                          />
                        </svg>
                        <h3 className="mb-2 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-blue-300">
                          {feature.title}
                        </h3>
                        <p className="text-white/70 transition-colors duration-300 group-hover:text-white/90">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Technologies Section with glassmorphism */}
            <div className="border-t border-white/10 bg-[#0C0C1D]">
              <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-center text-lg font-semibold text-transparent text-white/90">
                  Built with modern technologies
                </h2>
                <div className="mt-8 flex justify-center gap-8">
                  <div className="flex items-center space-x-8 rounded-2xl bg-white/5 px-8 py-4 backdrop-blur-sm">
                    {[
                      {
                        src: "/neon.png",
                        alt: "Neon",
                        className: "h-32",
                      },
                      {
                        src: "/next.svg",
                        alt: "Next.js",
                        className: "invert h-16",
                      },
                      {
                        src: "/drizzle.svg",
                        alt: "Drizzle",
                        className: "invert h-32",
                      },
                    ].map((tech, index) => (
                      <Image
                        key={index}
                        className={`h-8 w-auto shrink-0 transition-transform duration-300 hover:scale-110 ${tech.className}`}
                        src={tech.src}
                        width="36"
                        height="36"
                        alt={tech.alt}
                        loading="eager"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
