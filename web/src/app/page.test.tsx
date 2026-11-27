import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

afterEach(() => {
  cleanup();
  push.mockReset();
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

  it("shows owner sign-in and switches to one-time setup", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Welcome back." }),
    ).toBeDefined();
    expect(screen.getByLabelText("Email address")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "First-time setup" }));

    expect(
      screen.getByRole("heading", { level: 2, name: "Let’s get you set up." }),
    ).toBeDefined();
    expect(screen.getByLabelText("Hospital name")).toBeDefined();
    expect(screen.getByLabelText("Your full name")).toBeDefined();
    expect(screen.getByLabelText("Confirm password")).toBeDefined();
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

  it("rejects a mismatched setup password without saving account details", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "First-time setup" }));

    fireEvent.change(screen.getByLabelText("Hospital name"), {
      target: { value: "Northstar Medical Center" },
    });
    fireEvent.change(screen.getByLabelText("Your full name"), {
      target: { value: "Alex Morgan" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "alex@northstar.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secure-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Create owner account" }).closest("form")!,
    );

    expect(screen.getByRole("status").textContent).toContain(
      "Your passwords do not match",
    );
  });

  it("shows the temporary demo credentials and rejects incorrect details", () => {
    render(<Home />);
    expect(screen.getByText("owner@achadmin.local")).toBeDefined();
    expect(screen.getByText("DemoOwner123!")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "owner@hospital.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "example-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in to your workspace" }).closest("form")!,
    );

    expect(screen.getByRole("status").textContent).toContain(
      "Those demo credentials don’t match",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("opens the overview with valid demo credentials", () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "OWNER@ACHADMIN.LOCAL " },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "DemoOwner123!" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in to your workspace" }).closest("form")!,
    );

    expect(push).toHaveBeenCalledWith("/overview");
  });
});
