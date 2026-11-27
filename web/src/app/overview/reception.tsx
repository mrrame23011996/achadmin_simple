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
  source: "OPD" | "Emergency";
  admittedAt: string;
};

type Discharge = Admission & {
  dischargedAt: string;
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

export default function ReceptionDesk() {
  const [opdPatients, setOpdPatients] = useState(initialOpdPatients);
  const [admissions, setAdmissions] = useState(initialAdmissions);
  const [discharges, setDischarges] = useState(initialDischarges);
  const [search, setSearch] = useState("");
  const [emergencyDirectIpd, setEmergencyDirectIpd] = useState(false);
  const [message, setMessage] = useState("");
  const [nextOpdNumber, setNextOpdNumber] = useState(1044);
  const [nextIpdNumber, setNextIpdNumber] = useState(2036);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return opdPatients;
    return opdPatients.filter((patient) =>
      `${patient.name} ${patient.id} ${patient.phone}`.toLowerCase().includes(query),
    );
  }, [opdPatients, search]);

  function registerPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
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
      setMessage("Complete the required patient details to continue.");
      return;
    }

    const patientDetails: PatientDetails = {
      name,
      age,
      gender,
      address,
      phone,
    };

    if (emergencyDirectIpd) {
      const admission: Admission = {
        id: `IPD-${nextIpdNumber}`,
        ...patientDetails,
        source: "Emergency",
        admittedAt: "Just now",
      };
      setAdmissions((current) => [admission, ...current]);
      setNextIpdNumber((current) => current + 1);
      setMessage(`${name} was added as a direct emergency IPD admission.`);
    } else {
      const patient: OpdPatient = {
        id: `OPD-${nextOpdNumber}`,
        ...patientDetails,
      };
      setOpdPatients((current) => [patient, ...current]);
      setNextOpdNumber((current) => current + 1);
      setMessage(`${name} was registered for OPD as ${patient.id}.`);
    }

    form.reset();
    setEmergencyDirectIpd(false);
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

  return (
    <div className={styles.reception}>
      <header className={styles.receptionHeader}>
        <div>
          <span className={styles.eyebrow}>RECEPTION</span>
          <h1>Patient reception</h1>
          <p>Find OPD patients, register new patients, and manage admissions.</p>
        </div>
        <span className={styles.previewLabel}>SESSION PREVIEW</span>
      </header>

      <div className={styles.workflowGrid}>
        <section className={styles.panel} aria-labelledby="register-title">
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.sectionLabel}>NEW PATIENT</span>
              <h2 id="register-title">Register patient</h2>
            </div>
          </div>
          <p className={styles.registrationRule}>
            OPD registration is required before a routine IPD admission.
          </p>

          <form className={styles.registrationForm} onSubmit={registerPatient}>
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

            <label className={styles.emergencyToggle}>
              <input
                checked={emergencyDirectIpd}
                onChange={(event) => {
                  setEmergencyDirectIpd(event.target.checked);
                  setMessage("");
                }}
                type="checkbox"
              />
              <span className={styles.checkboxMark} aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="m3 8 3.2 3.2L13 4.5" />
                </svg>
              </span>
              <span>
                <strong>Emergency direct IPD admission</strong>
                <small>Use only when the patient must bypass OPD registration.</small>
              </span>
            </label>

            <button className={styles.registerButton} type="submit">
              {emergencyDirectIpd ? "Register emergency IPD" : "Register OPD patient"}
            </button>
          </form>

          {message && (
            <p className={styles.actionMessage} role="status">
              {message}
            </p>
          )}
        </section>

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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, OPD ID, or phone"
              value={search}
            />
          </label>

          <div className={styles.patientList}>
            {searchResults.length ? (
              searchResults.map((patient) => {
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

      <div className={styles.recordsGrid}>
        <section className={styles.panel} aria-labelledby="current-admissions-title">
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.sectionLabel}>INPATIENT</span>
              <h2 id="current-admissions-title">Current admissions</h2>
            </div>
            <span className={styles.countBadge}>{admissions.length}</span>
          </div>
          <div className={styles.recordList}>
            {admissions.length ? (
              admissions.map((admission) => (
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
              <p className={styles.emptyState}>No current admissions.</p>
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
          <div className={styles.recordList}>
            {discharges.length ? (
              discharges.map((discharge) => (
                <article className={styles.recordRow} key={discharge.id}>
                  <span className={styles.patientAvatar}>
                    {discharge.name.slice(0, 1)}
                  </span>
                  <span className={styles.recordIdentity}>
                    <strong>{discharge.name}</strong>
                    <small>
                      {discharge.id} · {discharge.source}
                    </small>
                  </span>
                  <span className={styles.recordDate}>
                    {discharge.dischargedAt}
                  </span>
                </article>
              ))
            ) : (
              <p className={styles.emptyState}>No discharge history.</p>
            )}
          </div>
        </section>
      </div>

      <p className={styles.previewNote}>
        Preview data only. Changes reset when this page is refreshed.
      </p>
    </div>
  );
}
