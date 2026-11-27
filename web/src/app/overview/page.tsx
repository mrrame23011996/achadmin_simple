import type { Metadata } from "next";
import OverviewDashboard from "./overview-dashboard";

export const metadata: Metadata = {
  title: "Hospital overview | ACH Admin",
  description: "An at-a-glance view of hospital operations.",
};

export default function OverviewPage() {
  return <OverviewDashboard />;
}
