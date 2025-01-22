import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { auth } from "@/lib/auth";

export default async function Page({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 flex h-16 items-center gap-2 border-b bg-background px-4 sm:justify-start">
          {/* Sidebar trigger (always visible on the left) */}
          <SidebarTrigger className="-ml-1 mr-3" />

          {/* Center logo on mobile and align logo with text on larger screens */}
          <div className="flex flex-1 items-center justify-center sm:justify-start">
            <Image
              src="/images/logo-dark-nobg.png"
              alt="logo"
              height="48"
              width="48"
              className="shrink-0"
              style={{
                filter: "drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.75))",
              }}
            />
            <p className="hidden text-2xl font-extrabold sm:ml-2 sm:block">
              THE MEMORY BOX
            </p>
          </div>
        </header>

        {/* Page content */}
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
