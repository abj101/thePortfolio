import { Link } from "react-router-dom";
import { ExperienceCanvas } from "../canvas/ExperienceCanvas";
import styles from "./PlayPage.module.css";

export function PlayPage() {
  return (
    <div className={styles.shell}>
      <ExperienceCanvas />
      <div className={styles.overlay}>
        <p className={styles.note}>Memory journey — scenes coming next.</p>
        <Link className={styles.escape} to="/portfolio">
          → portfolio
        </Link>
      </div>
    </div>
  );
}
