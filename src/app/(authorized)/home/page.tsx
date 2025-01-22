import { SignOut } from "@/components/auth/signout-button";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[#111111] text-[#b4b4b4]">
      <nav className="fixed top-0 w-full bg-[#111111]/80 backdrop-blur-sm border-b border-[#3A3A3A] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#eeeeee]">TheMemoryBox</h1>
          <div className="flex items-center gap-4">
            <span className="text-[#eeeeee]">{session?.user?.name}</span>
            <SignOut />
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-[#eeeeee] mb-6">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-xl mb-8">
            You are now signed in to your account.
          </p>
          {/* Add your authenticated user content here */}
        </div>
      </div>
    </main>
  );
}