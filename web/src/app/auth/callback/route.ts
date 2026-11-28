import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedDestinations = new Set([
  "/overview",
  "/auth/update-password",
]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const requestedDestination = requestUrl.searchParams.get("next");
  const defaultDestination =
    type === "invite" || type === "recovery"
      ? "/auth/update-password"
      : "/overview";
  const destination =
    requestedDestination && allowedDestinations.has(requestedDestination)
      ? requestedDestination
      : defaultDestination;
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirectToError(requestUrl.origin);
  } else if (tokenHash && (type === "invite" || type === "recovery")) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) return redirectToError(requestUrl.origin);
  } else {
    return redirectToError(requestUrl.origin);
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}

function redirectToError(origin: string) {
  return NextResponse.redirect(new URL("/?authError=callback", origin));
}
