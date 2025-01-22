import { auth } from "@/lib/auth";

export const config = {
  matcher: ["/((?!signin|signup).*)"],
};

export default auth((req) => {
  const publicPaths = ["/", "/signin", "/signup"];
  if (!req.auth && !publicPaths.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});
