import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

export default async function RootPage() {
  const session = await verifySession();
  redirect(session ? "/tr/dashboard" : "/tr/login");
}
