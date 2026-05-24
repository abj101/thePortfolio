import { Link } from "react-router-dom";
import styles from "./EntryPage.module.css";

export function EntryPage() {
  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.title}>My life through games</h1>
        <p className={styles.meta}>
          <span>Ayush Bandopadhyay</span>
          <span>Gameplay Programmer</span>
        </p>
      </div>

      <nav className={styles.actions} aria-label="Entry choices">
        <Link className={styles.play} to="/play">
          Play
        </Link>
        <Link className={styles.skip} to="/portfolio">
          Skip to portfolio
        </Link>
      </nav>
    </main>
  );
}
