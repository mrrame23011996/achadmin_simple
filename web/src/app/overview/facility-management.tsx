"use client";

import { useMemo, useState, type FormEvent } from "react";
import styles from "./facility-management.module.css";

type EquipmentStatus = "Operational" | "Maintenance" | "Out of service";

type Equipment = {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  department: string;
  location: string;
  nextServiceDate: string;
  status: EquipmentStatus;
};

type Supply = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
};

type SupplyRequestStatus = "Pending" | "Approved" | "Declined";

type SupplyRequest = {
  id: string;
  employeeName: string;
  department: string;
  supplyId: string;
  quantity: number;
  reason: string;
  status: SupplyRequestStatus;
};

type FacilitySection = "equipment" | "stock" | "requests";

const initialEquipment: Equipment[] = [
  {
    id: "EQ-1001",
    name: "Patient monitor",
    category: "Monitoring",
    serialNumber: "PM-884201",
    department: "Emergency",
    location: "Resuscitation Bay 1",
    nextServiceDate: "2026-12-15",
    status: "Operational",
  },
  {
    id: "EQ-1002",
    name: "Oxygen concentrator",
    category: "Respiratory",
    serialNumber: "OC-310872",
    department: "Biomedical",
    location: "Ward A",
    nextServiceDate: "2026-12-03",
    status: "Maintenance",
  },
  {
    id: "EQ-1003",
    name: "Infusion pump",
    category: "Infusion",
    serialNumber: "IP-772016",
    department: "ICU",
    location: "ICU Bay 3",
    nextServiceDate: "2027-01-10",
    status: "Operational",
  },
];

const initialSupplies: Supply[] = [
  {
    id: "SUP-201",
    name: "Oxygen sensor filters",
    category: "Biomedical",
    quantity: 4,
    unit: "filters",
    reorderLevel: 5,
  },
  {
    id: "SUP-202",
    name: "ECG electrode packs",
    category: "Biomedical",
    quantity: 36,
    unit: "packs",
    reorderLevel: 12,
  },
  {
    id: "SUP-203",
    name: "Suction canister lids",
    category: "Biomedical",
    quantity: 3,
    unit: "pieces",
    reorderLevel: 4,
  },
];

const initialSupplyRequests: SupplyRequest[] = [
  {
    id: "REQ-501",
    employeeName: "Samir Patel",
    department: "Biomedical",
    supplyId: "SUP-201",
    quantity: 1,
    reason: "Replace a damaged sensor filter.",
    status: "Pending",
  },
  {
    id: "REQ-502",
    employeeName: "Lina Okafor",
    department: "Nursing",
    supplyId: "SUP-202",
    quantity: 2,
    reason: "Needed for scheduled bedside monitoring.",
    status: "Pending",
  },
];

const sections: { id: FacilitySection; label: string }[] = [
  { id: "equipment", label: "Equipment Register" },
  { id: "stock", label: "Biomedical Stock" },
  { id: "requests", label: "Supply Requests" },
];

const equipmentStatuses: EquipmentStatus[] = [
  "Operational",
  "Maintenance",
  "Out of service",
];

function isEquipmentStatus(value: string): value is EquipmentStatus {
  return (
    value === "Operational" ||
    value === "Maintenance" ||
    value === "Out of service"
  );
}

function formatDate(dateValue: string) {
  if (!dateValue) return "Not scheduled";
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getSupplyName(supplies: Supply[], supplyId: string) {
  return supplies.find((supply) => supply.id === supplyId)?.name ?? "Unknown supply";
}

export default function FacilityManagement() {
  const [activeSection, setActiveSection] = useState<FacilitySection>("equipment");
  const [equipment, setEquipment] = useState(initialEquipment);
  const [supplies, setSupplies] = useState(initialSupplies);
  const [supplyRequests, setSupplyRequests] = useState(initialSupplyRequests);
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [message, setMessage] = useState("");
  const [nextEquipmentNumber, setNextEquipmentNumber] = useState(1004);
  const [nextSupplyNumber, setNextSupplyNumber] = useState(204);

  const filteredEquipment = useMemo(() => {
    const query = equipmentSearch.trim().toLowerCase();
    if (!query) return equipment;
    return equipment.filter((item) =>
      `${item.id} ${item.name} ${item.category} ${item.serialNumber} ${item.department} ${item.location}`
        .toLowerCase()
        .includes(query),
    );
  }, [equipment, equipmentSearch]);

  const lowStockSupplies = supplies.filter(
    (supply) => supply.quantity <= supply.reorderLevel,
  );
  const pendingRequestCount = supplyRequests.filter(
    (request) => request.status === "Pending",
  ).length;

  function addEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const serialNumber = String(formData.get("serialNumber") ?? "").trim();
    const department = String(formData.get("department") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const nextServiceDate = String(formData.get("nextServiceDate") ?? "");
    const status = String(formData.get("status") ?? "");

    if (
      !name ||
      !category ||
      !serialNumber ||
      !department ||
      !location ||
      !isEquipmentStatus(status)
    ) {
      setMessage("Complete the equipment details before registering the asset.");
      return;
    }

    const newEquipment: Equipment = {
      id: `EQ-${nextEquipmentNumber}`,
      name,
      category,
      serialNumber,
      department,
      location,
      nextServiceDate,
      status,
    };
    setEquipment((current) => [newEquipment, ...current]);
    setNextEquipmentNumber((current) => current + 1);
    setMessage(`${name} was added to the equipment register.`);
    setShowEquipmentForm(false);
    form.reset();
  }

  function updateEquipmentStatus(equipmentId: string, value: string) {
    if (!isEquipmentStatus(value)) {
      setMessage("Choose a valid equipment status.");
      return;
    }
    setEquipment((current) =>
      current.map((item) =>
        item.id === equipmentId
          ? { ...item, status: value }
          : item,
      ),
    );
    setMessage("Equipment status updated.");
  }

  function addSupply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const quantity = Number(formData.get("quantity"));
    const reorderLevel = Number(formData.get("reorderLevel"));

    if (
      !name ||
      !category ||
      !unit ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isInteger(reorderLevel) ||
      reorderLevel < 0
    ) {
      setMessage("Enter a supply name, unit, and valid whole-number stock levels.");
      return;
    }
    if (supplies.some((supply) => supply.name.toLowerCase() === name.toLowerCase())) {
      setMessage("A supply with this name already exists.");
      return;
    }

    const newSupply: Supply = {
      id: `SUP-${nextSupplyNumber}`,
      name,
      category,
      unit,
      quantity,
      reorderLevel,
    };
    setSupplies((current) => [newSupply, ...current]);
    setNextSupplyNumber((current) => current + 1);
    setMessage(`${name} was added to biomedical stock.`);
    setShowSupplyForm(false);
    form.reset();
  }

  function restockSupply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const supplyId = String(formData.get("supplyId") ?? "");
    const quantity = Number(formData.get("quantity"));
    const supply = supplies.find((item) => item.id === supplyId);

    if (!supply || !Number.isInteger(quantity) || quantity <= 0) {
      setMessage("Choose a supply and enter a restock quantity greater than zero.");
      return;
    }

    setSupplies((current) =>
      current.map((item) =>
        item.id === supplyId ? { ...item, quantity: item.quantity + quantity } : item,
      ),
    );
    setMessage(`${supply.name} stock increased by ${quantity} ${supply.unit}.`);
    form.reset();
  }

  function updateSupplyRequest(requestId: string, status: "Approved" | "Declined") {
    const request = supplyRequests.find((item) => item.id === requestId);
    if (!request || request.status !== "Pending") {
      setMessage("This supply request is no longer pending.");
      return;
    }

    const supply = supplies.find((item) => item.id === request.supplyId);
    if (!supply) {
      setMessage("The requested supply is not in the stock register.");
      return;
    }
    if (status === "Approved" && supply.quantity < request.quantity) {
      setMessage(
        `Cannot approve ${request.id}: only ${supply.quantity} ${supply.unit} are in stock.`,
      );
      return;
    }

    if (status === "Approved") {
      setSupplies((current) =>
        current.map((item) =>
          item.id === supply.id
            ? { ...item, quantity: item.quantity - request.quantity }
            : item,
        ),
      );
    }
    setSupplyRequests((current) =>
      current.map((item) =>
        item.id === requestId ? { ...item, status } : item,
      ),
    );
    setMessage(
      status === "Approved"
        ? `${request.quantity} ${supply.unit} of ${supply.name} approved for ${request.employeeName}.`
        : `${request.id} was declined.`,
    );
  }

  return (
    <div className={styles.facilitiesPage}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>FACILITIES & BIOMEDICAL</span>
          <h1>Facilities</h1>
          <p>Track equipment, manage medical supplies, and review stock requests.</p>
        </div>
      </header>

      <aside className={styles.lowStockBanner} role="status" aria-live="polite">
        <span className={styles.alertIcon} aria-hidden="true">!</span>
        <div>
          <strong>
            {lowStockSupplies.length
              ? `${lowStockSupplies.length} low-stock alert${lowStockSupplies.length === 1 ? "" : "s"}`
              : "Stock levels are healthy"}
          </strong>
          <p>
            {lowStockSupplies.length
              ? lowStockSupplies
                  .map(
                    (supply) =>
                      `${supply.name}: ${supply.quantity} ${supply.unit} (minimum ${supply.reorderLevel})`,
                  )
                  .join(" · ")
              : "No biomedical supplies are at or below their reorder level."}
          </p>
        </div>
      </aside>

      <div
        className={styles.sectionTabs}
        role="tablist"
        aria-label="Facilities sections"
      >
        {sections.map((section) => (
          <button
            aria-label={section.label}
            aria-controls="facilities-section-panel"
            aria-selected={activeSection === section.id}
            className={`${styles.sectionTab} ${
              activeSection === section.id ? styles.activeSectionTab : ""
            }`}
            id={`facility-tab-${section.id}`}
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setMessage("");
            }}
            role="tab"
            type="button"
          >
            {section.label}
            {section.id === "requests" && pendingRequestCount > 0 && (
              <span aria-hidden="true" className={styles.pendingCount}>
                {pendingRequestCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`facility-tab-${activeSection}`}
        className={styles.sectionPanel}
        id="facilities-section-panel"
        role="tabpanel"
      >
        {activeSection === "equipment" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>ASSET REGISTER</span>
                <h2>Equipment register</h2>
                <p>{equipment.length} registered assets</p>
              </div>
              <div className={styles.headingActions}>
                <label className={styles.searchField}>
                  <span>Search equipment</span>
                  <input
                    aria-label="Search equipment"
                    onChange={(event) => setEquipmentSearch(event.target.value)}
                    placeholder="Name, serial, department, location"
                    value={equipmentSearch}
                  />
                </label>
                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    setShowEquipmentForm((current) => !current);
                    setMessage("");
                  }}
                  type="button"
                >
                  {showEquipmentForm ? "Close form" : "Register equipment"}
                </button>
              </div>
            </div>

            {showEquipmentForm && (
              <form
                aria-label="Equipment registration form"
                className={styles.formCard}
                onSubmit={addEquipment}
              >
                <h3>Register equipment</h3>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Equipment name</span>
                    <input name="name" required />
                  </label>
                  <label className={styles.field}>
                    <span>Category</span>
                    <input name="category" placeholder="e.g. Monitoring" required />
                  </label>
                  <label className={styles.field}>
                    <span>Serial or asset number</span>
                    <input name="serialNumber" required />
                  </label>
                  <label className={styles.field}>
                    <span>Department</span>
                    <input name="department" required />
                  </label>
                  <label className={styles.field}>
                    <span>Location</span>
                    <input name="location" required />
                  </label>
                  <label className={styles.field}>
                    <span>Next service date</span>
                    <input name="nextServiceDate" type="date" />
                  </label>
                  <label className={styles.field}>
                    <span>Status</span>
                    <select defaultValue="Operational" name="status">
                      {equipmentStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.primaryButton} type="submit">
                    Save equipment
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => setShowEquipmentForm(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {message && <p className={styles.actionMessage} role="status">{message}</p>}

            <div className={styles.tableWrap}>
              <table aria-label="Equipment register" className={styles.dataTable}>
                <thead>
                  <tr>
                    <th scope="col">Asset</th>
                    <th scope="col">Category / serial</th>
                    <th scope="col">Department / location</th>
                    <th scope="col">Next service</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((item) => (
                    <tr key={item.id}>
                      <th scope="row">
                        <strong>{item.name}</strong>
                        <span>{item.id}</span>
                      </th>
                      <td>{item.category}<span>{item.serialNumber}</span></td>
                      <td>{item.department}<span>{item.location}</span></td>
                      <td>{formatDate(item.nextServiceDate)}</td>
                      <td>
                        <select
                          aria-label={`Status for ${item.name}`}
                          className={styles.statusSelect}
                          onChange={(event) =>
                            updateEquipmentStatus(item.id, event.target.value)
                          }
                          value={item.status}
                        >
                          {equipmentStatuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!filteredEquipment.length && (
                    <tr>
                      <td colSpan={5}>No equipment matches this search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === "stock" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>INVENTORY</span>
                <h2>Biomedical supplies stock</h2>
                <p>{supplies.length} tracked supplies · low-stock alerts update automatically</p>
              </div>
              <button
                className={styles.primaryButton}
                onClick={() => {
                  setShowSupplyForm((current) => !current);
                  setMessage("");
                }}
                type="button"
              >
                {showSupplyForm ? "Close form" : "Add supply item"}
              </button>
            </div>

            {message && <p className={styles.actionMessage} role="status">{message}</p>}

            {showSupplyForm && (
              <form
                aria-label="Add supply item form"
                className={styles.formCard}
                onSubmit={addSupply}
              >
                <h3>Add supply item</h3>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Supply name</span>
                    <input name="name" required />
                  </label>
                  <label className={styles.field}>
                    <span>Category</span>
                    <input name="category" required />
                  </label>
                  <label className={styles.field}>
                    <span>Unit</span>
                    <input name="unit" placeholder="e.g. packs" required />
                  </label>
                  <label className={styles.field}>
                    <span>Opening stock</span>
                    <input min="0" name="quantity" required step="1" type="number" />
                  </label>
                  <label className={styles.field}>
                    <span>Low-stock alert level</span>
                    <input min="0" name="reorderLevel" required step="1" type="number" />
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.primaryButton} type="submit">
                    Save supply item
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => setShowSupplyForm(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <form
              aria-label="Restock supplies form"
              className={styles.restockForm}
              onSubmit={restockSupply}
            >
              <label className={styles.field}>
                <span>Supply to restock</span>
                <select defaultValue="" name="supplyId" required>
                  <option disabled value="">Select a supply</option>
                  {supplies.map((supply) => (
                    <option key={supply.id} value={supply.id}>
                      {supply.name} · {supply.quantity} {supply.unit}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Quantity received</span>
                <input min="1" name="quantity" required step="1" type="number" />
              </label>
              <button className={styles.secondaryButton} type="submit">
                Restock
              </button>
            </form>

            <div className={styles.tableWrap}>
              <table aria-label="Biomedical supplies stock" className={styles.dataTable}>
                <thead>
                  <tr>
                    <th scope="col">Supply</th>
                    <th scope="col">Category</th>
                    <th scope="col">On hand</th>
                    <th scope="col">Alert level</th>
                    <th scope="col">Stock status</th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.map((supply) => {
                    const isLow = supply.quantity <= supply.reorderLevel;
                    return (
                      <tr key={supply.id}>
                        <th scope="row">
                          <strong>{supply.name}</strong>
                          <span>{supply.id}</span>
                        </th>
                        <td>{supply.category}</td>
                        <td>{supply.quantity} {supply.unit}</td>
                        <td>{supply.reorderLevel} {supply.unit}</td>
                        <td>
                          <span
                            className={`${styles.stockBadge} ${
                              isLow ? styles.lowStock : styles.stockHealthy
                            }`}
                          >
                            {isLow ? "Low stock" : "In stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === "requests" && (
          <>
            <div className={styles.panelHeading}>
              <div>
                <span className={styles.sectionLabel}>OWNER REVIEW</span>
                <h2>Supply requests</h2>
                <p>Approve requests before items are deducted from stock.</p>
              </div>
              <span className={styles.pendingBadge}>{pendingRequestCount} pending</span>
            </div>

            {message && <p className={styles.actionMessage} role="status">{message}</p>}

            <div className={styles.requestList}>
              {supplyRequests.map((request) => {
                const supply = supplies.find((item) => item.id === request.supplyId);
                return (
                  <article
                    aria-labelledby={`supply-request-${request.id}`}
                    className={styles.requestCard}
                    key={request.id}
                  >
                    <div className={styles.requestHeading}>
                      <div>
                        <strong id={`supply-request-${request.id}`}>
                          {request.id} · {getSupplyName(supplies, request.supplyId)}
                        </strong>
                        <span>{request.employeeName} · {request.department}</span>
                      </div>
                      <span
                        className={`${styles.stockBadge} ${
                          request.status === "Approved"
                            ? styles.stockHealthy
                            : request.status === "Pending"
                              ? styles.pendingStatus
                              : styles.declinedStatus
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p>{request.reason}</p>
                    <div className={styles.requestFooter}>
                      <span>
                        Requested: {request.quantity} {supply?.unit ?? "units"} · In stock:{" "}
                        {supply?.quantity ?? 0}
                      </span>
                      {request.status === "Pending" && (
                        <div className={styles.formActions}>
                          <button
                            className={styles.approveButton}
                            onClick={() =>
                              updateSupplyRequest(request.id, "Approved")
                            }
                            type="button"
                          >
                            Approve
                          </button>
                          <button
                            className={styles.declineButton}
                            onClick={() =>
                              updateSupplyRequest(request.id, "Declined")
                            }
                            type="button"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
              {!supplyRequests.length && (
                <p className={styles.emptyState}>No supply requests to review.</p>
              )}
            </div>
            <p className={styles.previewNote}>
              Staff-app requests are sample data in this preview. Connect the staff app and
              shared backend to receive real supply requests.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
