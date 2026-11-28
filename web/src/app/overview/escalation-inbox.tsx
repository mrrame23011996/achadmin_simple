"use client";

import { useMemo, useState, type FormEvent } from "react";
import styles from "./escalation-inbox.module.css";

type Seriousness = "Critical" | "High" | "Medium" | "Low";
type ResolutionStatus = "Due" | "Overdue" | "Completed";
type WorkOrigin = "Staff report" | "Owner assignment";

function isResolutionStatus(value: string): value is ResolutionStatus {
  return value === "Due" || value === "Overdue" || value === "Completed";
}

function isSeriousness(value: string): value is Seriousness {
  return (
    value === "Critical" ||
    value === "High" ||
    value === "Medium" ||
    value === "Low"
  );
}

function getDueStatus(
  dateValue: string,
): Exclude<ResolutionStatus, "Completed"> | null {
  const [year, month, day] = dateValue.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  if (
    !year ||
    !month ||
    !day ||
    dueDate.getFullYear() !== year ||
    dueDate.getMonth() !== month - 1 ||
    dueDate.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today ? "Overdue" : "Due";
}

function formatDueDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

type Escalation = {
  id: string;
  origin: WorkOrigin;
  title: string;
  description: string;
  department: string;
  location: string;
  reportedBy: string;
  reportedAt: string;
  dueAt: string;
  seriousness: Seriousness;
  status: ResolutionStatus;
  statusBeforeCompletion?: Exclude<ResolutionStatus, "Completed">;
  assignedStaffId?: string;
};

const staffDirectory = [
  { id: "staff-001", name: "Maya Chen", role: "Facilities" },
  { id: "staff-002", name: "Samir Patel", role: "Biomedical" },
  { id: "staff-003", name: "Lina Okafor", role: "Nursing" },
  { id: "staff-004", name: "Ben Carter", role: "Operations" },
];

const initialEscalations: Escalation[] = [
  {
    id: "ESC-1042",
    origin: "Staff report",
    title: "Oxygen outlet pressure fluctuating",
    description:
      "Pressure at two outlets in the east wing is inconsistent. Please inspect before the next shift.",
    department: "Biomedical",
    location: "East Wing · Ward 3",
    reportedBy: "Aisha Rahman · Nurse",
    reportedAt: "Today, 9:12 AM",
    dueAt: "Due yesterday",
    seriousness: "Critical",
    status: "Overdue",
  },
  {
    id: "ESC-1043",
    origin: "Staff report",
    title: "Water leak near the pharmacy store",
    description:
      "A slow leak has appeared under the wash basin. The floor is marked and needs maintenance.",
    department: "Pharmacy",
    location: "Ground Floor",
    reportedBy: "Daniel Kim · Pharmacist",
    reportedAt: "Today, 9:46 AM",
    dueAt: "Due today",
    seriousness: "High",
    status: "Due",
    assignedStaffId: "staff-001",
  },
  {
    id: "ESC-1041",
    origin: "Staff report",
    title: "Staff room air conditioning repaired",
    description:
      "The unit was serviced and cooling has returned to normal.",
    department: "Facilities",
    location: "Staff Room",
    reportedBy: "Noah Wilson · Administrator",
    reportedAt: "Yesterday, 2:20 PM",
    dueAt: "Completed yesterday",
    seriousness: "Low",
    status: "Completed",
    assignedStaffId: "staff-004",
  },
];

const statusClassNames: Record<ResolutionStatus, string> = {
  Due: styles.dueStatus,
  Overdue: styles.overdueStatus,
  Completed: styles.completedStatus,
};

const seriousnessClassNames: Record<Seriousness, string> = {
  Critical: styles.criticalSeriousness,
  High: styles.highSeriousness,
  Medium: styles.mediumSeriousness,
  Low: styles.lowSeriousness,
};

export default function EscalationInbox() {
  const [escalations, setEscalations] = useState(initialEscalations);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>({});
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResolutionStatus | "All">("All");
  const [seriousnessFilter, setSeriousnessFilter] = useState<Seriousness | "All">(
    "All",
  );
  const [message, setMessage] = useState("");
  const [nextWorkNumber, setNextWorkNumber] = useState(1);

  const filteredEscalations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return escalations.filter((escalation) => {
      const matchesSearch =
        !query ||
        [
          escalation.id,
          escalation.title,
          escalation.description,
          escalation.department,
          escalation.location,
          escalation.reportedBy,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "All" || escalation.status === statusFilter;
      const matchesSeriousness =
        seriousnessFilter === "All" ||
        escalation.seriousness === seriousnessFilter;
      return matchesSearch && matchesStatus && matchesSeriousness;
    });
  }, [escalations, search, seriousnessFilter, statusFilter]);

  const dueCount = escalations.filter((item) => item.status === "Due").length;
  const overdueCount = escalations.filter((item) => item.status === "Overdue").length;
  const completedCount = escalations.filter(
    (item) => item.status === "Completed",
  ).length;

  function createDirectWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const department = String(formData.get("department") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const seriousnessValue = String(formData.get("seriousness") ?? "");
    const dueDate = String(formData.get("dueDate") ?? "");
    const assignedStaffId = String(formData.get("assignedStaffId") ?? "");
    const assignedStaff = staffDirectory.find(
      (staff) => staff.id === assignedStaffId,
    );
    const status = getDueStatus(dueDate);

    if (
      !title ||
      !description ||
      !department ||
      !location ||
      !isSeriousness(seriousnessValue) ||
      !status ||
      !assignedStaff
    ) {
      setMessage("Complete all work details and choose a staff member.");
      return;
    }

    const workId = `WORK-${String(nextWorkNumber).padStart(4, "0")}`;
    setEscalations((current) => [
      {
        id: workId,
        origin: "Owner assignment",
        title,
        description,
        department,
        location,
        reportedBy: "Hospital owner",
        reportedAt: "Just now",
        dueAt: `Due ${formatDueDate(dueDate)}`,
        seriousness: seriousnessValue,
        status,
        assignedStaffId: assignedStaff.id,
      },
      ...current,
    ]);
    setNextWorkNumber((current) => current + 1);
    setAssignmentDrafts((current) => ({
      ...current,
      [workId]: assignedStaff.id,
    }));
    setSearch("");
    setStatusFilter("All");
    setSeriousnessFilter("All");
    setShowAssignmentForm(false);
    setMessage(
      `${workId} was created and assigned to ${assignedStaff.name}. Staff-app notifications are not connected in this preview.`,
    );
    form.reset();
  }

  function assignWork(escalation: Escalation) {
    const staffId =
      assignmentDrafts[escalation.id] ?? escalation.assignedStaffId ?? "";
    const assignee = staffDirectory.find((staff) => staff.id === staffId);
    if (!assignee) {
      setMessage("Select a staff member before assigning this escalation.");
      return;
    }

    setEscalations((current) =>
      current.map((item) =>
        item.id === escalation.id
          ? { ...item, assignedStaffId: assignee.id }
          : item,
      ),
    );
    setMessage(
      `${assignee.name} was assigned ${escalation.id}. Staff-app notifications are not connected in this preview.`,
    );
  }

  function updateStatus(escalation: Escalation) {
    const nextStatus: ResolutionStatus =
      escalation.status === "Completed"
        ? escalation.statusBeforeCompletion ?? "Due"
        : "Completed";
    const statusBeforeCompletion =
      escalation.status === "Completed" ? undefined : escalation.status;
    setEscalations((current) =>
      current.map((item) =>
        item.id === escalation.id
          ? {
              ...item,
              status: nextStatus,
              statusBeforeCompletion:
                nextStatus === "Completed"
                  ? statusBeforeCompletion
                  : undefined,
            }
          : item,
      ),
    );
    setMessage(
      `${escalation.id} marked ${nextStatus.toLowerCase()}.`,
    );
  }

  return (
    <div className={styles.inbox}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>STAFF-REPORTED ISSUES</span>
          <h1>Escalation inbox</h1>
          <p>
            Triage hospital problems, assign follow-up, and track each resolution.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.createWorkButton}
            onClick={() => {
              setShowAssignmentForm((current) => !current);
              setMessage("");
            }}
            type="button"
          >
            {showAssignmentForm ? "Cancel" : "Assign other work"}
          </button>
          <span className={styles.previewBadge}>PREVIEW</span>
        </div>
      </header>

      <section className={styles.summaryGrid} aria-label="Escalation summary">
        <article className={styles.summaryCard}>
          <span>Due</span>
          <strong>{dueCount}</strong>
          <small>Need follow-up</small>
        </article>
        <article className={`${styles.summaryCard} ${styles.overdueSummary}`}>
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
          <small>Past target date</small>
        </article>
        <article className={`${styles.summaryCard} ${styles.completedSummary}`}>
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <small>Resolved reports</small>
        </article>
      </section>

      <section className={styles.inboxPanel} aria-label="Escalation reports">
        {showAssignmentForm && (
          <section
            className={styles.assignmentPanel}
            aria-labelledby="direct-work-title"
          >
            <div className={styles.assignmentHeading}>
              <div>
                <span className={styles.sectionLabel}>OWNER-ASSIGNED WORK</span>
                <h2 id="direct-work-title">Create and assign work</h2>
                <p>
                  Assign a task directly without creating a staff-reported escalation.
                </p>
              </div>
            </div>
            <form className={styles.workForm} onSubmit={createDirectWork}>
              <label className={styles.workField}>
                <span>Work title</span>
                <input
                  autoComplete="off"
                  name="title"
                  placeholder="What needs to be done?"
                  required
                />
              </label>
              <label className={styles.workField}>
                <span>Work details</span>
                <textarea
                  name="description"
                  placeholder="Add instructions or context"
                  required
                  rows={3}
                />
              </label>
              <div className={styles.workFormRow}>
                <label className={styles.workField}>
                  <span>Department or team</span>
                  <input name="department" placeholder="e.g. Facilities" required />
                </label>
                <label className={styles.workField}>
                  <span>Location</span>
                  <input name="location" placeholder="e.g. East Wing" required />
                </label>
                <label className={styles.workField}>
                  <span>Seriousness</span>
                  <select defaultValue="Medium" name="seriousness" required>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>
                <label className={styles.workField}>
                  <span>Due date</span>
                  <input name="dueDate" required type="date" />
                </label>
                <label className={styles.workField}>
                  <span>Assign to staff</span>
                  <select
                    aria-label="Assign direct work to staff"
                    defaultValue=""
                    name="assignedStaffId"
                    required
                  >
                    <option disabled value="">
                      Select staff member
                    </option>
                    {staffDirectory.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} · {staff.role}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button className={styles.createWorkSubmit} type="submit">
                Create and assign work
              </button>
            </form>
          </section>
        )}

        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span>Search reports</span>
            <input
              aria-label="Search escalation reports"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, ID, reporter, or department"
              value={search}
            />
          </label>
          <label className={styles.filterField}>
            <span>Status</span>
            <select
              aria-label="Filter by status"
              onChange={(event) => {
                const value = event.target.value;
                setStatusFilter(
                  value === "All" || isResolutionStatus(value) ? value : "All",
                );
              }}
              value={statusFilter}
            >
              <option>All</option>
              <option>Due</option>
              <option>Overdue</option>
              <option>Completed</option>
            </select>
          </label>
          <label className={styles.filterField}>
            <span>Seriousness</span>
            <select
              aria-label="Filter by seriousness"
              onChange={(event) => {
                const value = event.target.value;
                setSeriousnessFilter(
                  value === "All" || isSeriousness(value) ? value : "All",
                );
              }}
              value={seriousnessFilter}
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
        </div>

        {message && (
          <p className={styles.actionMessage} role="status">
            {message}
          </p>
        )}

        <div className={styles.reportList}>
          {filteredEscalations.length ? (
            filteredEscalations.map((escalation) => {
              const assignedStaff = staffDirectory.find(
                (staff) => staff.id === escalation.assignedStaffId,
              );
              return (
                <article
                  aria-labelledby={`${escalation.id}-title`}
                  className={styles.reportCard}
                  key={escalation.id}
                >
                  <div className={styles.reportHeading}>
                    <div className={styles.reportTitle}>
                      <span className={styles.reportId}>{escalation.id}</span>
                      <h2 id={`${escalation.id}-title`}>{escalation.title}</h2>
                    </div>
                    <div className={styles.badges}>
                      <span
                        className={`${styles.seriousnessBadge} ${seriousnessClassNames[escalation.seriousness]}`}
                      >
                        {escalation.seriousness}
                      </span>
                      <span
                        className={`${styles.statusBadge} ${statusClassNames[escalation.status]}`}
                      >
                        {escalation.status}
                      </span>
                    </div>
                  </div>

                  <p className={styles.description}>{escalation.description}</p>

                  <div className={styles.reportDetails}>
                    <span>
                      <strong>Source</strong>
                      {escalation.origin === "Staff report"
                        ? "Staff report"
                        : "Owner-assigned work"}
                    </span>
                    <span>
                      <strong>
                        {escalation.origin === "Staff report"
                          ? "Reported by"
                          : "Assigned by"}
                      </strong>
                      {escalation.reportedBy}
                    </span>
                    <span><strong>Department</strong>{escalation.department}</span>
                    <span><strong>Location</strong>{escalation.location}</span>
                    <span>
                      <strong>
                        {escalation.origin === "Staff report" ? "Reported" : "Created"}
                      </strong>
                      {escalation.reportedAt}
                    </span>
                    <span><strong>Target</strong>{escalation.dueAt}</span>
                    <span>
                      <strong>Assigned to</strong>
                      {assignedStaff
                        ? `${assignedStaff.name} · ${assignedStaff.role}`
                        : "Unassigned"}
                    </span>
                  </div>

                  <div className={styles.reportActions}>
                    <label className={styles.assignField}>
                      <span>Assign to staff</span>
                      <select
                        aria-label={`Assign ${escalation.id} to staff`}
                        disabled={escalation.status === "Completed"}
                        onChange={(event) =>
                          setAssignmentDrafts((current) => ({
                            ...current,
                            [escalation.id]: event.target.value,
                          }))
                        }
                        value={
                          assignmentDrafts[escalation.id] ??
                          escalation.assignedStaffId ??
                          ""
                        }
                      >
                        <option value="">Select staff member</option>
                        {staffDirectory.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} · {staff.role}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className={styles.assignButton}
                      disabled={escalation.status === "Completed"}
                      onClick={() => assignWork(escalation)}
                      type="button"
                    >
                      {assignedStaff ? "Reassign work" : "Assign work"}
                    </button>
                    <button
                      className={styles.statusButton}
                      onClick={() => updateStatus(escalation)}
                      type="button"
                    >
                      {escalation.status === "Completed"
                        ? "Reopen"
                        : "Mark completed"}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <p className={styles.emptyState}>
              No escalation reports match these filters.
            </p>
          )}
        </div>
      </section>

      <p className={styles.previewNote}>
        Sample reports and assignments are local preview data. Staff-app submissions
        and notifications require a shared backend and notification integration.
      </p>
    </div>
  );
}
