import { auth } from "@/lib/auth";

export const runtime = "edge";

export default async function HomePage() {
  const session = await auth();

  return (
    <main>
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-bold text-[#eeeeee]">
          Welcome back, {session?.user?.name}!
        </h1>
      </div>
    </main>
  );
}
