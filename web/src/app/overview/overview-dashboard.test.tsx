import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import OverviewDashboard, { getTimeGreeting } from "./overview-dashboard";

afterEach(cleanup);

function fillPatientForm(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Patient name" }), {
    target: { value: name },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Age" }), {
    target: { value: "35" },
  });
  fireEvent.change(screen.getByRole("combobox", { name: "Gender" }), {
    target: { value: "Female" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Address" }), {
    target: { value: "35 Sample Road" },
  });
}

describe("hospital overview", () => {
  it("chooses a greeting based on the hour of day", () => {
    expect(getTimeGreeting(9)).toBe("Good morning");
    expect(getTimeGreeting(14)).toBe("Good afternoon");
    expect(getTimeGreeting(19)).toBe("Good evening");
  });

  it("shows all five requested sample metrics", () => {
    render(<OverviewDashboard />);

    expect(screen.getByRole("heading", { name: "Available beds" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "OPD visits today" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Overdue duties" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Active alerts" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Open staff problems" })).toBeDefined();
    expect(screen.getByText(/These numbers are sample data/)).toBeDefined();
  });

  it("supports night and normal color modes", () => {
    render(<OverviewDashboard />);

    const app = screen.getByRole("main");
    expect(app.parentElement?.getAttribute("data-theme")).toBe("night");

    fireEvent.click(screen.getByRole("button", { name: "Normal mode" }));
    expect(app.parentElement?.getAttribute("data-theme")).toBe("normal");
  });

  it("shows the main tabs horizontally and opens reception", () => {
    render(<OverviewDashboard />);

    const navigation = screen.getByRole("navigation", {
      name: "Main hospital tabs",
    });
    expect(within(navigation).getByRole("button", { name: "Overview" })).toBeDefined();
    fireEvent.click(within(navigation).getByRole("button", { name: "Reception" }));

    expect(
      screen.getByRole("heading", { name: "Patient reception" }),
    ).toBeDefined();
    expect(
      screen.getByText(/Preview data only\. Changes reset/),
    ).toBeDefined();
  });

  it("registers an OPD patient, admits them, then moves them to discharge history", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));

    fillPatientForm("Demo New Patient");
    fireEvent.click(screen.getByRole("button", { name: "Register OPD patient" }));

    expect(screen.getByText("Demo New Patient")).toBeDefined();
    expect(screen.getByText("OPD-1044 · 35 · Female")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: "Admit to IPD" })[0]);

    const currentAdmissions = screen.getByRole("region", {
      name: "Current admissions",
    });
    expect(within(currentAdmissions).getByText(/IPD-2036/)).toBeDefined();

    fireEvent.click(within(currentAdmissions).getAllByRole("button", { name: "Discharge" })[0]);
    expect(
      within(currentAdmissions).queryByText(/IPD-2036/),
    ).toBeNull();
    expect(
      within(
        screen.getByRole("region", { name: "Discharge history" }),
      ).getByText("IPD-2036 · OPD"),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));
    expect(
      within(
        screen.getByRole("region", { name: "Discharge history" }),
      ).getByText("IPD-2036 · OPD"),
    ).toBeDefined();
  });

  it("allows direct IPD registration only through the emergency toggle", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));

    fillPatientForm("Emergency Patient");
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Emergency direct IPD admission/,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Register emergency IPD" }),
    );

    const currentAdmissions = screen.getByRole("region", {
      name: "Current admissions",
    });
    expect(
      within(currentAdmissions).getByText("IPD-2036 · Emergency · 35 · Female"),
    ).toBeDefined();
    expect(screen.queryByText("OPD-1044")).toBeNull();
  });

  it("filters OPD patients by name, ID, or phone", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));

    fireEvent.change(screen.getByRole("textbox", { name: "Search OPD patients" }), {
      target: { value: "OPD-1042" },
    });

    const patientSearch = screen.getByRole("region", {
      name: "Search OPD patients",
    });
    expect(within(patientSearch).getByText("Demo Patient B")).toBeDefined();
    expect(within(patientSearch).queryByText("Demo Patient A")).toBeNull();
  });
});
