import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const { replace, refresh, signInWithPassword, resetPasswordForEmail } =
  vi.hoisted(() => ({
    replace: vi.fn(),
    refresh: vi.fn(),
    signInWithPassword: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({
    auth: { signInWithPassword, resetPasswordForEmail },
  }),
}));

afterEach(() => {
  cleanup();
  replace.mockReset();
  refresh.mockReset();
  signInWithPassword.mockReset();
  resetPasswordForEmail.mockReset();
});

describe("owner access page", () => {
  it("switches between night and normal color modes", () => {
    render(<Home />);

    const app = screen.getByRole("main");
    expect(app.getAttribute("data-theme")).toBe("night");

    fireEvent.click(screen.getByRole("button", { name: "Normal mode" }));
    expect(app.getAttribute("data-theme")).toBe("normal");

    fireEvent.click(screen.getByRole("button", { name: "Night mode" }));
    expect(app.getAttribute("data-theme")).toBe("night");
  });

  it("shows owner sign-in and explains invite-only account setup", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Welcome back." }),
    ).toBeDefined();
    expect(screen.getByLabelText("Email address")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Account invite" }));

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Account access is by invitation.",
      }),
    ).toBeDefined();
    expect(screen.getByText("Invite-only accounts")).toBeDefined();
    expect(screen.queryByLabelText("Hospital name")).toBeNull();
  });

  it("lets owners reveal and hide their password", () => {
    render(<Home />);

    const password = screen.getByLabelText("Password") as HTMLInputElement;
    expect(password.type).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password.type).toBe("text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password.type).toBe("password");
  });

  it("keeps public registration disabled for owner accounts", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Account invite" }));

    expect(screen.getByText("Invite-only accounts")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Create owner account" })).toBeNull();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("surfaces authentication errors from Supabase", async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    render(<Home />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "owner@hospital.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "example-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in to your workspace" }).closest("form")!,
    );

    expect((await screen.findByRole("status")).textContent).toContain(
      "Invalid login credentials",
    );
  });

  it("signs in through Supabase and opens the overview", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    render(<Home />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "owner@hospital.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in to your workspace" }).closest("form")!,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/overview"));
    expect(refresh).toHaveBeenCalled();
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "owner@hospital.test",
      password: "correct-password",
    });
  });

  it("sends a password-reset email with the secure callback URL", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "owner@hospital.test" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));

    expect((await screen.findByRole("status")).textContent).toContain(
      "password reset instructions have been sent",
    );
    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      "owner@hospital.test",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/auth/callback?type=recovery"),
      }),
    );
  });
});
