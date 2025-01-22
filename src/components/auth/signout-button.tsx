import { signOut } from "@/lib/auth";

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg border border-[#3A3A3A] bg-[#111111] px-4 py-2 text-sm font-medium text-[#B4B4B4] ring-offset-[#111111] transition-colors hover:border-[#484848] hover:bg-[#2A2A2A] hover:text-[#EEEEEE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e599] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
