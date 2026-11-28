import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OverviewDashboard, { getTimeGreeting } from "./overview-dashboard";

const { replace, refresh, signOut } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({ auth: { signOut } }),
}));

afterEach(() => {
  cleanup();
  replace.mockReset();
  refresh.mockReset();
  signOut.mockReset();
});

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

function fillIpdPatientForm(name: string) {
  fireEvent.change(screen.getByLabelText("Prefix"), {
    target: { value: "Mr" },
  });
  fireEvent.change(screen.getByLabelText("Full Name"), {
    target: { value: name },
  });
  fireEvent.change(screen.getByRole("combobox", { name: "Gender" }), {
    target: { value: "Female" },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Age" }), {
    target: { value: "35" },
  });
  fireEvent.change(screen.getByLabelText("Admission Date"), {
    target: { value: "2026-11-28" },
  });
  fireEvent.change(screen.getByLabelText("Admission Time"), {
    target: { value: "10:30" },
  });
  fireEvent.change(screen.getByLabelText("Ref. Doctor"), {
    target: { value: "Dr. Example" },
  });
  fireEvent.change(screen.getByLabelText("Ward"), {
    target: { value: "Medical" },
  });
  fireEvent.change(screen.getByLabelText("Bed No"), {
    target: { value: "12" },
  });
  fireEvent.change(screen.getByLabelText("Attender Name"), {
    target: { value: "Attender Example" },
  });
  fireEvent.change(screen.getByLabelText("Relation"), {
    target: { value: "Spouse" },
  });
  fireEvent.change(screen.getByLabelText("Mobile No"), {
    target: { value: "555-0199" },
  });
  fireEvent.change(screen.getByLabelText("Address", { selector: "textarea" }), {
    target: { value: "12 Sample Road" },
  });
}

function createCustomShift(name: string, startTime: string, endTime: string) {
  const shifts = screen.getByRole("tabpanel", { name: "Shifts" });
  fireEvent.change(within(shifts).getByLabelText("Shift name"), {
    target: { value: name },
  });
  fireEvent.change(within(shifts).getByLabelText("Start time"), {
    target: { value: startTime },
  });
  fireEvent.change(within(shifts).getByLabelText("End time"), {
    target: { value: endTime },
  });
  fireEvent.click(
    within(shifts).getByRole("button", { name: "Create custom shift" }),
  );
}

describe("hospital overview", () => {
  it("chooses a greeting based on the hour of day", () => {
    expect(getTimeGreeting(9)).toBe("Good morning");
    expect(getTimeGreeting(14)).toBe("Good afternoon");
    expect(getTimeGreeting(19)).toBe("Good evening");
  });

  it("shows admissions, OPD, priority escalations, and staff approvals", () => {
    render(<OverviewDashboard />);

    expect(
      screen.getByRole("heading", { name: "Total patients admitted" }),
    ).toBeDefined();
    expect(screen.getByRole("heading", { name: "OPD visits today" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Active alerts" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Staff approvals" })).toBeDefined();
    expect(screen.getByText("Urgent 1 · High 1 · Medium 1")).toBeDefined();
    expect(screen.getByText("Leave approvals · Device approvals")).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Overdue duties" })).toBeNull();
    expect(screen.getByText(/These numbers are sample data/)).toBeDefined();
  });

  it("supports night and normal color modes", () => {
    render(<OverviewDashboard />);

    const app = screen.getByRole("main");
    expect(app.parentElement?.getAttribute("data-theme")).toBe("night");

    fireEvent.click(screen.getByRole("button", { name: "Normal mode" }));
    expect(app.parentElement?.getAttribute("data-theme")).toBe("normal");
  });

  it("signs out through Supabase and returns to the access page", async () => {
    signOut.mockResolvedValue({ error: null });
    render(<OverviewDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(refresh).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  it("triages escalations, assigns staff, and completes a report", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Escalations" }));

    expect(
      screen.getByRole("heading", { name: "Escalation inbox" }),
    ).toBeDefined();
    const report = screen.getByRole("article", {
      name: "Oxygen outlet pressure fluctuating",
    });
    expect(within(report).getByText("Critical")).toBeDefined();
    expect(within(report).getByText("Overdue")).toBeDefined();

    fireEvent.change(
      within(report).getByRole("combobox", {
        name: "Assign ESC-1042 to staff",
      }),
      { target: { value: "staff-002" } },
    );
    fireEvent.click(within(report).getByRole("button", { name: "Assign work" }));
    expect(
      within(report).getByText("Assigned to").parentElement?.textContent,
    ).toContain("Samir Patel · Biomedical");
    expect(screen.getByRole("status").textContent).toContain(
      "Staff-app notifications are not connected",
    );

    fireEvent.click(
      within(report).getByRole("button", { name: "Mark completed" }),
    );
    expect(within(report).getByText("Completed")).toBeDefined();
  });

  it("lets the owner create and assign work without a staff report", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Escalations" }));
    fireEvent.click(screen.getByRole("button", { name: "Assign other work" }));

    fireEvent.change(screen.getByLabelText("Work title"), {
      target: { value: "Inspect the east wing door" },
    });
    fireEvent.change(screen.getByLabelText("Work details"), {
      target: { value: "Check the latch and repair it if needed." },
    });
    fireEvent.change(screen.getByLabelText("Department or team"), {
      target: { value: "Facilities" },
    });
    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: "East Wing" },
    });
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2099-12-31" },
    });
    fireEvent.change(screen.getByLabelText("Assign direct work to staff"), {
      target: { value: "staff-001" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Create and assign work" }),
    );

    const workItem = screen.getByRole("article", {
      name: "Inspect the east wing door",
    });
    expect(within(workItem).getByText("WORK-0001")).toBeDefined();
    expect(within(workItem).getByText("Owner-assigned work")).toBeDefined();
    expect(
      within(workItem).getByText("Assigned to").parentElement?.textContent,
    ).toContain("Maya Chen · Facilities");
    expect(within(workItem).getByText("Due")).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain(
      "Staff-app notifications are not connected",
    );
  });

  it("adds, edits, and deactivates employees and reflects active salaries in payroll", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Employees" }));
    fireEvent.click(screen.getByRole("tab", { name: "Shifts" }));
    createCustomShift("Night coverage", "22:00", "06:00");
    createCustomShift("Day coverage", "07:00", "15:00");
    fireEvent.click(screen.getByRole("tab", { name: "Employee Directory" }));

    fireEvent.click(screen.getByRole("button", { name: "Add employee" }));
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Nora Shah" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "Pharmacist" },
    });
    fireEvent.change(screen.getByLabelText("Department"), {
      target: { value: "Pharmacy" },
    });
    fireEvent.change(screen.getByLabelText("Shift assignment"), {
      target: { value: "SHIFT-101" },
    });
    fireEvent.change(screen.getByLabelText("Monthly salary (local currency)"), {
      target: { value: "3600" },
    });

    const employeeForm = screen.getByRole("form", {
      name: "Employee record form",
    });
    fireEvent.click(within(employeeForm).getByRole("button", { name: "Add employee" }));
    let employeeCard = screen.getByRole("article", { name: "Nora Shah" });
    expect(within(employeeCard).getByText("EMP-1005 · Pharmacist · Pharmacy")).toBeDefined();
    expect(
      within(employeeCard).getByText("Shift assignment: Night coverage"),
    ).toBeDefined();

    fireEvent.click(within(employeeCard).getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "Senior Pharmacist" },
    });
    fireEvent.change(screen.getByLabelText("Shift assignment"), {
      target: { value: "SHIFT-102" },
    });
    fireEvent.change(screen.getByLabelText("Monthly salary (local currency)"), {
      target: { value: "3900" },
    });
    fireEvent.click(
      within(
        screen.getByRole("form", { name: "Employee record form" }),
      ).getByRole("button", { name: "Save employee" }),
    );

    employeeCard = screen.getByRole("article", { name: "Nora Shah" });
    expect(
      within(employeeCard).getByText("EMP-1005 · Senior Pharmacist · Pharmacy"),
    ).toBeDefined();
    expect(
      within(employeeCard).getByText("Shift assignment: Day coverage"),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("tab", { name: "Shifts" }));
    expect(
      within(screen.getByRole("tabpanel", { name: "Shifts" })).getByText("Nora Shah"),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("tab", { name: "Employee Directory" }));
    employeeCard = screen.getByRole("article", { name: "Nora Shah" });
    fireEvent.click(
      within(employeeCard).getByRole("button", { name: "Deactivate" }),
    );
    expect(within(employeeCard).getByText("Inactive")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "Monthly Payroll" }));
    const payroll = screen.getByRole("tabpanel", { name: "Monthly Payroll" });
    expect(within(payroll).getByText("14,000.00")).toBeDefined();
    expect(within(payroll).getByText(/3 active employees/)).toBeDefined();
  });

  it("creates custom shifts and manages daily attendance", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Employees" }));

    fireEvent.click(screen.getByRole("tab", { name: "Shifts" }));
    const shifts = screen.getByRole("tabpanel", { name: "Shifts" });
    createCustomShift("Weekend support", "23:00", "07:00");
    expect(within(shifts).getByText("SHIFT-101 · 23:00–07:00")).toBeDefined();
    expect(within(shifts).getByText("Weekend support")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "Attendance" }));
    const attendance = screen.getByRole("tabpanel", { name: "Attendance" });
    fireEvent.change(
      within(attendance).getByRole("combobox", {
        name: "Attendance for Maya Chen",
      }),
      { target: { value: "Absent" } },
    );
    expect(
      within(attendance).getByText("Present 1 · Absent 1 · Late 0 · On leave 1"),
    ).toBeDefined();
  });

  it("records daily late-entry details and opens the monthly attendance report", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Employees" }));
    fireEvent.click(screen.getByRole("tab", { name: "Attendance" }));

    const attendance = screen.getByRole("tabpanel", { name: "Attendance" });
    const dailyTable = within(attendance).getByRole("table", {
      name: "Daily attendance",
    });
    fireEvent.change(
      within(dailyTable).getByRole("combobox", {
        name: "Attendance for Maya Chen",
      }),
      { target: { value: "Late entry" } },
    );
    fireEvent.change(
      within(dailyTable).getByLabelText("Late arrival time for Maya Chen"),
      { target: { value: "09:15" } },
    );
    fireEvent.change(
      within(dailyTable).getByLabelText("Late entry details for Maya Chen"),
      { target: { value: "Public transport delay" } },
    );
    expect(
      within(attendance).getByText("Present 1 · Absent 0 · Late 1 · On leave 1"),
    ).toBeDefined();

    fireEvent.click(
      within(
        screen.getByRole("group", { name: "Attendance report view" }),
      ).getByRole("button", { name: "Monthly" }),
    );
    const monthlyTable = within(attendance).getByRole("table", {
      name: "Monthly attendance for November 2026",
    });
    const mayaRow = within(monthlyTable).getByRole("row", { name: /Maya Chen/ });
    expect(within(mayaRow).getByText("L")).toBeDefined();

    const lateDetails = within(attendance).getByRole("table", {
      name: "Monthly late entry details",
    });
    expect(within(lateDetails).getByText("09:15")).toBeDefined();
    expect(within(lateDetails).getByText("Public transport delay")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "Reports" }));
    const reports = screen.getByRole("tabpanel", { name: "Reports" });
    fireEvent.change(within(reports).getByLabelText("Report type"), {
      target: { value: "late-entries" },
    });
    const lateEntryReport = within(reports).getByRole("table", {
      name: "Late entry report",
    });
    expect(within(lateEntryReport).getByText("Public transport delay")).toBeDefined();
  });

  it("provides directory, leave, absence, and payroll reports from the Reports tab", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Employees" }));
    fireEvent.click(screen.getByRole("tab", { name: "Reports" }));

    const reports = screen.getByRole("tabpanel", { name: "Reports" });
    expect(
      within(reports).getByRole("table", { name: "Employee directory report" }),
    ).toBeDefined();
    const reportType = within(reports).getByLabelText("Report type");

    fireEvent.change(reportType, {
      target: { value: "employees-on-leave" },
    });
    const leaveReport = within(reports).getByRole("table", {
      name: "Employees on leave report",
    });
    expect(within(leaveReport).getByText("Lina Okafor")).toBeDefined();

    fireEvent.change(reportType, {
      target: { value: "absent-employees" },
    });
    expect(
      within(
        within(reports).getByRole("table", { name: "Absent employees report" }),
      ).getByText("No employees marked absent for this date."),
    ).toBeDefined();

    fireEvent.change(reportType, {
      target: { value: "monthly-payroll" },
    });
    const payrollReport = within(reports).getByRole("table", {
      name: "Monthly payroll report",
    });
    expect(within(payrollReport).getByText("14,000.00")).toBeDefined();
  });

  it("assigns staff credentials, approves first login once, and records owner password resets", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Employees" }));
    fireEvent.click(screen.getByRole("tab", { name: "Staff Access" }));

    const staffAccess = screen.getByRole("tabpanel", { name: "Staff Access" });
    const samir = within(staffAccess).getByRole("article", { name: "Samir Patel" });
    fireEvent.click(
      within(samir).getByRole("button", { name: "Approve first login" }),
    );
    expect(within(samir).getByText("Approved")).toBeDefined();
    expect(
      within(samir).queryByRole("button", { name: "Approve first login" }),
    ).toBeNull();

    fireEvent.click(
      within(staffAccess).getByRole("button", { name: "Assign staff access" }),
    );
    const accessForm = within(staffAccess).getByRole("form", {
      name: "Initial staff access form",
    });
    fireEvent.change(within(accessForm).getByLabelText("Employee"), {
      target: { value: "EMP-1003" },
    });
    fireEvent.change(within(accessForm).getByLabelText("Username"), {
      target: { value: "lina.okafor" },
    });
    fireEvent.change(within(accessForm).getByLabelText("Temporary password"), {
      target: { value: "InitialPass123" },
    });
    fireEvent.click(
      within(accessForm).getByRole("button", {
        name: "Assign username and password",
      }),
    );

    const lina = within(staffAccess).getByRole("article", { name: "Lina Okafor" });
    expect(within(lina).getByText("Username: lina.okafor")).toBeDefined();
    expect(within(lina).getByText("Awaiting first login")).toBeDefined();
    expect(lina.textContent).not.toContain("InitialPass123");

    fireEvent.click(
      within(lina).getByRole("button", {
        name: "Reset password for Lina Okafor",
      }),
    );
    const resetForm = within(lina).getByRole("form", {
      name: "Password reset form for Lina Okafor",
    });
    fireEvent.change(within(resetForm).getByLabelText("New temporary password"), {
      target: { value: "ResetPass123" },
    });
    fireEvent.change(within(resetForm).getByLabelText("Confirm new password"), {
      target: { value: "ResetPass123" },
    });
    fireEvent.click(
      within(resetForm).getByRole("button", { name: "Reset password" }),
    );
    expect(within(lina).getByText(/Owner resets: 1/)).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain(
      "Passwords are not stored in this preview.",
    );
  });

  it("approves leave requests submitted from the staff app preview", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Employees" }));
    fireEvent.click(screen.getByRole("tab", { name: "Leave Requests" }));

    const leaveTab = screen.getByRole("tabpanel", { name: "Leave Requests" });
    fireEvent.click(within(leaveTab).getAllByRole("button", { name: "Approve" })[0]);
    expect(within(leaveTab).getByText("Approved")).toBeDefined();
    expect(within(leaveTab).getByText("1 pending")).toBeDefined();
    expect(within(leaveTab).getByText(/not connected in this preview/)).toBeDefined();
  });

  it("shows the main tabs horizontally and opens reception", () => {
    render(<OverviewDashboard />);

    const navigation = screen.getByRole("navigation", {
      name: "Main hospital tabs",
    });
    expect(within(navigation).getByRole("button", { name: "Overview" })).toBeDefined();
    const mainTabNames = within(navigation)
      .getAllByRole("button")
      .map((tab) => tab.textContent?.trim());
    const employeesIndex = mainTabNames.indexOf("Employees");
    expect(mainTabNames[employeesIndex + 1]).toBe("Facilities");
    fireEvent.click(within(navigation).getByRole("button", { name: "Reception" }));

    expect(
      screen.getByRole("heading", { name: "Patient reception" }),
    ).toBeDefined();
    expect(
      screen.getByText(/Preview data only\. Changes reset/),
    ).toBeDefined();
  });

  it("registers equipment and approves supply use before reducing stock", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Facilities" }));

    expect(screen.getByRole("heading", { name: "Facilities" })).toBeDefined();
    expect(screen.getByText("2 low-stock alerts")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "Equipment Register" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Register equipment" }),
    );
    const equipmentForm = screen.getByRole("form", {
      name: "Equipment registration form",
    });
    fireEvent.change(within(equipmentForm).getByLabelText("Equipment name"), {
      target: { value: "Portable suction unit" },
    });
    fireEvent.change(within(equipmentForm).getByLabelText("Category"), {
      target: { value: "Respiratory" },
    });
    fireEvent.change(
      within(equipmentForm).getByLabelText("Serial or asset number"),
      { target: { value: "SU-55102" } },
    );
    fireEvent.change(within(equipmentForm).getByLabelText("Department"), {
      target: { value: "Emergency" },
    });
    fireEvent.change(within(equipmentForm).getByLabelText("Location"), {
      target: { value: "Triage" },
    });
    fireEvent.click(
      within(equipmentForm).getByRole("button", { name: "Save equipment" }),
    );
    const equipmentRow = within(
      screen.getByRole("table", { name: "Equipment register" }),
    ).getByRole("row", { name: /Portable suction unit/ });
    expect(within(equipmentRow).getByText("SU-55102")).toBeDefined();
    fireEvent.change(
      within(equipmentRow).getByRole("combobox", {
        name: "Status for Portable suction unit",
      }),
      { target: { value: "Out of service" } },
    );
    expect(within(equipmentRow).getByDisplayValue("Out of service")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "Supply Requests" }));
    const requests = screen.getByRole("tabpanel", { name: "Supply Requests" });
    const request = within(requests).getByRole("article", {
      name: "REQ-501 · Oxygen sensor filters",
    });
    fireEvent.click(within(request).getByRole("button", { name: "Approve" }));
    expect(within(request).getByText("Approved")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "Biomedical Stock" }));
    const stockTable = screen.getByRole("table", {
      name: "Biomedical supplies stock",
    });
    const filterRow = within(stockTable).getByRole("row", {
      name: /Oxygen sensor filters/,
    });
    expect(filterRow.textContent).toContain("3 filters");

    const restockForm = screen.getByRole("form", {
      name: "Restock supplies form",
    });
    fireEvent.change(within(restockForm).getByLabelText("Supply to restock"), {
      target: { value: "SUP-201" },
    });
    fireEvent.change(within(restockForm).getByLabelText("Quantity received"), {
      target: { value: "3" },
    });
    fireEvent.click(within(restockForm).getByRole("button", { name: "Restock" }));
    expect(screen.getByText("1 low-stock alert")).toBeDefined();
  });

  it("adds biomedical supply items and raises a low-stock alert at the threshold", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Facilities" }));
    fireEvent.click(screen.getByRole("tab", { name: "Biomedical Stock" }));
    fireEvent.click(screen.getByRole("button", { name: "Add supply item" }));

    const supplyForm = screen.getByRole("form", { name: "Add supply item form" });
    fireEvent.change(within(supplyForm).getByLabelText("Supply name"), {
      target: { value: "Ventilator flow sensor" },
    });
    fireEvent.change(within(supplyForm).getByLabelText("Category"), {
      target: { value: "Biomedical" },
    });
    fireEvent.change(within(supplyForm).getByLabelText("Unit"), {
      target: { value: "pieces" },
    });
    fireEvent.change(within(supplyForm).getByLabelText("Opening stock"), {
      target: { value: "2" },
    });
    fireEvent.change(within(supplyForm).getByLabelText("Low-stock alert level"), {
      target: { value: "2" },
    });
    fireEvent.click(
      within(supplyForm).getByRole("button", { name: "Save supply item" }),
    );

    expect(
      within(
        screen.getByRole("table", { name: "Biomedical supplies stock" }),
      ).getByRole("row", { name: /Ventilator flow sensor/ }),
    ).toBeDefined();
    expect(screen.getByText("3 low-stock alerts")).toBeDefined();
  });

  it("registers an OPD patient, admits them, then moves them to discharge history", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));

    fillPatientForm("Demo New Patient");
    fireEvent.click(screen.getByRole("button", { name: "Register OPD patient" }));

    expect(screen.getByText("Demo New Patient")).toBeDefined();
    expect(screen.getByText("OPD-1044 · 35 · Female")).toBeDefined();
    fireEvent.click(screen.getAllByRole("button", { name: "Admit to IPD" })[0]);

    fireEvent.click(screen.getByRole("button", { name: "IPD Inpatient" }));
    const currentAdmissions = screen.getByRole("region", {
      name: "Current admissions",
    });
    expect(within(currentAdmissions).getByText(/IPD-2036/)).toBeDefined();

    fireEvent.click(within(currentAdmissions).getAllByRole("button", { name: "Discharge" })[0]);
    expect(
      within(currentAdmissions).queryByText(/IPD-2036/),
    ).toBeNull();
    const dischargeHistory = screen.getByRole("region", {
      name: "Discharge history",
    });
    expect(within(dischargeHistory).getByText("IPD-2036 · OPD · OPD-1044")).toBeDefined();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search discharge history" }),
      { target: { value: "IPD-2036" } },
    );
    expect(
      within(dischargeHistory).getByText("Demo New Patient"),
    ).toBeDefined();
    expect(within(dischargeHistory).queryByText("Demo Patient F")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));
    expect(
      within(
        screen.getByRole("region", { name: "Discharge history" }),
      ).getByText("IPD-2036 · OPD · OPD-1044"),
    ).toBeDefined();
  });

  it("marks a direct IPD registration as an emergency when selected", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));
    fireEvent.click(screen.getByRole("button", { name: "IPD Inpatient" }));

    fillIpdPatientForm("Emergency Patient");
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Emergency admission/,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Register IPD patient" }),
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

  it("creates and marks an OPD bill as paid", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));

    fireEvent.change(screen.getByLabelText("Patient"), {
      target: { value: "OPD-1041" },
    });
    fireEvent.change(screen.getByLabelText("Service or charge"), {
      target: { value: "Consultation" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "125.50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create OPD bill" }));

    expect(screen.getByText("BILL-0001 · OPD-1041 · Consultation")).toBeDefined();
    expect(screen.getByText("125.50")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Mark paid" }));
    expect(screen.getByText("Paid")).toBeDefined();
  });

  it("registers, searches, and bills an IPD patient", () => {
    render(<OverviewDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reception" }));
    fireEvent.click(screen.getByRole("button", { name: "IPD Inpatient" }));

    fillIpdPatientForm("New Inpatient");
    fireEvent.click(screen.getByRole("button", { name: "Register IPD patient" }));

    const currentAdmissions = screen.getByRole("region", {
      name: "Current admissions",
    });
    expect(
      within(currentAdmissions).getByText("IPD-2036 · Direct · 35 · Female"),
    ).toBeDefined();
    expect(
      within(currentAdmissions).getByText("Medical · Bed 12"),
    ).toBeDefined();
    expect(
      within(currentAdmissions).getByText(
        "Ref. Doctor: Dr. Example · Attender: Attender Example · Spouse · 555-0199 · 12 Sample Road",
      ),
    ).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Search IPD patients" })).toBeNull();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search current admissions" }),
      { target: { value: "New Inpatient" } },
    );
    expect(within(currentAdmissions).getByText("Mr New Inpatient")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Patient"), {
      target: { value: "IPD-2036" },
    });
    fireEvent.change(screen.getByLabelText("Service or charge"), {
      target: { value: "Room charge" },
    });
    fireEvent.change(screen.getByLabelText("Amount (local currency)"), {
      target: { value: "850" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create IPD bill" }));

    expect(screen.getByText("BILL-0001 · IPD-2036 · Room charge")).toBeDefined();
    expect(screen.getByText("850.00")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Mark paid" }));
    expect(screen.getByText("Paid")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Advance patient"), {
      target: { value: "IPD-2036" },
    });
    fireEvent.change(screen.getByLabelText(/Advance amount collected/), {
      target: { value: "400" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Record IPD advance" }));

    const advanceSection = screen.getByRole("region", {
      name: "Collect patient advance",
    });
    expect(
      within(advanceSection).getByText("ADV-0001 · IPD-2036 · Just now"),
    ).toBeDefined();
    expect(within(advanceSection).getAllByText("400.00")).toHaveLength(2);
  });
});
