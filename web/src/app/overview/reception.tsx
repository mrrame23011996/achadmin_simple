"use client";

import { useMemo, useState, type FormEvent } from "react";
import styles from "./reception.module.css";

type PatientDetails = {
  name: string;
  age: number;
  gender: string;
  address: string;
  phone: string;
};

type OpdPatient = PatientDetails & {
  id: string;
};

type Admission = PatientDetails & {
  id: string;
  opdId?: string;
  prefix?: string;
  source: "OPD" | "Direct" | "Emergency";
  admittedAt: string;
  admissionDate?: string;
  admissionTime?: string;
  referringDoctor?: string;
  ward?: string;
  bedNo?: string;
  attenderName?: string;
  attenderRelation?: string;
  attenderMobile?: string;
  attenderAddress?: string;
};

type Discharge = Admission & {
  dischargedAt: string;
};

type Department = "OPD" | "IPD";

type Bill = {
  id: string;
  department: Department;
  patientId: string;
  patientName: string;
  service: string;
  amount: number;
  paid: boolean;
};

type AdvanceCollection = {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  collectedAt: string;
};

type PatientOption = {
  id: string;
  name: string;
};

const initialOpdPatients: OpdPatient[] = [
  {
    id: "OPD-1041",
    name: "Demo Patient A",
    age: 34,
    gender: "Female",
    address: "Demo address 1",
    phone: "555-0101",
  },
  {
    id: "OPD-1042",
    name: "Demo Patient B",
    age: 46,
    gender: "Male",
    address: "Demo address 2",
    phone: "555-0102",
  },
  {
    id: "OPD-1043",
    name: "Demo Patient C",
    age: 28,
    gender: "Other",
    address: "Demo address 3",
    phone: "555-0103",
  },
];

const initialAdmissions: Admission[] = [
  {
    id: "IPD-2034",
    opdId: "OPD-1038",
    name: "Demo Patient D",
    age: 51,
    gender: "Female",
    address: "Demo address 4",
    phone: "555-0104",
    source: "OPD",
    admittedAt: "Today, 9:15 AM",
  },
  {
    id: "IPD-2035",
    name: "Demo Patient E",
    age: 39,
    gender: "Male",
    address: "Demo address 5",
    phone: "555-0105",
    source: "Emergency",
    admittedAt: "Today, 10:40 AM",
  },
];

const initialDischarges: Discharge[] = [
  {
    id: "IPD-2029",
    opdId: "OPD-1031",
    name: "Demo Patient F",
    age: 63,
    gender: "Female",
    address: "Demo address 6",
    phone: "555-0106",
    source: "OPD",
    admittedAt: "Nov 25, 2026",
    dischargedAt: "Nov 27, 2026",
  },
];

function readPatientDetails(form: HTMLFormElement): PatientDetails | null {
  const formData = new FormData(form);
  const name = String(formData.get("patientName") ?? "").trim();
  const ageValue = String(formData.get("age") ?? "").trim();
  const age = Number(ageValue);
  const gender = String(formData.get("gender") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (
    !name ||
    !ageValue ||
    !Number.isInteger(age) ||
    age < 0 ||
    age > 125 ||
    !gender ||
    !address
  ) {
    return null;
  }

  return { name, age, gender, address, phone };
}

function readIpdRegistrationDetails(
  form: HTMLFormElement,
): Omit<Admission, "id" | "source" | "admittedAt"> | null {
  const formData = new FormData(form);
  const prefix = String(formData.get("prefix") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const ageValue = String(formData.get("age") ?? "").trim();
  const age = Number(ageValue);
  const gender = String(formData.get("gender") ?? "").trim();
  const admissionDate = String(formData.get("admissionDate") ?? "").trim();
  const admissionTime = String(formData.get("admissionTime") ?? "").trim();
  const referringDoctor = String(formData.get("referringDoctor") ?? "").trim();
  const ward = String(formData.get("ward") ?? "").trim();
  const bedNo = String(formData.get("bedNo") ?? "").trim();
  const attenderName = String(formData.get("attenderName") ?? "").trim();
  const attenderRelation = String(formData.get("attenderRelation") ?? "").trim();
  const attenderMobile = String(formData.get("attenderMobile") ?? "").trim();
  const attenderAddress = String(formData.get("attenderAddress") ?? "").trim();

  if (
    !fullName ||
    !ageValue ||
    !Number.isInteger(age) ||
    age < 0 ||
    age > 125 ||
    !gender ||
    !admissionDate ||
    !admissionTime ||
    !ward ||
    !attenderName ||
    !attenderRelation ||
    !attenderMobile ||
    !attenderAddress
  ) {
    return null;
  }

  return {
    name: [prefix, fullName].filter(Boolean).join(" "),
    age,
    gender,
    address: attenderAddress,
    phone: attenderMobile,
    prefix,
    admissionDate,
    admissionTime,
    referringDoctor,
    ward,
    bedNo,
    attenderName,
    attenderRelation,
    attenderMobile,
    attenderAddress,
  };
}

function matchesIpdRecord(patient: Admission, query: string) {
  return [
    patient.name,
    patient.id,
    patient.phone,
    patient.opdId,
    patient.ward,
    patient.bedNo,
    patient.attenderName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function PatientRegistrationForm({
  onSubmit,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className={styles.registrationForm} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span>Patient name</span>
        <input
          autoComplete="name"
          name="patientName"
          placeholder="Enter full name"
          required
        />
      </label>
      <div className={styles.formRow}>
        <label className={styles.field}>
          <span>Age</span>
          <input
            max="125"
            min="0"
            name="age"
            placeholder="Age in years"
            required
            step="1"
            type="number"
          />
        </label>
        <label className={styles.field}>
          <span>Gender</span>
          <select defaultValue="" name="gender" required>
            <option disabled value="">
              Select gender
            </option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </label>
      </div>
      <label className={styles.field}>
        <span>Address</span>
        <textarea
          autoComplete="street-address"
          name="address"
          placeholder="Enter residential address"
          required
          rows={3}
        />
      </label>
      <label className={styles.field}>
        <span>Phone number <small>(optional)</small></span>
        <input
          autoComplete="tel"
          name="phone"
          placeholder="Enter phone number"
          type="tel"
        />
      </label>

      <button className={styles.registerButton} type="submit">
        Register OPD patient
      </button>
    </form>
  );
}

function IpdRegistrationForm({
  emergency,
  onEmergencyChange,
  onSubmit,
}: {
  emergency: boolean;
  onEmergencyChange: (checked: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className={styles.registrationForm} onSubmit={onSubmit}>
      <div className={styles.nameFormRow}>
        <label className={styles.field}>
          <span>Prefix</span>
          <select defaultValue="" name="prefix">
            <option value="">None</option>
            <option>Dr</option>
            <option>Master</option>
            <option>Miss</option>
            <option>Mr</option>
            <option>Mrs</option>
            <option>Ms</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Full Name</span>
          <input
            autoComplete="name"
            name="fullName"
            placeholder="Enter full name"
            required
          />
        </label>
      </div>

      <div className={styles.formRow}>
        <label className={styles.field}>
          <span>Gender</span>
          <select defaultValue="" name="gender" required>
            <option disabled value="">
              Select gender
            </option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Age</span>
          <input
            max="125"
            min="0"
            name="age"
            placeholder="Age in years"
            required
            step="1"
            type="number"
          />
        </label>
      </div>

      <div className={styles.formRow}>
        <label className={styles.field}>
          <span>Admission Date</span>
          <input name="admissionDate" required type="date" />
        </label>
        <label className={styles.field}>
          <span>Admission Time</span>
          <input name="admissionTime" required type="time" />
        </label>
      </div>

      <label className={styles.field}>
        <span>Ref. Doctor</span>
        <input
          autoComplete="name"
          name="referringDoctor"
          placeholder="Enter referring doctor"
        />
      </label>

      <div className={styles.formRow}>
        <label className={styles.field}>
          <span>Ward</span>
          <input name="ward" placeholder="Enter ward" required />
        </label>
        <label className={styles.field}>
          <span>Bed No</span>
          <input name="bedNo" placeholder="Enter bed number" />
        </label>
      </div>

      <fieldset className={styles.attenderDetails}>
        <legend>Attender Details</legend>
        <div className={styles.registrationForm}>
          <label className={styles.field}>
            <span>Attender Name</span>
            <input name="attenderName" placeholder="Enter attender name" required />
          </label>
          <div className={styles.formRow}>
            <label className={styles.field}>
              <span>Relation</span>
              <input name="attenderRelation" placeholder="Relation to patient" required />
            </label>
            <label className={styles.field}>
              <span>Mobile No</span>
              <input
                autoComplete="tel"
                name="attenderMobile"
                placeholder="Enter mobile number"
                required
                type="tel"
              />
            </label>
          </div>
          <label className={styles.field}>
            <span>Address</span>
            <textarea
              autoComplete="street-address"
              name="attenderAddress"
              placeholder="Enter attender address"
              required
              rows={3}
            />
          </label>
        </div>
      </fieldset>

      <label className={styles.emergencyToggle}>
        <input
          checked={emergency}
          onChange={(event) => onEmergencyChange(event.target.checked)}
          type="checkbox"
        />
        <span className={styles.checkboxMark} aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="m3 8 3.2 3.2L13 4.5" />
          </svg>
        </span>
        <span>
          <strong>Emergency admission</strong>
          <small>Mark this direct IPD registration as an emergency.</small>
        </span>
      </label>

      <button className={styles.registerButton} type="submit">
        Register IPD patient
      </button>
    </form>
  );
}

function BillingPanel({
  department,
  patients,
  bills,
  advances,
  onCreateBill,
  onMarkPaid,
  onCollectAdvance,
}: {
  department: Department;
  patients: PatientOption[];
  bills: Bill[];
  advances: AdvanceCollection[];
  onCreateBill: (
    department: Department,
    patientId: string,
    service: string,
    amount: number,
  ) => string;
  onMarkPaid: (billId: string) => void;
  onCollectAdvance: (patientId: string, amount: number) => string;
}) {
  const [message, setMessage] = useState("");
  const totalAdvance = advances.reduce((total, advance) => total + advance.amount, 0);

  function createBill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const patientId = String(formData.get("patientId") ?? "");
    const service = String(formData.get("service") ?? "").trim();
    const amountValue = String(formData.get("amount") ?? "").trim();
    const amount = Number(amountValue);

    if (!patientId || !service || !amountValue || !Number.isFinite(amount) || amount <= 0) {
      setMessage("Choose a patient and enter a service and amount greater than zero.");
      return;
    }

    const billId = onCreateBill(department, patientId, service, amount);
    setMessage(`${billId} was created and is pending payment.`);
    form.reset();
  }

  function collectAdvance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const patientId = String(formData.get("advancePatientId") ?? "");
    const amountValue = String(formData.get("advanceAmount") ?? "").trim();
    const amount = Number(amountValue);

    if (!patientId || !amountValue || !Number.isFinite(amount) || amount <= 0) {
      setMessage("Choose an IPD patient and enter an advance greater than zero.");
      return;
    }

    const advanceId = onCollectAdvance(patientId, amount);
    setMessage(`${advanceId} was recorded as an advance collected.`);
    form.reset();
  }

  return (
    <section className={styles.panel} aria-labelledby={`${department.toLowerCase()}-billing-title`}>
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.sectionLabel}>{department} BILLING</span>
          <h2 id={`${department.toLowerCase()}-billing-title`}>Create and track bills</h2>
        </div>
        <span className={styles.countBadge}>{bills.length} bills</span>
      </div>

      <form className={styles.billingForm} onSubmit={createBill}>
        <label className={styles.field}>
          <span>Patient</span>
          <select defaultValue="" name="patientId" required>
            <option disabled value="">
              Select a {department} patient
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} · {patient.id}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Service or charge</span>
          <input
            name="service"
            placeholder={department === "OPD" ? "Consultation" : "Room or treatment charge"}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Amount <small>(local currency)</small></span>
          <input
            min="0.01"
            name="amount"
            placeholder="0.00"
            required
            step="0.01"
            type="number"
          />
        </label>
        <button className={styles.registerButton} disabled={!patients.length} type="submit">
          Create {department} bill
        </button>
      </form>

      {message && (
        <p className={styles.actionMessage} role="status">
          {message}
        </p>
      )}

      <div className={styles.billList}>
        {bills.length ? (
          bills.map((bill) => (
            <article className={styles.billRow} key={bill.id}>
              <span className={styles.billIdentity}>
                <strong>{bill.patientName}</strong>
                <small>{bill.id} · {bill.patientId} · {bill.service}</small>
              </span>
              <span className={styles.billAmount}>{bill.amount.toFixed(2)}</span>
              {bill.paid ? (
                <span className={`${styles.billStatus} ${styles.paidStatus}`}>Paid</span>
              ) : (
                <button
                  className={styles.textButton}
                  onClick={() => onMarkPaid(bill.id)}
                  type="button"
                >
                  Mark paid
                </button>
              )}
            </article>
          ))
        ) : (
          <p className={styles.emptyState}>No {department} bills yet.</p>
        )}
      </div>

      {department === "IPD" && (
        <section className={styles.advanceSection} aria-labelledby="ipd-advance-title">
          <div className={styles.advanceHeading}>
            <div>
              <span className={styles.sectionLabel}>IPD ADVANCES</span>
              <h3 id="ipd-advance-title">Collect patient advance</h3>
            </div>
            <span className={styles.countBadge}>{advances.length} collected</span>
          </div>
          <form className={styles.billingForm} onSubmit={collectAdvance}>
            <label className={styles.field}>
              <span>Advance patient</span>
              <select defaultValue="" name="advancePatientId" required>
                <option disabled value="">
                  Select an IPD patient
                </option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} · {patient.id}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Advance amount collected <small>(local currency)</small></span>
              <input
                min="0.01"
                name="advanceAmount"
                placeholder="0.00"
                required
                step="0.01"
                type="number"
              />
            </label>
            <button
              className={styles.registerButton}
              disabled={!patients.length}
              type="submit"
            >
              Record IPD advance
            </button>
          </form>

          <div className={styles.advanceSummary}>
            <span>Total advance collected</span>
            <strong>{totalAdvance.toFixed(2)}</strong>
          </div>
          <div className={styles.billList}>
            {advances.length ? (
              advances.map((advance) => (
                <article className={styles.billRow} key={advance.id}>
                  <span className={styles.billIdentity}>
                    <strong>{advance.patientName}</strong>
                    <small>
                      {advance.id} · {advance.patientId} · {advance.collectedAt}
                    </small>
                  </span>
                  <span className={styles.billAmount}>{advance.amount.toFixed(2)}</span>
                  <span className={`${styles.billStatus} ${styles.paidStatus}`}>
                    Collected
                  </span>
                </article>
              ))
            ) : (
              <p className={styles.emptyState}>No IPD advances collected yet.</p>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

export default function ReceptionDesk() {
  const [activeDepartment, setActiveDepartment] = useState<Department>("OPD");
  const [opdPatients, setOpdPatients] = useState(initialOpdPatients);
  const [admissions, setAdmissions] = useState(initialAdmissions);
  const [discharges, setDischarges] = useState(initialDischarges);
  const [opdSearch, setOpdSearch] = useState("");
  const [admissionsSearch, setAdmissionsSearch] = useState("");
  const [dischargesSearch, setDischargesSearch] = useState("");
  const [emergencyDirectIpd, setEmergencyDirectIpd] = useState(false);
  const [message, setMessage] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [advances, setAdvances] = useState<AdvanceCollection[]>([]);
  const [nextOpdNumber, setNextOpdNumber] = useState(1044);
  const [nextIpdNumber, setNextIpdNumber] = useState(2036);
  const [nextBillNumber, setNextBillNumber] = useState(1);
  const [nextAdvanceNumber, setNextAdvanceNumber] = useState(1);

  const opdSearchResults = useMemo(() => {
    const query = opdSearch.trim().toLowerCase();
    if (!query) return opdPatients;
    return opdPatients.filter((patient) =>
      `${patient.name} ${patient.id} ${patient.phone}`.toLowerCase().includes(query),
    );
  }, [opdPatients, opdSearch]);

  const currentAdmissionResults = useMemo(() => {
    const query = admissionsSearch.trim().toLowerCase();
    return admissions.filter((patient) => matchesIpdRecord(patient, query));
  }, [admissions, admissionsSearch]);

  const dischargeResults = useMemo(() => {
    const query = dischargesSearch.trim().toLowerCase();
    return discharges.filter((patient) => matchesIpdRecord(patient, query));
  }, [discharges, dischargesSearch]);

  const opdPatientOptions = useMemo(
    () => opdPatients.map(({ id, name }) => ({ id, name })),
    [opdPatients],
  );
  const ipdPatientOptions = useMemo(
    () => [...admissions, ...discharges].map(({ id, name }) => ({ id, name })),
    [admissions, discharges],
  );
  const opdBills = useMemo(
    () => bills.filter((bill) => bill.department === "OPD"),
    [bills],
  );
  const ipdBills = useMemo(
    () => bills.filter((bill) => bill.department === "IPD"),
    [bills],
  );

  function registerOpdPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const patientDetails = readPatientDetails(form);

    if (!patientDetails) {
      setMessage("Complete the required patient details to continue.");
      return;
    }

    const patient: OpdPatient = {
      id: `OPD-${nextOpdNumber}`,
      ...patientDetails,
    };
    setOpdPatients((current) => [patient, ...current]);
    setNextOpdNumber((current) => current + 1);
    setMessage(`${patient.name} was registered for OPD as ${patient.id}.`);
    form.reset();
  }

  function registerIpdPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const patientDetails = readIpdRegistrationDetails(form);

    if (!patientDetails) {
      setMessage("Complete the required patient details to continue.");
      return;
    }

    const admission: Admission = {
      id: `IPD-${nextIpdNumber}`,
      ...patientDetails,
      source: emergencyDirectIpd ? "Emergency" : "Direct",
      admittedAt: `${patientDetails.admissionDate} ${patientDetails.admissionTime}`,
    };
    setAdmissions((current) => [admission, ...current]);
    setNextIpdNumber((current) => current + 1);
    setMessage(`${admission.name} was registered for IPD as ${admission.id}.`);
    setEmergencyDirectIpd(false);
    form.reset();
  }

  function admitFromOpd(patient: OpdPatient) {
    const { id: opdId, ...patientDetails } = patient;
    const admission: Admission = {
      id: `IPD-${nextIpdNumber}`,
      opdId,
      ...patientDetails,
      source: "OPD",
      admittedAt: "Just now",
    };
    setAdmissions((current) => [admission, ...current]);
    setNextIpdNumber((current) => current + 1);
    setMessage(`${patient.name} was admitted from OPD.`);
  }

  function dischargePatient(admission: Admission) {
    setAdmissions((current) =>
      current.filter((patient) => patient.id !== admission.id),
    );
    setDischarges((current) => [
      { ...admission, dischargedAt: "Just now" },
      ...current,
    ]);
    setMessage(`${admission.name} was moved to discharge history.`);
  }

  function createBill(
    department: Department,
    patientId: string,
    service: string,
    amount: number,
  ) {
    const patients = department === "OPD" ? opdPatientOptions : ipdPatientOptions;
    const patient = patients.find((current) => current.id === patientId);
    if (!patient) {
      throw new Error(`Cannot create a ${department} bill for an unknown patient.`);
    }

    const billId = `BILL-${String(nextBillNumber).padStart(4, "0")}`;
    setBills((current) => [
      {
        id: billId,
        department,
        patientId,
        patientName: patient.name,
        service,
        amount,
        paid: false,
      },
      ...current,
    ]);
    setNextBillNumber((current) => current + 1);
    return billId;
  }

  function collectAdvance(patientId: string, amount: number) {
    const patient = ipdPatientOptions.find((current) => current.id === patientId);
    if (!patient) {
      throw new Error(`Cannot record an IPD advance for an unknown patient.`);
    }

    const advanceId = `ADV-${String(nextAdvanceNumber).padStart(4, "0")}`;
    setAdvances((current) => [
      {
        id: advanceId,
        patientId,
        patientName: patient.name,
        amount,
        collectedAt: "Just now",
      },
      ...current,
    ]);
    setNextAdvanceNumber((current) => current + 1);
    return advanceId;
  }

  function markBillPaid(billId: string) {
    setBills((current) =>
      current.map((bill) => (bill.id === billId ? { ...bill, paid: true } : bill)),
    );
  }

  return (
    <div className={styles.reception}>
      <header className={styles.receptionHeader}>
        <div>
          <span className={styles.eyebrow}>RECEPTION</span>
          <h1>Patient reception</h1>
          <p>Register and find patients, manage admissions, and create bills.</p>
        </div>
        <span className={styles.previewLabel}>SESSION PREVIEW</span>
      </header>

      <div className={styles.workflowTabs} role="group" aria-label="Patient workflow">
        {(["OPD", "IPD"] as const).map((department) => (
          <button
            aria-pressed={activeDepartment === department}
            className={`${styles.workflowTab} ${
              activeDepartment === department ? styles.activeWorkflowTab : ""
            }`}
            key={department}
            onClick={() => {
              setActiveDepartment(department);
              setMessage("");
            }}
            type="button"
          >
            {department} {department === "OPD" ? "Outpatient" : "Inpatient"}
          </button>
        ))}
      </div>

      {activeDepartment === "OPD" ? (
        <>
          <div className={styles.workflowGrid}>
            <div className={styles.workflowColumn}>
              <section className={styles.panel} aria-labelledby="opd-register-title">
                <div className={styles.panelHeading}>
                  <div>
                    <span className={styles.sectionLabel}>OPD REGISTRATION</span>
                    <h2 id="opd-register-title">Register OPD patient</h2>
                  </div>
                </div>
                <p className={styles.registrationRule}>
                  Register an outpatient visit and create an OPD patient record.
                </p>
                <PatientRegistrationForm
                  onSubmit={registerOpdPatient}
                />
                {message && (
                  <p className={styles.actionMessage} role="status">{message}</p>
                )}
              </section>
              <BillingPanel
                advances={advances}
                bills={opdBills}
                department="OPD"
                onCollectAdvance={collectAdvance}
                onCreateBill={createBill}
                onMarkPaid={markBillPaid}
                patients={opdPatientOptions}
              />
            </div>

            <section className={styles.panel} aria-labelledby="opd-search-title">
              <div className={styles.panelHeading}>
                <div>
                  <span className={styles.sectionLabel}>OPD RECORDS</span>
                  <h2 id="opd-search-title">Search OPD patients</h2>
                </div>
                <span className={styles.countBadge}>{opdPatients.length} records</span>
              </div>
              <label className={styles.searchBox}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="8.7" cy="8.7" r="5.7" />
                  <path d="m13 13 4.5 4.5" />
                </svg>
                <input
                  aria-label="Search OPD patients"
                  onChange={(event) => setOpdSearch(event.target.value)}
                  placeholder="Search by name, OPD ID, or phone"
                  value={opdSearch}
                />
              </label>

              <div className={styles.patientList}>
                {opdSearchResults.length ? (
                  opdSearchResults.map((patient) => {
                    const admission = admissions.find(
                      (current) => current.opdId === patient.id,
                    );
                    return (
                      <article className={styles.patientRow} key={patient.id}>
                        <span className={styles.patientAvatar}>
                          {patient.name.slice(0, 1)}
                        </span>
                        <span className={styles.patientIdentity}>
                          <strong>{patient.name}</strong>
                          <small>
                            {patient.id} · {patient.age} · {patient.gender}
                            {patient.phone ? ` · ${patient.phone}` : ""}
                          </small>
                        </span>
                        <button
                          className={styles.admitButton}
                          disabled={Boolean(admission)}
                          onClick={() => admitFromOpd(patient)}
                          type="button"
                        >
                          {admission ? "Admitted" : "Admit to IPD"}
                        </button>
                      </article>
                    );
                  })
                ) : (
                  <p className={styles.emptyState}>
                    No OPD patients match this search.
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className={styles.workflowGrid}>
            <div className={styles.workflowColumn}>
              <section className={styles.panel} aria-labelledby="ipd-register-title">
                <div className={styles.panelHeading}>
                  <div>
                    <span className={styles.sectionLabel}>IPD REGISTRATION</span>
                    <h2 id="ipd-register-title">Register IPD patient</h2>
                  </div>
                </div>
                <p className={styles.registrationRule}>
                  Register a direct inpatient admission. Admit existing OPD patients from OPD search.
                </p>
                <IpdRegistrationForm
                  emergency={emergencyDirectIpd}
                  onEmergencyChange={(checked) => {
                    setEmergencyDirectIpd(checked);
                    setMessage("");
                  }}
                  onSubmit={registerIpdPatient}
                />
                {message && (
                  <p className={styles.actionMessage} role="status">{message}</p>
                )}
              </section>
              <BillingPanel
                advances={advances}
                bills={ipdBills}
                department="IPD"
                onCollectAdvance={collectAdvance}
                onCreateBill={createBill}
                onMarkPaid={markBillPaid}
                patients={ipdPatientOptions}
              />
            </div>

            <div className={styles.workflowColumn}>
              <section className={styles.panel} aria-labelledby="current-admissions-title">
                <div className={styles.panelHeading}>
                  <div>
                    <span className={styles.sectionLabel}>INPATIENT</span>
                    <h2 id="current-admissions-title">Current admissions</h2>
                  </div>
                  <span className={styles.countBadge}>{admissions.length}</span>
                </div>
                <label className={styles.searchBox}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="8.7" cy="8.7" r="5.7" />
                    <path d="m13 13 4.5 4.5" />
                  </svg>
                  <input
                    aria-label="Search current admissions"
                    onChange={(event) => setAdmissionsSearch(event.target.value)}
                    placeholder="Search by name, IPD ID, phone, ward, or bed"
                    value={admissionsSearch}
                  />
                </label>
                <div className={styles.recordList}>
                  {currentAdmissionResults.length ? (
                    currentAdmissionResults.map((admission) => (
                      <article className={styles.recordRow} key={admission.id}>
                        <span className={styles.patientAvatar}>
                          {admission.name.slice(0, 1)}
                        </span>
                        <span className={styles.recordIdentity}>
                          <strong>{admission.name}</strong>
                          <small>
                            {admission.id} · {admission.source}
                            {admission.opdId ? ` · ${admission.opdId}` : ""}
                            {` · ${admission.age} · ${admission.gender}`}
                          </small>
                          {(admission.ward || admission.bedNo) && (
                            <small>
                              {admission.ward ?? ""}
                              {admission.bedNo ? ` · Bed ${admission.bedNo}` : ""}
                            </small>
                          )}
                          {(admission.referringDoctor || admission.attenderName) && (
                            <small>
                              {admission.referringDoctor
                                ? `Ref. Doctor: ${admission.referringDoctor}`
                                : ""}
                              {admission.referringDoctor && admission.attenderName
                                ? " · "
                                : ""}
                              {admission.attenderName
                                ? `Attender: ${admission.attenderName}${admission.attenderRelation ? ` · ${admission.attenderRelation}` : ""}${admission.attenderMobile ? ` · ${admission.attenderMobile}` : ""}${admission.attenderAddress ? ` · ${admission.attenderAddress}` : ""}`
                                : ""}
                            </small>
                          )}
                        </span>
                        <span className={styles.recordDate}>{admission.admittedAt}</span>
                        <button
                          className={styles.textButton}
                          onClick={() => dischargePatient(admission)}
                          type="button"
                        >
                          Discharge
                        </button>
                      </article>
                    ))
                  ) : (
                    <p className={styles.emptyState}>
                      {admissions.length
                        ? "No current admissions match this search."
                        : "No current admissions."}
                    </p>
                  )}
                </div>
              </section>

              <section className={styles.panel} aria-labelledby="discharge-history-title">
                <div className={styles.panelHeading}>
                  <div>
                    <span className={styles.sectionLabel}>RECENT RECORDS</span>
                    <h2 id="discharge-history-title">Discharge history</h2>
                  </div>
                  <span className={styles.countBadge}>{discharges.length}</span>
                </div>
                <label className={styles.searchBox}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="8.7" cy="8.7" r="5.7" />
                    <path d="m13 13 4.5 4.5" />
                  </svg>
                  <input
                    aria-label="Search discharge history"
                    onChange={(event) => setDischargesSearch(event.target.value)}
                    placeholder="Search by name, IPD ID, phone, ward, or bed"
                    value={dischargesSearch}
                  />
                </label>
                <div className={styles.recordList}>
                  {dischargeResults.length ? (
                    dischargeResults.map((discharge) => (
                      <article className={styles.recordRow} key={discharge.id}>
                        <span className={styles.patientAvatar}>
                          {discharge.name.slice(0, 1)}
                        </span>
                        <span className={styles.recordIdentity}>
                          <strong>{discharge.name}</strong>
                          <small>
                            {discharge.id} · {discharge.source}
                            {discharge.opdId ? ` · ${discharge.opdId}` : ""}
                          </small>
                          {(discharge.ward || discharge.bedNo) && (
                            <small>
                              {discharge.ward ?? ""}
                              {discharge.bedNo ? ` · Bed ${discharge.bedNo}` : ""}
                            </small>
                          )}
                          {(discharge.referringDoctor || discharge.attenderName) && (
                            <small>
                              {discharge.referringDoctor
                                ? `Ref. Doctor: ${discharge.referringDoctor}`
                                : ""}
                              {discharge.referringDoctor && discharge.attenderName
                                ? " · "
                                : ""}
                              {discharge.attenderName
                                ? `Attender: ${discharge.attenderName}${discharge.attenderRelation ? ` · ${discharge.attenderRelation}` : ""}${discharge.attenderMobile ? ` · ${discharge.attenderMobile}` : ""}`
                                : ""}
                            </small>
                          )}
                        </span>
                        <span className={styles.recordDate}>
                          {discharge.dischargedAt}
                        </span>
                      </article>
                    ))
                  ) : (
                    <p className={styles.emptyState}>
                      {discharges.length
                        ? "No discharge records match this search."
                        : "No discharge history."}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      <p className={styles.previewNote}>
        Preview data only. Changes reset when this page is refreshed.
      </p>
    </div>
  );
}
