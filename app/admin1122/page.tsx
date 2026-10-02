import AdminBuilderDashboard from "@/components/admin-builder-dashboard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin | Usman Iqbal",
  robots: { index: false, follow: false, noarchive: true }
};

export default function AdminPage() {
  return <AdminBuilderDashboard />;
}
