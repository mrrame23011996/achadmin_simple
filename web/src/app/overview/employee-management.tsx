"use client";

import { useMemo, useState, type FormEvent } from "react";
import styles from "./employee-management.module.css";

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  shiftId: string | null;
  email: string;
  phone: string;
  monthlySalary: number;
  active: boolean;
};

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

type AttendanceStatus =
  | "Unmarked"
  | "Present"
  | "Absent"
  | "Late entry"
  | "On leave";

type AttendanceRecord = {
  employeeId: string;
  date: string;
  status: Exclude<AttendanceStatus, "Unmarked">;
  lateArrivalTime?: string;
  lateEntryDetails?: string;
};

type LeaveStatus = "Pending" | "Approved" | "Declined";

type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
};

type StaffAccessStatus =
  | "Awaiting first login"
  | "Approval requested"
  | "Approved";

type StaffAccessAccount = {
  employeeId: string;
  username: string;
  status: StaffAccessStatus;
  passwordConfigured: boolean;
  passwordResetCount: number;
};

type EmployeeSection =
  | "directory"
  | "shifts"
  | "attendance"
  | "leave"
  | "payroll"
  | "reports"
  | "staff-access";

type ReportType =
  | "employee-directory"
  | "daily-attendance"
  | "employees-on-leave"
  | "monthly-payroll"
  | "late-entries"
  | "absent-employees";

const reportTypes: { id: ReportType; label: string }[] = [
  { id: "employee-directory", label: "Employee Directory" },
  { id: "daily-attendance", label: "Daily Attendance" },
  { id: "employees-on-leave", label: "Employees on Leave (Date)" },
  { id: "monthly-payroll", label: "Monthly Payroll" },
  { id: "late-entries", label: "Late Entry Report" },
  { id: "absent-employees", label: "Absent Report (Date)" },
];

const initialEmployees: Employee[] = [
  {
    id: "EMP-1001",
    name: "Maya Chen",
    role: "Facilities Coordinator",
    department: "Facilities",
    shiftId: null,
    email: "maya.chen@example.test",
    phone: "555-0101",
    monthlySalary: 4200,
    active: true,
  },
  {
    id: "EMP-1002",
    name: "Samir Patel",
    role: "Biomedical Technician",
    department: "Biomedical",
    shiftId: null,
    email: "samir.patel@example.test",
    phone: "555-0102",
    monthlySalary: 5000,
    active: true,
  },
  {
    id: "EMP-1003",
    name: "Lina Okafor",
    role: "Registered Nurse",
    department: "Nursing",
    shiftId: null,
    email: "lina.okafor@example.test",
    phone: "555-0103",
    monthlySalary: 4800,
    active: true,
  },
  {
    id: "EMP-1004",
    name: "Ben Carter",
    role: "Operations Officer",
    department: "Operations",
    shiftId: null,
    email: "ben.carter@example.test",
    phone: "555-0104",
    monthlySalary: 4100,
    active: false,
  },
];

const initialShifts: Shift[] = [];

const initialAttendance: AttendanceRecord[] = [
  { employeeId: "EMP-1001", date: "2026-11-28", status: "Present" },
  { employeeId: "EMP-1002", date: "2026-11-28", status: "Present" },
  { employeeId: "EMP-1003", date: "2026-11-28", status: "On leave" },
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "LEAVE-301",
    employeeId: "EMP-1003",
    leaveType: "Annual leave",
    startDate: "2026-11-30",
    endDate: "2026-12-02",
    reason: "Family commitment.",
    status: "Pending",
  },
  {
    id: "LEAVE-302",
    employeeId: "EMP-1002",
    leaveType: "Sick leave",
    startDate: "2026-11-29",
    endDate: "2026-11-29",
    reason: "Medical appointment.",
    status: "Pending",
  },
];

const initialStaffAccessAccounts: StaffAccessAccount[] = [
  {
    employeeId: "EMP-1001",
    username: "maya.chen",
    status: "Approved",
    passwordConfigured: true,
    passwordResetCount: 0,
  },
  {
    employeeId: "EMP-1002",
    username: "samir.patel",
    status: "Approval requested",
    passwordConfigured: true,
    passwordResetCount: 0,
  },
];

const sections: { id: EmployeeSection; label: string }[] = [
  { id: "directory", label: "Employee Directory" },
  { id: "shifts", label: "Shifts" },
  { id: "attendance", label: "Attendance" },
  { id: "leave", label: "Leave Requests" },
  { id: "payroll", label: "Monthly Payroll" },
  { id: "reports", label: "Reports" },
  { id: "staff-access", label: "Staff Access" },
];

const staffAccessStatusClasses: Record<StaffAccessStatus, string> = {
  "Awaiting first login": styles.inactiveStatus,
  "Approval requested": styles.pendingStatus,
  Approved: styles.approvedStatus,
};

const leaveStatusClasses: Record<LeaveStatus, string> = {
  Pending: styles.pendingStatus,
  Approved: styles.approvedStatus,
  Declined: styles.declinedStatus,
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateValue: string) {
  if (!dateValue) return "Select a date";
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatLeavePeriod(startDate: string, endDate: string) {
  if (startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function getEmployeeName(employees: Employee[], employeeId: string) {
  return employees.find((employee) => employee.id === employeeId)?.name ?? "Unknown employee";
}

function getShiftName(shifts: Shift[], shiftId: string | null) {
  return shifts.find((shift) => shift.id === shiftId)?.name ?? "Unassigned";
}

export default function EmployeeManagement() {
  const [activeSection, setActiveSection] = useState<EmployeeSection>("directory");
  const [employees, setEmployees] = useState(initialEmployees);
  const [shifts, setShifts] = useState(initialShifts);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [staffAccessAccounts, setStaffAccessAccounts] = useState(
    initialStaffAccessAccounts,
  );
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showStaffAccessForm, setShowStaffAccessForm] = useState(false);
  const [resetPasswordFor, setResetPasswordFor] = useState<string | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [attendanceDate, setAttendanceDate] = useState("2026-11-28");
  const [attendanceMonth, setAttendanceMonth] = useState("2026-11");
  const [attendanceView, setAttendanceView] = useState<"daily" | "monthly">("daily");
  const [payrollMonth, setPayrollMonth] = useState("2026-11");
  const [reportType, setReportType] = useState<ReportType>("employee-directory");
  const [message, setMessage] = useState("");
  const [staffAccessMessage, setStaffAccessMessage] = useState("");
  const [nextEmployeeNumber, setNextEmployeeNumber] = useState(1005);
  const [nextShiftNumber, setNextShiftNumber] = useState(101);

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((employee) => {
      const shiftName = getShiftName(shifts, employee.shiftId);
      return `${employee.id} ${employee.name} ${employee.role} ${employee.department} ${shiftName} ${employee.email}`
        .toLowerCase()
        .includes(query);
    });
  }, [employeeSearch, employees, shifts]);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.active),
    [employees],
  );
  const selectedEmployee = employees.find(
    (employee) => employee.id === editingEmployeeId,
  );
  const monthlyPayroll = activeEmployees.reduce(
    (total, employee) => total + employee.monthlySalary,
    0,
  );
  const periodLabel = payrollMonth
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
      }).format(new Date(`${payrollMonth}-01T00:00:00`))
    : "Select a month";

  function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const department = String(formData.get("department") ?? "").trim();
    const shiftId = String(formData.get("shiftId") ?? "");
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const salaryValue = String(formData.get("monthlySalary") ?? "").trim();
    const monthlySalary = Number(salaryValue);

    if (
      !name ||
      !role ||
      !department ||
      (shiftId && !shifts.some((shift) => shift.id === shiftId)) ||
      !salaryValue ||
      !Number.isFinite(monthlySalary) ||
      monthlySalary <= 0
    ) {
      setMessage("Enter the employee details and a salary greater than zero.");
      return;
    }

    if (editingEmployeeId) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === editingEmployeeId
            ? {
                ...employee,
                name,
                role,
                department,
                shiftId: shiftId || null,
                email,
                phone,
                monthlySalary,
              }
            : employee,
        ),
      );
      setMessage(`${name}'s employee record was updated.`);
    } else {
      const employee: Employee = {
        id: `EMP-${nextEmployeeNumber}`,
        name,
        role,
        department,
        shiftId: shiftId || null,
        email,
        phone,
        monthlySalary,
        active: true,
      };
      setEmployees((current) => [employee, ...current]);
      setNextEmployeeNumber((current) => current + 1);
      setMessage(`${name} was added to the employee directory.`);
    }

    form.reset();
    setShowEmployeeForm(false);
    setEditingEmployeeId(null);
  }

  function createStaffAccessAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const employeeId = String(formData.get("employeeId") ?? "");
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const employee = employees.find(
      (candidate) => candidate.id === employeeId && candidate.active,
    );

    if (!employee) {
      setStaffAccessMessage("Choose an active employee without a staff account.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
      setStaffAccessMessage(
        "Use a username with 3–30 letters, numbers, dots, underscores, or hyphens.",
      );
      return;
    }
    if (
      staffAccessAccounts.some(
        (account) => account.username.toLowerCase() === username.toLowerCase(),
      )
    ) {
      setStaffAccessMessage("That username is already assigned.");
      return;
    }
    if (password.length < 8) {
      setStaffAccessMessage("Use a temporary password with at least 8 characters.");
      return;
    }
    if (staffAccessAccounts.some((account) => account.employeeId === employeeId)) {
      setStaffAccessMessage("This employee already has staff access.");
      return;
    }

    setStaffAccessAccounts((current) => [
      ...current,
      {
        employeeId,
        username,
        status: "Awaiting first login",
        passwordConfigured: true,
        passwordResetCount: 0,
      },
    ]);
    setStaffAccessMessage(
      `${username} was assigned to ${employee.name}. The password is not stored in this preview.`,
    );
    form.reset();
    setShowStaffAccessForm(false);
  }

  function approveFirstLogin(employeeId: string) {
    const account = staffAccessAccounts.find(
      (candidate) => candidate.employeeId === employeeId,
    );
    const employee = employees.find((candidate) => candidate.id === employeeId);
    if (
      !account ||
      account.status !== "Approval requested" ||
      !employee?.active
    ) {
      setStaffAccessMessage("Only an active employee's pending request can be approved.");
      return;
    }

    setStaffAccessAccounts((current) =>
      current.map((candidate) =>
        candidate.employeeId === employeeId
          ? { ...candidate, status: "Approved" }
          : candidate,
      ),
    );
    setStaffAccessMessage(
      `${account.username}'s one-time first-login approval is complete.`,
    );
  }

  function resetStaffPassword(event: FormEvent<HTMLFormElement>, employeeId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("newPassword") ?? "");
    const confirmation = String(formData.get("confirmPassword") ?? "");
    const account = staffAccessAccounts.find(
      (candidate) => candidate.employeeId === employeeId,
    );

    if (!account) {
      setStaffAccessMessage("Staff account was not found.");
      return;
    }
    if (password.length < 8) {
      setStaffAccessMessage("Use a new password with at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setStaffAccessMessage("The new password and confirmation do not match.");
      return;
    }

    setStaffAccessAccounts((current) =>
      current.map((candidate) =>
        candidate.employeeId === employeeId
          ? {
              ...candidate,
              passwordConfigured: true,
              passwordResetCount: candidate.passwordResetCount + 1,
            }
          : candidate,
      ),
    );
    setStaffAccessMessage(
      `Owner password reset recorded for ${account.username}. Passwords are not stored in this preview.`,
    );
    form.reset();
    setResetPasswordFor(null);
  }

  function addShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");

    if (!name || !startTime || !endTime || startTime === endTime) {
      setMessage("Enter a shift name and different start and end times.");
      return;
    }

    if (
      shifts.some((shift) => shift.name.toLowerCase() === name.toLowerCase())
    ) {
      setMessage("A shift with this name already exists.");
      return;
    }

    const newShift: Shift = {
      id: `SHIFT-${nextShiftNumber}`,
      name,
      startTime,
      endTime,
    };
    setShifts((current) => [newShift, ...current]);
    setNextShiftNumber((current) => current + 1);
    setMessage(`${name} shift created. Assign employees in the directory.`);
    form.reset();
  }

  function setAttendanceStatus(employeeId: string, status: string) {
    if (
      status !== "Present" &&
      status !== "Absent" &&
      status !== "Late entry" &&
      status !== "On leave" &&
      status !== "Unmarked"
    ) {
      return;
    }

    setAttendance((current) => {
      const previous = current.find(
        (record) =>
          record.employeeId === employeeId && record.date === attendanceDate,
      );
      const filtered = current.filter(
        (record) =>
          record.employeeId !== employeeId || record.date !== attendanceDate,
      );
      return status === "Unmarked"
        ? filtered
        : [
            ...filtered,
            {
              employeeId,
              date: attendanceDate,
              status,
              ...(status === "Late entry"
                ? {
                    lateArrivalTime: previous?.lateArrivalTime ?? "",
                    lateEntryDetails: previous?.lateEntryDetails ?? "",
                  }
                : {}),
            },
          ];
    });
    setMessage("");
  }

  function setLateEntryField(
    employeeId: string,
    field: "lateArrivalTime" | "lateEntryDetails",
    value: string,
  ) {
    setAttendance((current) =>
      current.map((record) =>
        record.employeeId === employeeId &&
        record.date === attendanceDate &&
        record.status === "Late entry"
          ? { ...record, [field]: value }
          : record,
      ),
    );
  }

  function updateLeaveRequest(requestId: string, status: LeaveStatus) {
    setLeaveRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      ),
    );
    setMessage(`Leave request ${requestId} ${status.toLowerCase()}.`);
  }

  function toggleEmployeeStatus(employeeId: string) {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? { ...employee, active: !employee.active }
          : employee,
      ),
    );
  }

  const dailyAttendanceCounts = activeEmployees.reduce(
    (counts, employee) => {
      const record = attendance.find(
        (item) =>
          item.employeeId === employee.id && item.date === attendanceDate,
      );
      if (record?.status === "Present") counts.present += 1;
      if (record?.status === "Absent") counts.absent += 1;
      if (record?.status === "Late entry") counts.late += 1;
      if (record?.status === "On leave") counts.onLeave += 1;
      return counts;
    },
    { present: 0, absent: 0, late: 0, onLeave: 0 },
  );
  const attendanceMonthParts = attendanceMonth.split("-").map(Number);
  const monthDayCount =
    attendanceMonthParts.length === 2 && attendanceMonthParts.every(Number.isFinite)
      ? new Date(attendanceMonthParts[0], attendanceMonthParts[1], 0).getDate()
      : 0;
  const attendanceMonthDays = Array.from({ length: monthDayCount }, (_, index) =>
    `${attendanceMonth}-${String(index + 1).padStart(2, "0")}`,
  );
  const attendanceMonthLabel = attendanceMonth
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
      }).format(
        new Date(attendanceMonthParts[0], attendanceMonthParts[1] - 1, 1),
      )
    : "Select a month";
  const attendanceStatusCodes: Record<AttendanceStatus, string> = {
    Unmarked: "—",
    Present: "P",
    Absent: "A",
    "Late entry": "L",
    "On leave": "O",
  };
  const monthlyAttendanceRows = activeEmployees.map((employee) => {
    const records = attendanceMonthDays.map((date) =>
      attendance.find(
        (record) => record.employeeId === employee.id && record.date === date,
      ),
    );
    return {
      employee,
      records,
      present: records.filter((record) => record?.status === "Present").length,
      absent: records.filter((record) => record?.status === "Absent").length,
      late: records.filter((record) => record?.status === "Late entry").length,
      onLeave: records.filter((record) => record?.status === "On leave").length,
    };
  });
  const monthlyAttendanceCounts = monthlyAttendanceRows.reduce(
    (counts, row) => ({
      present: counts.present + row.present,
      absent: counts.absent + row.absent,
      late: counts.late + row.late,
      onLeave: counts.onLeave + row.onLeave,
    }),
    { present: 0, absent: 0, late: 0, onLeave: 0 },
  );
  const monthlyLateEntries = activeEmployees.flatMap((employee) =>
    attendance
      .filter(
        (record) =>
          record.employeeId === employee.id &&
          record.date.startsWith(`${attendanceMonth}-`) &&
          record.status === "Late entry",
      )
      .map((record) => ({ employee, record })),
  );
  const dailyAttendanceRows = activeEmployees.map((employee) => ({
    employee,
    record: attendance.find(
      (record) =>
        record.employeeId === employee.id && record.date === attendanceDate,
    ),
  }));
  const dailyAbsentRows = dailyAttendanceRows.filter(
    ({ record }) => record?.status === "Absent",
  );
  const dailyLeaveRows = activeEmployees.flatMap((employee) => {
    const approvedRequests = leaveRequests.filter(
      (request) =>
        request.employeeId === employee.id &&
        request.status === "Approved" &&
        request.startDate <= attendanceDate &&
        request.endDate >= attendanceDate,
    );
    if (approvedRequests.length) {
      return approvedRequests.map((request) => ({
        employee,
        leaveType: request.leaveType,
        status: request.status,
        details: request.reason,
      }));
    }

    const attendanceRecord = attendance.find(
      (record) =>
        record.employeeId === employee.id &&
        record.date === attendanceDate &&
        record.status === "On leave",
    );
    return attendanceRecord
      ? [
          {
            employee,
            leaveType: "Attendance record",
            status: "On leave",
            details: "Marked on leave for this date.",
          },
        ]
      : [];
  });

  return (
    <div className={styles.employeesPage}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>PEOPLE OPERATIONS</span>
          <h1>Employees</h1>
          <p>Manage employee records, schedules, attendance, leave, and payroll.</p>
        </div>
        {activeSection === "directory" && (
          <button
            className={styles.primaryButton}
            onClick={() => {
              setShowEmployeeForm((current) => !current);
              setEditingEmployeeId(null);
              setMessage("");
            }}
            type="button"
          >
            {showEmployeeForm ? "Close form" : "Add employee"}
          </button>
        )}
      </header>

      <div
        className={styles.sectionTabs}
        role="tablist"
        aria-label="Employee management sections"
      >
        {sections.map((section) => (
          <button
            aria-controls="employee-section-panel"
            aria-selected={activeSection === section.id}
            className={`${styles.sectionTab} ${
              activeSection === section.id ? styles.activeSectionTab : ""
            }`}
            id={`employee-tab-${section.id}`}
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setMessage("");
            }}
            role="tab"
            type="button"
          >
            {section.label}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`employee-tab-${activeSection}`}
        className={styles.sectionPanel}
        id="employee-section-panel"
        role="tabpanel"
      >
        {activeSection === "directory" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>STAFF RECORDS</span>
                <h2>Employee directory</h2>
                <p>{employees.length} employee records</p>
              </div>
              <label className={styles.searchField}>
                <span>Search employees</span>
                <input
                  aria-label="Search employees"
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                  placeholder="Name, ID, role, or department"
                  value={employeeSearch}
                />
              </label>
            </div>

            {showEmployeeForm && (
              <form
                aria-label="Employee record form"
                className={styles.employeeForm}
                key={editingEmployeeId ?? "new-employee"}
                onSubmit={saveEmployee}
              >
                <h3>{selectedEmployee ? "Edit employee" : "Add employee"}</h3>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Full name</span>
                    <input
                      autoComplete="name"
                      defaultValue={selectedEmployee?.name ?? ""}
                      name="name"
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Role</span>
                    <input
                      defaultValue={selectedEmployee?.role ?? ""}
                      name="role"
                      placeholder="e.g. Registered Nurse"
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Department</span>
                    <input
                      defaultValue={selectedEmployee?.department ?? ""}
                      name="department"
                      placeholder="e.g. Nursing"
                      required
                    />
                  </label>
                  <div className={styles.field}>
                    <label htmlFor="employee-shift-assignment">
                      Shift assignment
                    </label>
                    <select
                      aria-describedby="shift-assignment-hint"
                      defaultValue={selectedEmployee?.shiftId ?? ""}
                      id="employee-shift-assignment"
                      name="shiftId"
                    >
                      <option value="">Unassigned</option>
                      {shifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.name} ({shift.startTime}–{shift.endTime})
                        </option>
                      ))}
                    </select>
                    <small id="shift-assignment-hint">
                      Create custom shifts in the Shifts section.
                    </small>
                  </div>
                  <label className={styles.field}>
                    <span>Email <small>(optional)</small></span>
                    <input
                      autoComplete="email"
                      defaultValue={selectedEmployee?.email ?? ""}
                      name="email"
                      type="email"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Mobile No <small>(optional)</small></span>
                    <input
                      autoComplete="tel"
                      defaultValue={selectedEmployee?.phone ?? ""}
                      name="phone"
                      type="tel"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Monthly salary <small>(local currency)</small></span>
                    <input
                      defaultValue={selectedEmployee?.monthlySalary ?? ""}
                      min="0.01"
                      name="monthlySalary"
                      placeholder="0.00"
                      required
                      step="0.01"
                      type="number"
                    />
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.primaryButton} type="submit">
                    {selectedEmployee ? "Save employee" : "Add employee"}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      setShowEmployeeForm(false);
                      setEditingEmployeeId(null);
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {message && <p className={styles.actionMessage} role="status">{message}</p>}

            <div className={styles.employeeList}>
              {filteredEmployees.length ? (
                filteredEmployees.map((employee) => (
                  <article
                    aria-labelledby={`${employee.id}-name`}
                    className={styles.employeeCard}
                    key={employee.id}
                  >
                    <span className={styles.employeeAvatar}>
                      {employee.name.slice(0, 1)}
                    </span>
                    <div className={styles.employeeDetails}>
                      <div className={styles.employeeNameRow}>
                        <strong id={`${employee.id}-name`}>{employee.name}</strong>
                        <span
                          className={`${styles.employeeStatus} ${
                            employee.active ? styles.activeStatus : styles.inactiveStatus
                          }`}
                        >
                          {employee.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <span>{employee.id} · {employee.role} · {employee.department}</span>
                      <span>
                        Shift assignment: {getShiftName(shifts, employee.shiftId)}
                      </span>
                      <span>
                        {[employee.email, employee.phone].filter(Boolean).join(" · ") ||
                          "No contact details"}
                      </span>
                      <span>Monthly salary: {formatAmount(employee.monthlySalary)}</span>
                    </div>
                    <div className={styles.employeeActions}>
                      <button
                        className={styles.textButton}
                        onClick={() => {
                          setEditingEmployeeId(employee.id);
                          setShowEmployeeForm(true);
                          setMessage("");
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className={styles.textButton}
                        onClick={() => toggleEmployeeStatus(employee.id)}
                        type="button"
                      >
                        {employee.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className={styles.emptyState}>No employees match this search.</p>
              )}
            </div>
          </>
        )}

        {activeSection === "shifts" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>ROSTER</span>
                <h2>Shift management</h2>
                <p>Create custom shifts and assign employees through the directory.</p>
              </div>
            </div>
            <form className={styles.inlineForm} onSubmit={addShift}>
              <label className={styles.field}>
                <span>Shift name</span>
                <input
                  name="name"
                  placeholder="e.g. Night coverage"
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Start time</span>
                <input name="startTime" required type="time" />
              </label>
              <label className={styles.field}>
                <span>End time</span>
                <input name="endTime" required type="time" />
              </label>
              <button className={styles.primaryButton} type="submit">
                Create custom shift
              </button>
            </form>
            {message && <p className={styles.actionMessage} role="status">{message}</p>}
            <div className={styles.recordList}>
              {shifts.length ? (
                shifts.map((shift) => {
                  const assignedEmployees = employees.filter(
                    (employee) => employee.shiftId === shift.id,
                  );
                  return (
                    <article className={styles.recordRow} key={shift.id}>
                      <div>
                        <strong>{shift.name}</strong>
                        <span>{shift.id} · {shift.startTime}–{shift.endTime}</span>
                      </div>
                      <span>
                        {assignedEmployees.length
                          ? assignedEmployees.map((employee) => employee.name).join(", ")
                          : "No employees assigned"}
                      </span>
                    </article>
                  );
                })
              ) : (
                <p className={styles.emptyState}>No custom shifts have been created.</p>
              )}
            </div>
          </>
        )}

        {activeSection === "attendance" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>
                  {attendanceView === "daily" ? "DAILY RECORD" : "MONTHLY RECORD"}
                </span>
                <h2>Employee attendance</h2>
                <p>
                  {attendanceView === "daily"
                    ? `Present ${dailyAttendanceCounts.present} · Absent ${dailyAttendanceCounts.absent} · Late ${dailyAttendanceCounts.late} · On leave ${dailyAttendanceCounts.onLeave}`
                    : `Present ${monthlyAttendanceCounts.present} · Absent ${monthlyAttendanceCounts.absent} · Late ${monthlyAttendanceCounts.late} · On leave ${monthlyAttendanceCounts.onLeave}`}
                </p>
              </div>
              <div className={styles.attendanceControls}>
                <div
                  className={styles.attendanceViewSwitch}
                  role="group"
                  aria-label="Attendance report view"
                >
                  <button
                    aria-pressed={attendanceView === "daily"}
                    className={attendanceView === "daily" ? styles.activeViewButton : ""}
                    onClick={() => setAttendanceView("daily")}
                    type="button"
                  >
                    Daily
                  </button>
                  <button
                    aria-pressed={attendanceView === "monthly"}
                    className={attendanceView === "monthly" ? styles.activeViewButton : ""}
                    onClick={() => setAttendanceView("monthly")}
                    type="button"
                  >
                    Monthly
                  </button>
                </div>
                {attendanceView === "daily" ? (
                  <label className={styles.dateField}>
                    <span>Attendance date</span>
                    <input
                      aria-label="Attendance date"
                      onChange={(event) => setAttendanceDate(event.target.value)}
                      type="date"
                      value={attendanceDate}
                    />
                  </label>
                ) : (
                  <label className={styles.dateField}>
                    <span>Attendance month</span>
                    <input
                      aria-label="Attendance month"
                      onChange={(event) => setAttendanceMonth(event.target.value)}
                      type="month"
                      value={attendanceMonth}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className={styles.attendanceReportArea}>
              <h2 className={styles.attendanceReportTitle}>
                {attendanceView === "daily"
                  ? `Daily attendance — ${formatDate(attendanceDate)}`
                  : `Monthly attendance — ${attendanceMonthLabel}`}
              </h2>
              {attendanceView === "daily" ? (
                <div className={styles.attendanceTableWrap}>
                  <table
                    aria-label="Daily attendance"
                    className={styles.attendanceTable}
                  >
                    <thead>
                      <tr>
                        <th scope="col">Employee</th>
                        <th scope="col">Employee ID</th>
                        <th scope="col">Department</th>
                        <th scope="col">Status</th>
                        <th scope="col">Late arrival time</th>
                        <th scope="col">Late entry details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEmployees.map((employee) => {
                        const record = attendance.find(
                          (current) =>
                            current.employeeId === employee.id &&
                            current.date === attendanceDate,
                        );
                        const isLate = record?.status === "Late entry";
                        return (
                          <tr key={employee.id}>
                            <th scope="row">{employee.name}</th>
                            <td>{employee.id}</td>
                            <td>{employee.department}</td>
                            <td>
                              <select
                                aria-label={`Attendance for ${employee.name}`}
                                className={styles.attendanceControl}
                                onChange={(event) =>
                                  setAttendanceStatus(employee.id, event.target.value)
                                }
                                value={record?.status ?? "Unmarked"}
                              >
                                <option>Unmarked</option>
                                <option>Present</option>
                                <option>Absent</option>
                                <option>Late entry</option>
                                <option>On leave</option>
                              </select>
                            </td>
                            <td>
                              {isLate ? (
                                <input
                                  aria-label={`Late arrival time for ${employee.name}`}
                                  className={styles.lateEntryControls}
                                  onChange={(event) =>
                                    setLateEntryField(
                                      employee.id,
                                      "lateArrivalTime",
                                      event.target.value,
                                    )
                                  }
                                  type="time"
                                  value={record.lateArrivalTime ?? ""}
                                />
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              {isLate ? (
                                <input
                                  aria-label={`Late entry details for ${employee.name}`}
                                  className={styles.lateEntryControls}
                                  onChange={(event) =>
                                    setLateEntryField(
                                      employee.id,
                                      "lateEntryDetails",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Reason or details"
                                  type="text"
                                  value={record.lateEntryDetails ?? ""}
                                />
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {!activeEmployees.length && (
                        <tr>
                          <td colSpan={6}>No active employees.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <p className={styles.attendanceLegend}>
                    P Present · A Absent · L Late entry · O On leave · — Unmarked
                  </p>
                  <div className={styles.attendanceTableWrap}>
                    <table
                      aria-label={`Monthly attendance for ${attendanceMonthLabel}`}
                      className={`${styles.attendanceTable} ${styles.attendanceMatrixTable}`}
                    >
                      <thead>
                        <tr>
                          <th scope="col">Employee</th>
                          {attendanceMonthDays.map((date) => (
                            <th key={date} scope="col" title={formatDate(date)}>
                              {Number(date.slice(-2))}
                            </th>
                          ))}
                          <th scope="col">P</th>
                          <th scope="col">A</th>
                          <th scope="col">L</th>
                          <th scope="col">O</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyAttendanceRows.map((row) => (
                          <tr key={row.employee.id}>
                            <th scope="row">
                              <strong>{row.employee.name}</strong>
                              <span>{row.employee.id}</span>
                            </th>
                            {row.records.map((record, index) => (
                              <td
                                key={attendanceMonthDays[index]}
                                title={record?.status ?? "Unmarked"}
                              >
                                {attendanceStatusCodes[record?.status ?? "Unmarked"]}
                              </td>
                            ))}
                            <td>{row.present}</td>
                            <td>{row.absent}</td>
                            <td>{row.late}</td>
                            <td>{row.onLeave}</td>
                          </tr>
                        ))}
                        {!monthlyAttendanceRows.length && (
                          <tr>
                            <td colSpan={attendanceMonthDays.length + 5}>
                              No active employees.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <h3 className={styles.lateEntriesTitle}>Late entry details</h3>
                  <div className={styles.attendanceTableWrap}>
                    <table
                      aria-label="Monthly late entry details"
                      className={styles.attendanceTable}
                    >
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Employee</th>
                          <th scope="col">Employee ID</th>
                          <th scope="col">Arrival time</th>
                          <th scope="col">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyLateEntries.map(({ employee, record }) => (
                          <tr key={`${employee.id}-${record.date}`}>
                            <td>{formatDate(record.date)}</td>
                            <th scope="row">{employee.name}</th>
                            <td>{employee.id}</td>
                            <td>{record.lateArrivalTime || "Not recorded"}</td>
                            <td>{record.lateEntryDetails || "No details entered"}</td>
                          </tr>
                        ))}
                        {!monthlyLateEntries.length && (
                          <tr>
                            <td colSpan={5}>No late entries recorded this month.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeSection === "reports" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>REPORTS</span>
                <h2>
                  {reportTypes.find((report) => report.id === reportType)?.label}
                </h2>
                <p>Choose a report type and period to review employee records.</p>
              </div>
              <div className={styles.reportControls}>
                <label className={styles.field}>
                  <span>Report type</span>
                  <select
                    aria-label="Report type"
                    onChange={(event) => {
                      const selected = reportTypes.find(
                        (report) => report.id === event.target.value,
                      );
                      if (selected) setReportType(selected.id);
                    }}
                    value={reportType}
                  >
                    {reportTypes.map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.label}
                      </option>
                    ))}
                  </select>
                </label>
                {["daily-attendance", "employees-on-leave", "absent-employees"].includes(
                  reportType,
                ) && (
                  <label className={styles.dateField}>
                    <span>Report date</span>
                    <input
                      aria-label="Report date"
                      onChange={(event) => setAttendanceDate(event.target.value)}
                      type="date"
                      value={attendanceDate}
                    />
                  </label>
                )}
                {reportType === "late-entries" && (
                  <label className={styles.dateField}>
                    <span>Report month</span>
                    <input
                      aria-label="Report month"
                      onChange={(event) => setAttendanceMonth(event.target.value)}
                      type="month"
                      value={attendanceMonth}
                    />
                  </label>
                )}
                {reportType === "monthly-payroll" && (
                  <label className={styles.dateField}>
                    <span>Payroll month</span>
                    <input
                      aria-label="Payroll month"
                      onChange={(event) => setPayrollMonth(event.target.value)}
                      type="month"
                      value={payrollMonth}
                    />
                  </label>
                )}
              </div>
            </div>

            {reportType === "employee-directory" && (
              <div className={styles.attendanceTableWrap}>
                <table
                  aria-label="Employee directory report"
                  className={styles.attendanceTable}
                >
                  <thead>
                    <tr>
                      <th scope="col">Employee ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Role</th>
                      <th scope="col">Department</th>
                      <th scope="col">Shift</th>
                      <th scope="col">Status</th>
                      <th scope="col">Email</th>
                      <th scope="col">Mobile</th>
                      <th scope="col">Monthly salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <th scope="row">{employee.name}</th>
                        <td>{employee.role}</td>
                        <td>{employee.department}</td>
                        <td>{getShiftName(shifts, employee.shiftId)}</td>
                        <td>{employee.active ? "Active" : "Inactive"}</td>
                        <td>{employee.email || "—"}</td>
                        <td>{employee.phone || "—"}</td>
                        <td>{formatAmount(employee.monthlySalary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "daily-attendance" && (
              <div className={styles.attendanceTableWrap}>
                <table
                  aria-label="Daily attendance report"
                  className={styles.attendanceTable}
                >
                  <thead>
                    <tr>
                      <th scope="col">Employee ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Department</th>
                      <th scope="col">Status</th>
                      <th scope="col">Late arrival time</th>
                      <th scope="col">Late entry details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyAttendanceRows.map(({ employee, record }) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <th scope="row">{employee.name}</th>
                        <td>{employee.department}</td>
                        <td>{record?.status ?? "Unmarked"}</td>
                        <td>{record?.lateArrivalTime || "—"}</td>
                        <td>{record?.lateEntryDetails || "—"}</td>
                      </tr>
                    ))}
                    {!dailyAttendanceRows.length && (
                      <tr>
                        <td colSpan={6}>No active employees.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "employees-on-leave" && (
              <div className={styles.attendanceTableWrap}>
                <table
                  aria-label="Employees on leave report"
                  className={styles.attendanceTable}
                >
                  <thead>
                    <tr>
                      <th scope="col">Employee ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Leave type</th>
                      <th scope="col">Status</th>
                      <th scope="col">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyLeaveRows.map(({ employee, leaveType, status, details }) => (
                      <tr key={`${employee.id}-${leaveType}-${status}`}>
                        <td>{employee.id}</td>
                        <th scope="row">{employee.name}</th>
                        <td>{leaveType}</td>
                        <td>{status}</td>
                        <td>{details}</td>
                      </tr>
                    ))}
                    {!dailyLeaveRows.length && (
                      <tr>
                        <td colSpan={5}>No employees are recorded on leave for this date.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "monthly-payroll" && (
              <>
                <p className={styles.reportDescription}>
                  Gross base payroll for {periodLabel}; active employees only.
                </p>
                <div className={styles.attendanceTableWrap}>
                  <table
                    aria-label="Monthly payroll report"
                    className={styles.attendanceTable}
                  >
                    <thead>
                      <tr>
                        <th scope="col">Employee ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Role</th>
                        <th scope="col">Department</th>
                        <th scope="col">Gross base salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.id}</td>
                          <th scope="row">{employee.name}</th>
                          <td>{employee.role}</td>
                          <td>{employee.department}</td>
                          <td>{formatAmount(employee.monthlySalary)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={4} scope="row">Estimated gross payroll</th>
                        <td>{formatAmount(monthlyPayroll)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {reportType === "late-entries" && (
              <div className={styles.attendanceTableWrap}>
                <table
                  aria-label="Late entry report"
                  className={styles.attendanceTable}
                >
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Employee ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Department</th>
                      <th scope="col">Arrival time</th>
                      <th scope="col">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyLateEntries.map(({ employee, record }) => (
                      <tr key={`${employee.id}-${record.date}`}>
                        <td>{formatDate(record.date)}</td>
                        <td>{employee.id}</td>
                        <th scope="row">{employee.name}</th>
                        <td>{employee.department}</td>
                        <td>{record.lateArrivalTime || "Not recorded"}</td>
                        <td>{record.lateEntryDetails || "No details entered"}</td>
                      </tr>
                    ))}
                    {!monthlyLateEntries.length && (
                      <tr>
                        <td colSpan={6}>No late entries recorded this month.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "absent-employees" && (
              <div className={styles.attendanceTableWrap}>
                <table
                  aria-label="Absent employees report"
                  className={styles.attendanceTable}
                >
                  <thead>
                    <tr>
                      <th scope="col">Employee ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Department</th>
                      <th scope="col">Assigned shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyAbsentRows.map(({ employee }) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <th scope="row">{employee.name}</th>
                        <td>{employee.department}</td>
                        <td>{getShiftName(shifts, employee.shiftId)}</td>
                      </tr>
                    ))}
                    {!dailyAbsentRows.length && (
                      <tr>
                        <td colSpan={4}>No employees marked absent for this date.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeSection === "staff-access" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>STAFF APP SECURITY</span>
                <h2>Staff access</h2>
                <p>Assign usernames, review first-login approvals, and reset passwords.</p>
              </div>
              <button
                className={styles.primaryButton}
                onClick={() => {
                  setShowStaffAccessForm((current) => !current);
                  setStaffAccessMessage("");
                  setResetPasswordFor(null);
                }}
                type="button"
              >
                {showStaffAccessForm ? "Close form" : "Assign staff access"}
              </button>
            </div>

            {staffAccessMessage && (
              <p className={styles.actionMessage} role="status">
                {staffAccessMessage}
              </p>
            )}

            {showStaffAccessForm && (
              <form
                aria-label="Initial staff access form"
                className={styles.employeeForm}
                onSubmit={createStaffAccessAccount}
              >
                <h3>Assign staff login</h3>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Employee</span>
                    <select defaultValue="" name="employeeId" required>
                      <option disabled value="">
                        Select an employee
                      </option>
                      {activeEmployees
                        .filter(
                          (employee) =>
                            !staffAccessAccounts.some(
                              (account) => account.employeeId === employee.id,
                            ),
                        )
                        .map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} · {employee.id}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>Username</span>
                    <input
                      autoComplete="username"
                      maxLength={30}
                      minLength={3}
                      name="username"
                      pattern="[A-Za-z0-9._-]+"
                      required
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Temporary password</span>
                    <input
                      autoComplete="new-password"
                      minLength={8}
                      name="password"
                      required
                      type="password"
                    />
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.primaryButton} type="submit">
                    Assign username and password
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => setShowStaffAccessForm(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.employeeList}>
              {staffAccessAccounts.map((account) => {
                const employee = employees.find(
                  (candidate) => candidate.id === account.employeeId,
                );
                const employeeActive = Boolean(employee?.active);
                return (
                  <article
                    aria-labelledby={`staff-access-${account.employeeId}`}
                    className={styles.employeeCard}
                    key={account.employeeId}
                  >
                    <span className={styles.employeeAvatar}>
                      {employee?.name.slice(0, 1) ?? "?"}
                    </span>
                    <div className={styles.employeeDetails}>
                      <div className={styles.employeeNameRow}>
                        <strong id={`staff-access-${account.employeeId}`}>
                          {employee?.name ?? account.employeeId}
                        </strong>
                        <span
                          className={`${styles.employeeStatus} ${
                            employeeActive
                              ? staffAccessStatusClasses[account.status]
                              : styles.inactiveStatus
                          }`}
                        >
                          {employeeActive ? account.status : "Employee inactive · access blocked"}
                        </span>
                      </div>
                      <span>{account.employeeId} · {employee?.department ?? "Unknown department"}</span>
                      <span>Username: {account.username}</span>
                      <span>
                        Password configured: {account.passwordConfigured ? "Yes" : "No"} ·
                        {" "}Owner resets: {account.passwordResetCount}
                      </span>
                    </div>
                    <div className={styles.employeeActions}>
                      {account.status === "Approval requested" && employeeActive && (
                        <button
                          className={styles.textButton}
                          onClick={() => approveFirstLogin(account.employeeId)}
                          type="button"
                        >
                          Approve first login
                        </button>
                      )}
                      {employeeActive && (
                        <button
                          aria-label={`Reset password for ${employee?.name ?? account.employeeId}`}
                          className={styles.textButton}
                          onClick={() => {
                            setResetPasswordFor(account.employeeId);
                            setStaffAccessMessage("");
                          }}
                          type="button"
                        >
                          Reset password
                        </button>
                      )}
                    </div>
                    {resetPasswordFor === account.employeeId && employeeActive && (
                      <form
                        aria-label={`Password reset form for ${employee?.name ?? account.employeeId}`}
                        className={styles.passwordResetForm}
                        onSubmit={(event) =>
                          resetStaffPassword(event, account.employeeId)
                        }
                      >
                        <label className={styles.field}>
                          <span>New temporary password</span>
                          <input
                            autoComplete="new-password"
                            minLength={8}
                            name="newPassword"
                            required
                            type="password"
                          />
                        </label>
                        <label className={styles.field}>
                          <span>Confirm new password</span>
                          <input
                            autoComplete="new-password"
                            minLength={8}
                            name="confirmPassword"
                            required
                            type="password"
                          />
                        </label>
                        <div className={styles.formActions}>
                          <button className={styles.primaryButton} type="submit">
                            Reset password
                          </button>
                          <button
                            className={styles.secondaryButton}
                            onClick={() => setResetPasswordFor(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                );
              })}
            </div>
            <p className={styles.previewNote}>
              Preview only: these records do not authenticate staff or store password values.
              A future staff app/backend must allow access only after the owner approves the
              first-login request; punch-in/out will be available only in that app. Password
              resets are owner-only here and require secure backend authentication to work
              operationally.
            </p>
          </>
        )}

        {activeSection === "leave" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>STAFF APP REQUESTS</span>
                <h2>Leave requests</h2>
                <p>Review and approve or decline submitted leave requests.</p>
              </div>
              <span className={styles.countBadge}>
                {leaveRequests.filter((request) => request.status === "Pending").length} pending
              </span>
            </div>
            {message && <p className={styles.actionMessage} role="status">{message}</p>}
            <div className={styles.recordList}>
              {leaveRequests.length ? (
                leaveRequests.map((request) => (
                  <article className={styles.leaveCard} key={request.id}>
                    <div className={styles.leaveHeader}>
                      <div>
                        <strong>{getEmployeeName(employees, request.employeeId)}</strong>
                        <span>{request.id} · {request.leaveType}</span>
                      </div>
                      <span
                        className={`${styles.leaveStatus} ${leaveStatusClasses[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p>{request.reason}</p>
                    <div className={styles.leaveFooter}>
                      <span>{formatLeavePeriod(request.startDate, request.endDate)}</span>
                      {request.status === "Pending" && (
                        <div className={styles.formActions}>
                          <button
                            className={styles.approveButton}
                            onClick={() => updateLeaveRequest(request.id, "Approved")}
                            type="button"
                          >
                            Approve
                          </button>
                          <button
                            className={styles.declineButton}
                            onClick={() => updateLeaveRequest(request.id, "Declined")}
                            type="button"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <p className={styles.emptyState}>No leave requests.</p>
              )}
            </div>
            <p className={styles.previewNote}>
              Sample requests only. Staff app submissions are not connected in this preview.
            </p>
          </>
        )}

        {activeSection === "payroll" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>SALARY CALCULATION</span>
                <h2>Monthly payroll</h2>
                <p>Gross base salary estimate for {periodLabel}.</p>
              </div>
              <label className={styles.dateField}>
                <span>Payroll month</span>
                <input
                  aria-label="Payroll month"
                  onChange={(event) => setPayrollMonth(event.target.value)}
                  type="month"
                  value={payrollMonth}
                />
              </label>
            </div>
            <div className={styles.payrollSummary}>
              <span>Estimated gross payroll</span>
              <strong>{formatAmount(monthlyPayroll)}</strong>
              <small>{activeEmployees.length} active employees · local currency</small>
            </div>
            <div className={styles.recordList}>
              {activeEmployees.map((employee) => (
                <article className={styles.recordRow} key={employee.id}>
                  <div>
                    <strong>{employee.name}</strong>
                    <span>{employee.id} · {employee.role} · {employee.department}</span>
                  </div>
                  <span>{formatAmount(employee.monthlySalary)}</span>
                </article>
              ))}
            </div>
            <p className={styles.previewNote}>
              Gross base salary only. Tax, deductions, overtime, attendance adjustments,
              and statutory rules are not included.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
