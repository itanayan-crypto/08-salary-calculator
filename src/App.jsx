import { useEffect } from "react";
import SalaryCalculator from "./components/SalaryCalculator/SalaryCalculator.jsx";

// body[data-task] is used by styles/base.css for this task's page background.
const TASK_ID = "8";

export default function App() {
  useEffect(() => {
    document.body.dataset.task = TASK_ID;
    return () => { delete document.body.dataset.task; };
  }, []);

  return (
    <main className="page">
      <div className="page-head">
        <span className="task-chip">Task 8</span>
        <h1 className="page-title">Daily Wage Salary Calculator</h1>
        <p className="page-sub">Enter employee details, join date, payment date and leaves. The wage per day depends on the position.</p>
      </div>
      <SalaryCalculator />
    </main>
  );
}
