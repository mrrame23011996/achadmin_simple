import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UpdatePasswordPage from "./page";

const { replace, refresh, updateUser } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({ auth: { updateUser } }),
}));

afterEach(() => {
  cleanup();
  replace.mockReset();
  refresh.mockReset();
  updateUser.mockReset();
});

describe("invited account password setup", () => {
  it("rejects mismatched passwords before updating Supabase", () => {
    render(<UpdatePasswordPage />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "secure-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Save password" }).closest("form")!,
    );

    expect(screen.getByRole("status").textContent).toContain(
      "Your passwords do not match",
    );
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("saves the new password and opens the overview", async () => {
    updateUser.mockResolvedValue({ error: null });
    render(<UpdatePasswordPage />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "secure-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "secure-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Save password" }).closest("form")!,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/overview"));
    expect(updateUser).toHaveBeenCalledWith({ password: "secure-password" });
    expect(refresh).toHaveBeenCalled();
  });
});
