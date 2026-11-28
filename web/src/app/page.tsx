"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import styles from "./page.module.css";

type AccessMode = "sign-in" | "setup";
type ColorMode = "night" | "normal";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getCallbackErrorSnapshot() {
  return new URLSearchParams(window.location.search).get("authError") === "callback";
}

function getServerCallbackErrorSnapshot() {
  return false;
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

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="8.5" width="12" height="9" rx="2" />
      <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5M10 12v2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4" width="15" height="12" rx="2" />
      <path d="m3.5 5.5 6.5 5 6.5-5" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<AccessMode>("sign-in");
  const [colorMode, setColorMode] = useState<ColorMode>("night");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const hasCallbackError = useSyncExternalStore(
    subscribeToLocation,
    getCallbackErrorSnapshot,
    getServerCallbackErrorSnapshot,
  );
  const isSetup = mode === "setup";
  const callbackErrorNotice = hasCallbackError
    ? "That invitation or recovery link is invalid or expired. Ask your administrator for a new invite or request another reset email."
    : "";

  function changeMode(nextMode: AccessMode) {
    setMode(nextMode);
    setNotice("");
    setShowPassword(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setNotice("");
    setIsSubmitting(true);
    try {
      const { error } = await createClient().auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setNotice(error.message);
        return;
      }

      router.replace("/overview");
      router.refresh();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset(form: HTMLFormElement | null) {
    if (!form) {
      setNotice("Enter your email address first, then request a reset link.");
      return;
    }
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) {
      setNotice("Enter your email address first, then request a reset link.");
      return;
    }

    setNotice("");
    setIsResetting(true);
    try {
      const redirectTo = new URL(
        "/auth/callback?type=recovery&next=%2Fauth%2Fupdate-password",
        window.location.origin,
      ).toString();
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {
        setNotice(error.message);
        return;
      }
      setNotice(
        "If that email has an account, password reset instructions have been sent.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to request a password reset right now.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className={styles.page} data-theme={colorMode}>
      <section className={styles.storyPanel} aria-label="ACH Admin">
        <div className={styles.storyTop}>
          <div className={styles.brand}>
            <BrandMark />
            <span>ach<span className={styles.brandAccent}>admin</span></span>
          </div>
          <span className={styles.portalTag}>OWNER PORTAL</span>
        </div>

        <div className={styles.storyContent}>
          <div className={styles.storyCopy}>
            <span className={styles.overline}>
              <span className={styles.statusDot} />
              A clearer view of care
            </span>
            <h1>
              More focus
              <br />
              on what <em>matters.</em>
            </h1>
            <p>
              Bring your hospital&apos;s day-to-day together in one thoughtful
              workspace, made for the people behind better care.
            </p>
          </div>

          <div className={styles.preview} aria-label="Product preview">
            <div className={styles.previewHeader}>
              <div>
                <span className={styles.previewEyebrow}>YOUR HOSPITAL</span>
                <p>Good morning</p>
              </div>
              <span className={styles.previewAvatar}>A</span>
            </div>
            <div className={styles.previewDivider} />
            <div className={styles.previewMetrics}>
              <div className={styles.previewMetric}>
                <span className={styles.metricIcon}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M3 16V9l7-5 7 5v7h-5v-5H8v5H3Z" />
                  </svg>
                </span>
                <span>
                  <small>Departments</small>
                  <strong>All in one place</strong>
                </span>
                <span className={styles.metricArrow} aria-hidden="true">↗</span>
              </div>
              <div className={styles.previewMetric}>
                <span className={`${styles.metricIcon} ${styles.peopleIcon}`}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="3" />
                    <path d="M2.5 16v-1a4.5 4.5 0 0 1 9 0v1h-9ZM13 4.5a2.5 2.5 0 0 1 0 5m1 2a3.5 3.5 0 0 1 3.5 3.5v1H15" />
                  </svg>
                </span>
                <span>
                  <small>Your team</small>
                  <strong>Connected &amp; ready</strong>
                </span>
                <span className={styles.metricArrow} aria-hidden="true">↗</span>
              </div>
            </div>
            <div className={styles.previewFooter}>
              <span className={styles.pulseMark} />
              Thoughtfully designed for better care
            </div>
          </div>
        </div>

        <div className={styles.storyFooter}>
          <span>Care starts with a little more clarity.</span>
          <div className={styles.footerStrokes} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className={`${styles.orbit} ${styles.orbitOne}`} aria-hidden="true" />
        <div className={`${styles.orbit} ${styles.orbitTwo}`} aria-hidden="true" />
      </section>

      <section className={styles.formPanel} aria-label="Owner account access">
        <div className={styles.formTopBar}>
          <div className={styles.mobileBrand}>
            <BrandMark />
            <span>ach<span className={styles.mobileBrandAccent}>admin</span></span>
          </div>
          <div className={styles.themeSwitch} role="group" aria-label="Color mode">
            <button
              type="button"
              aria-label="Night mode"
              aria-pressed={colorMode === "night"}
              onClick={() => setColorMode("night")}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M16.4 12.2A6.8 6.8 0 0 1 7.8 3.6a6.8 6.8 0 1 0 8.6 8.6Z" />
              </svg>
              <span>Night</span>
            </button>
            <button
              type="button"
              aria-label="Normal mode"
              aria-pressed={colorMode === "normal"}
              onClick={() => setColorMode("normal")}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="3.2" />
                <path d="M10 2v1.5m0 13V18m8-8h-1.5m-13 0H2m13.7-5.7-1.1 1.1m-9.2 9.2-1.1 1.1m11.4 0-1.1-1.1m-9.2-9.2L4.3 4.3" />
              </svg>
              <span>Normal</span>
            </button>
          </div>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formHeading}>
            <span className={styles.formKicker}>
              <LockIcon />
              OWNER ACCESS
            </span>
            <h2>{isSetup ? "Account access is by invitation." : "Welcome back."}</h2>
            <p>
              {isSetup
                ? "Ask your hospital administrator to invite your email address. Use the secure link in their email to finish setting up your password."
                : "Sign in to your hospital’s owner workspace."}
            </p>
          </div>

          <div className={styles.modeSwitch} role="group" aria-label="Account access">
            <button
              className={!isSetup ? styles.activeTab : ""}
              type="button"
              aria-pressed={!isSetup}
              onClick={() => changeMode("sign-in")}
            >
              Sign in
            </button>
            <button
              className={isSetup ? styles.activeTab : ""}
              type="button"
              aria-pressed={isSetup}
              onClick={() => changeMode("setup")}
            >
              Account invite
            </button>
          </div>

          {isSetup && (
            <div className={styles.setupNote}>
              <span className={styles.noteIcon} aria-hidden="true">✦</span>
              <p>
                <strong>Invite-only accounts</strong>
                <span>
                  No public registration is available. If you haven&apos;t
                  received an invitation, contact your hospital administrator.
                </span>
              </p>
            </div>
          )}

          {!isSetup && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Email address</span>
                <span className={styles.inputWrap}>
                  <MailIcon />
                  <input
                    autoComplete="email"
                    name="email"
                    placeholder="you@hospital.com"
                    required
                    type="email"
                    onChange={() => setNotice("")}
                  />
                </span>
              </label>

              <label className={styles.field}>
                <span>Password</span>
                <span className={styles.inputWrap}>
                  <LockIcon />
                  <input
                    autoComplete="current-password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                    onChange={() => setNotice("")}
                  />
                  <button
                    className={styles.passwordToggle}
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M2 2 18 18M8.6 8.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M7.1 4.3A8.6 8.6 0 0 1 10 3.8c4.5 0 7.5 4.7 7.5 4.7a9.9 9.9 0 0 1-2.2 2.5M5.2 5.2C3.5 6.2 2.5 8.5 2.5 8.5s3 4.7 7.5 4.7a8.6 8.6 0 0 0 2.1-.3" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M2.5 10s3-5 7.5-5 7.5 5 7.5 5-3 5-7.5 5-7.5-5-7.5-5Z" />
                        <circle cx="10" cy="10" r="2" />
                      </svg>
                    )}
                  </button>
                </span>
              </label>

              <button
                className={styles.forgotButton}
                type="button"
                disabled={isResetting}
                onClick={(event) => void handlePasswordReset(event.currentTarget.form)}
              >
                {isResetting ? "Sending reset link…" : "Forgot password?"}
              </button>

              <button
                className={styles.submitButton}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign in to your workspace"}
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12m-5-5 5 5-5 5" />
                </svg>
              </button>
              {(notice || callbackErrorNotice) && (
                <p className={styles.formNotice} role="status">
                  {notice || callbackErrorNotice}
                </p>
              )}
            </form>
          )}

          <div className={styles.formSecurity}>
            <span className={styles.securityIcon}><LockIcon /></span>
            <span>Account access is securely managed by your hospital.</span>
          </div>
        </div>

        <footer className={styles.formFooter}>
          <span>© ACH Admin</span>
          <span className={styles.footerSeparator} />
          <span>Made for better care</span>
        </footer>
      </section>
    </main>
  );
}
