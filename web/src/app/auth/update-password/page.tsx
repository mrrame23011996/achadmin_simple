"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import styles from "./update-password.module.css";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setNotice("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setNotice("Your passwords do not match. Please check and try again.");
      return;
    }

    setNotice("");
    setIsSubmitting(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        setNotice(error.message);
        return;
      }

      router.replace("/overview");
      router.refresh();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to update your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="password-title">
        <span className={styles.eyebrow}>ACH ADMIN · SECURE ACCOUNT</span>
        <h1 id="password-title">Choose a password</h1>
        <p>Set a new password to finish setting up or recovering your account.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            New password
            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          <label>
            Confirm password
            <input
              autoComplete="new-password"
              minLength={8}
              name="confirmPassword"
              required
              type="password"
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save password"}
          </button>
          {notice && <p className={styles.notice} role="status">{notice}</p>}
        </form>
      </section>
    </main>
  );
}
