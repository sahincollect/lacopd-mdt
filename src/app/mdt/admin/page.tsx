import { redirect } from "next/navigation";

export default function TrapMdtAdminRedirect() {
  redirect("/admin?from=/mdt/admin");
}
