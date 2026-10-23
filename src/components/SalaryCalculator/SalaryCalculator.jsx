import { useState } from "react";
import "./SalaryCalculator.css";

const POSITIONS = [
  { id: "manager", label: "Manager", wage: 1500, hours: 8 },
  { id: "jr-manager", label: "Jr. Manager", wage: 1000, hours: 8 },
  { id: "clerk", label: "Clerk", wage: 800 },
  { id: "sales", label: "Sales Executive", wage: 500 },
];

const EMPTY = { name: "", email: "", phone: "", address: "", position: "", doj: "", dop: "", leaves: "0" };

const rupees = (n) => "₹" + n.toLocaleString("en-IN");
const showDate = (v) => v.split("-").reverse().join("-"); // yyyy-mm-dd -> dd-mm-yyyy

// DOP - DOJ (din mein). UTC use kiya taaki daylight-saving/timezone se 1 din ka farak na aaye.
const dayDiff = (from, to) => {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
};

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Enter the employee name.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
  if (!/^\d{10}$/.test(f.phone)) e.phone = "Enter a 10 digit phone number.";
  if (!f.address.trim()) e.address = "Enter the address.";
  if (!f.position) e.position = "Select a position.";
  if (!f.doj) e.doj = "Pick the date of joining.";
  if (!f.dop) e.dop = "Pick the date of payment.";

  const leaves = Number(f.leaves);
  if (f.leaves === "" || !Number.isInteger(leaves) || leaves < 0) e.leaves = "Leaves must be a whole number, 0 or more.";

  if (f.doj && f.dop) {
    const total = dayDiff(f.doj, f.dop);
    if (total < 0) e.dop = "Payment date must be on or after the joining date.";
    else if (!e.leaves && leaves > total) e.leaves = `Leaves cannot be more than ${total} days.`;
  }
  return e;
}

function Field({ label, error, children }) {
  return (
    <label className="sc-field">
      <span className="sc-label">{label}</span>
      {children}
      {error && <span className="sc-error" role="alert">{error}</span>}
    </label>
  );
}

export default function SalaryCalculator() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPhone = (e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }));
  const pick = (id) => setForm((f) => ({ ...f, position: id }));
  const cls = (key) => "sc-input" + (errors[key] ? " is-invalid" : "");

  const calculate = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setResult(null);
      return;
    }
    const pos = POSITIONS.find((p) => p.id === form.position);
    const totalDays = dayDiff(form.doj, form.dop);
    const leaves = Number(form.leaves);
    const worked = totalDays - leaves;
    setResult({ form, pos, totalDays, leaves, worked, salary: worked * pos.wage });
  };

  const reset = () => {
    setForm(EMPTY);
    setErrors({});
    setResult(null);
  };

  return (
    <div className="sc">
      <form className="sc-form" onSubmit={calculate} noValidate>
        <header className="sc-head">
          <h1>Salary calculator</h1>
          <p>Wages are paid per day. Salary = days worked × daily wage.</p>
        </header>

        <fieldset className="sc-group">
          <legend>Employee</legend>
          <div className="sc-grid">
            <Field label="Name" error={errors.name}>
              <input className={cls("name")} value={form.name} onChange={set("name")} placeholder="Rahul Sharma" />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className={cls("phone")} inputMode="numeric" value={form.phone} onChange={setPhone} placeholder="10 digit number" />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className={cls("email")} type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" />
            </Field>
            <Field label="Address" error={errors.address}>
              <input className={cls("address")} value={form.address} onChange={set("address")} placeholder="House no, street, city" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="sc-group">
          <legend>Position</legend>
          <div className="sc-positions" role="group" aria-label="Position">
            {POSITIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={"sc-position" + (form.position === p.id ? " is-selected" : "")}
                aria-pressed={form.position === p.id}
                onClick={() => pick(p.id)}
              >
                <span className="sc-position-name">{p.label}</span>
                <span className="sc-position-wage">{rupees(p.wage)}<small>/day</small></span>
                {p.hours && <span className="sc-position-hours">{p.hours} hrs a day</span>}
              </button>
            ))}
          </div>
          {errors.position && <span className="sc-error" role="alert">{errors.position}</span>}
        </fieldset>

        <fieldset className="sc-group">
          <legend>Dates and leaves</legend>
          <div className="sc-grid sc-grid--3">
            <Field label="Date of joining" error={errors.doj}>
              <input className={cls("doj")} type="date" value={form.doj} onChange={set("doj")} />
            </Field>
            <Field label="Date of payment" error={errors.dop}>
              <input className={cls("dop")} type="date" value={form.dop} onChange={set("dop")} />
            </Field>
            <Field label="Leaves taken (days)" error={errors.leaves}>
              <input className={cls("leaves")} type="number" min="0" step="1" inputMode="numeric" value={form.leaves} onChange={set("leaves")} />
            </Field>
          </div>
        </fieldset>

        <div className="sc-actions">
          <button type="submit" className="sc-btn sc-btn--primary">Calculate salary</button>
          <button type="button" className="sc-btn" onClick={reset}>Clear</button>
        </div>
      </form>

      <aside className="sc-side" aria-live="polite">
        {result ? (
          <section className="sc-slip">
            <p className="sc-slip-kicker">Salary slip</p>
            <h2 className="sc-slip-name">{result.form.name}</h2>
            <p className="sc-slip-role">{result.pos.label}</p>

            <p className="sc-slip-total">{rupees(result.salary)}</p>
            <p className="sc-slip-formula">{result.worked} days × {rupees(result.pos.wage)}</p>

            <dl className="sc-slip-list">
              <div><dt>Joined</dt><dd>{showDate(result.form.doj)}</dd></div>
              <div><dt>Paid on</dt><dd>{showDate(result.form.dop)}</dd></div>
              <div><dt>Total days</dt><dd>{result.totalDays}</dd></div>
              <div><dt>Leaves</dt><dd>{result.leaves}</dd></div>
              <div><dt>Days worked</dt><dd>{result.worked}</dd></div>
              <div><dt>Wage per day</dt><dd>{rupees(result.pos.wage)}</dd></div>
            </dl>

            <p className="sc-slip-contact">
              {result.form.email}<br />
              {result.form.phone}<br />
              {result.form.address}
            </p>
          </section>
        ) : (
          <div className="sc-empty">
            <p className="sc-empty-title">No slip yet</p>
            <p>Fill in the details and select Calculate salary. The slip appears here.</p>
          </div>
        )}
      </aside>
    </div>
  );
}