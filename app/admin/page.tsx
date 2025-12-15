import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminPanel } from "@/components/AdminPanel";
import { PasswordPrompt } from "@/components/PasswordPrompt";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <PasswordPrompt />;
  }

  return <AdminPanel />;
}
