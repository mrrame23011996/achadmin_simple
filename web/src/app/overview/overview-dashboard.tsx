"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import ReceptionDesk from "./reception";
import EscalationInbox from "./escalation-inbox";
import EmployeeManagement from "./employee-management";
import FacilityManagement from "./facility-management";
import styles from "./overview.module.css";

type Theme = "night" | "normal";
type IconName =
  | "overview"
  | "beds"
  | "opd"
  | "duties"
  | "alerts"
  | "staff"
  | "facilities";
type MainTab =
  | "overview"
  | "reception"
  | "facilities"
  | "escalations"
  | "employees";

type Metric = {
  label: string;
  category: string;
  value: string;
  detail: string;
  note: string;
  icon: IconName;
};

const metrics: Metric[] = [
  {
    label: "Available beds",
    category: "CAPACITY",
    value: "24",
    detail: "of 120 beds",
    note: "Beds ready for admission",
    icon: "beds",
  },
  {
    label: "OPD visits today",
    category: "OUTPATIENT",
    value: "86",
    detail: "visits",
    note: "Outpatient visits recorded",
    icon: "opd",
  },
  {
    label: "Overdue duties",
    category: "DUTY ROSTER",
    value: "07",
    detail: "duties",
    note: "2 need urgent follow-up",
    icon: "duties",
  },
  {
    label: "Active alerts",
    category: "ATTENTION",
    value: "03",
    detail: "alerts",
    note: "1 needs immediate review",
    icon: "alerts",
  },
  {
    label: "Open staff problems",
    category: "TEAM",
    value: "05",
    detail: "open items",
    note: "3 waiting for a response",
    icon: "staff",
  },
];

const upcomingNavigation: { icon: IconName; label: string }[] = [
  { icon: "beds", label: "Bed management" },
  { icon: "opd", label: "Outpatient visits" },
  { icon: "duties", label: "Duty roster" },
  { icon: "alerts", label: "Alerts" },
];

const minuteInMilliseconds = 60_000;

function subscribeToClock(onChange: () => void) {
  const intervalId = window.setInterval(onChange, minuteInMilliseconds);
  return () => window.clearInterval(intervalId);
}

function getCurrentMinute() {
  return Math.floor(Date.now() / minuteInMilliseconds);
}

function getServerMinute() {
  return 0;
}

export function getTimeGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {name === "overview" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </>
      )}
      {name === "beds" && (
        <>
          <path d="M3 19V6m0 9h18v4M3 11h6a3 3 0 0 1 3 3v1M12 12h5a4 4 0 0 1 4 4v3" />
          <path d="M6 9h1" />
        </>
      )}
      {name === "opd" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20h-11ZM16 5.5a3 3 0 0 1 0 5.8m1 3.2a4.5 4.5 0 0 1 3.5 4.4V20H18" />
        </>
      )}
      {name === "duties" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3.5 2" />
        </>
      )}
      {name === "alerts" && (
        <>
          <path d="m12 3.5 9 16H3l9-16Z" />
          <path d="M12 9v4.5m0 3h.01" />
        </>
      )}
      {name === "staff" && (
        <>
          <path d="M4 5.5h16v11H9l-5 3v-14Z" />
          <path d="M8 10h8m-8 3h5" />
        </>
      )}
      {name === "facilities" && (
        <>
          <path d="M4 20V5l8-3 8 3v15H4Z" />
          <path d="M9 20v-5h6v5M8 8h1m6 0h1m-8 3h1m6 0h1" />
        </>
      )}
    </svg>
  );
}

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M13.2 5.5h5.6v7.7h7.7v5.6h-7.7v7.7h-5.6v-7.7H5.5v-5.6h7.7V5.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function ThemeSwitch({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <div className={styles.themeSwitch} role="group" aria-label="Color mode">
      <button
        type="button"
        aria-label="Night mode"
        aria-pressed={theme === "night"}
        onClick={() => onChange("night")}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M16.4 12.2A6.8 6.8 0 0 1 7.8 3.6a6.8 6.8 0 1 0 8.6 8.6Z" />
        </svg>
        <span>Night</span>
      </button>
      <button
        type="button"
        aria-label="Normal mode"
        aria-pressed={theme === "normal"}
        onClick={() => onChange("normal")}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="3.2" />
          <path d="M10 2v1.5m0 13V18m8-8h-1.5m-13 0H2m13.7-5.7-1.1 1.1m-9.2 9.2-1.1 1.1m11.4 0-1.1-1.1m-9.2-9.2L4.3 4.3" />
        </svg>
        <span>Normal</span>
      </button>
    </div>
  );
}

export default function OverviewDashboard() {
  const [theme, setTheme] = useState<Theme>("night");
  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const currentMinute = useSyncExternalStore(
    subscribeToClock,
    getCurrentMinute,
    getServerMinute,
  );
  const now =
    currentMinute === 0 ? null : new Date(currentMinute * minuteInMilliseconds);
  const greeting = now ? getTimeGreeting(now.getHours()) : "Welcome back";
  const today = now
    ? new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(now)
    : "Your daily overview";

  return (
    <div className={styles.appShell} data-theme={theme}>
      <header className={styles.topBar}>
        <Link className={styles.brand} href="/" aria-label="ACH Admin owner sign-in">
          <BrandMark />
          <span>
            ach<span className={styles.brandAccent}>admin</span>
          </span>
        </Link>

        <nav className={styles.mainTabs} aria-label="Main hospital tabs">
          <button
            className={`${styles.navItem} ${activeTab === "overview" ? styles.activeNavItem : ""}`}
            type="button"
            aria-pressed={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            <Icon name="overview" />
            <span>Overview</span>
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "reception" ? styles.activeNavItem : ""}`}
            type="button"
            aria-pressed={activeTab === "reception"}
            onClick={() => setActiveTab("reception")}
          >
            <Icon name="opd" />
            <span>Reception</span>
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "escalations" ? styles.activeNavItem : ""}`}
            type="button"
            aria-pressed={activeTab === "escalations"}
            onClick={() => setActiveTab("escalations")}
          >
            <Icon name="staff" />
            <span>Escalations</span>
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "employees" ? styles.activeNavItem : ""}`}
            type="button"
            aria-pressed={activeTab === "employees"}
            onClick={() => setActiveTab("employees")}
          >
            <Icon name="staff" />
            <span>Employees</span>
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "facilities" ? styles.activeNavItem : ""}`}
            type="button"
            aria-pressed={activeTab === "facilities"}
            onClick={() => setActiveTab("facilities")}
          >
            <Icon name="facilities" />
            <span>Facilities</span>
          </button>
          {upcomingNavigation.map(({ icon, label }) => (
            <button
              key={label}
              className={styles.navItem}
              type="button"
              disabled
              title={`${label} — coming soon`}
            >
              <Icon name={icon} />
              <span>{label}</span>
              <span className={styles.comingSoon}>Soon</span>
            </button>
          ))}
        </nav>

        <div className={styles.topBarActions}>
          <ThemeSwitch theme={theme} onChange={setTheme} />
          <div className={styles.topBarDivider} />
          <div className={styles.ownerIdentity}>
            <span className={styles.ownerAvatar}>O</span>
            <span className={styles.ownerDetails}>
              <strong>Hospital owner</strong>
              <small>Owner account</small>
            </span>
          </div>
        </div>
      </header>

      <main className={styles.dashboardContent} aria-label={activeTab}>
        <div hidden={activeTab !== "overview"}>
          <section className={styles.welcomePanel} aria-labelledby="welcome-title">
            <div className={styles.welcomeCopy}>
              <span className={styles.welcomeEyebrow}>
                <span className={styles.welcomePulse} />
                YOUR HOSPITAL AT A GLANCE
              </span>
              <h1 id="welcome-title">{greeting}, owner.</h1>
              <p>
                Welcome back. Here&apos;s a clear view of what&apos;s happening
                across your hospital today.
              </p>
              <div className={styles.welcomeMeta}>
                <span className={styles.dateLabel}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <rect x="2.5" y="4" width="15" height="13" rx="2" />
                    <path d="M6.5 2.5v3m7-3v3M2.5 8h15" />
                  </svg>
                  {today}
                </span>
                <span className={styles.previewBadge}>SAMPLE DATA</span>
              </div>
            </div>
            <div className={styles.welcomeArt} aria-hidden="true">
              <div className={styles.artHalo} />
              <div className={styles.artCard}>
                <span className={styles.artCross}>+</span>
                <span className={styles.artLine} />
                <span className={styles.artLine} />
                <span className={styles.artLineShort} />
                <span className={styles.artPulse}>
                  <span />
                  Care in sync
                </span>
              </div>
              <span className={styles.artSparkle}>✦</span>
            </div>
          </section>

          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>THE DAILY PICTURE</span>
              <h2>Today at a glance</h2>
              <p>Five key areas to help you stay one step ahead.</p>
            </div>
            <span className={styles.sampleLabel}>
              <span />
              DEMO PREVIEW
            </span>
          </div>

          <section className={styles.metricsGrid} aria-label="Hospital overview metrics">
            {metrics.map((metric, index) => (
              <article
                className={`${styles.metricCard} ${
                  index >= 3 ? styles.wideMetricCard : ""
                }`}
                key={metric.label}
              >
                <div className={styles.metricTop}>
                  <span className={styles.metricIcon}>
                    <Icon name={metric.icon} />
                  </span>
                  <span className={styles.metricCategory}>{metric.category}</span>
                  <span className={styles.metricSpark} aria-hidden="true">
                    <svg viewBox="0 0 56 24" fill="none">
                      <path d="M1 18.5 10 14l8 3 9-9 9 5 8-8 11 2" />
                    </svg>
                  </span>
                </div>
                <h3>{metric.label}</h3>
                <div className={styles.metricValue}>
                  <strong>{metric.value}</strong>
                  <span>{metric.detail}</span>
                </div>
                {metric.label === "Available beds" ? (
                  <div
                    className={styles.capacityTrack}
                    role="img"
                    aria-label="Sample bed availability: 24 of 120 beds available"
                  >
                    <span />
                  </div>
                ) : (
                  <span className={styles.metricRule} />
                )}
                <p className={styles.metricNote}>{metric.note}</p>
              </article>
            ))}
          </section>

          <div className={styles.previewNotice} role="note">
            <span className={styles.noticeIcon} aria-hidden="true">i</span>
            <p>
              <strong>Preview only</strong>
              These numbers are sample data for the overview design. They are
              not live hospital records.
            </p>
          </div>
        </div>
        <div hidden={activeTab !== "reception"}>
          <ReceptionDesk />
        </div>
        <div hidden={activeTab !== "facilities"}>
          <FacilityManagement />
        </div>
        <div hidden={activeTab !== "escalations"}>
          <EscalationInbox />
        </div>
        <div hidden={activeTab !== "employees"}>
          <EmployeeManagement />
        </div>
      </main>
    </div>
  );
}
