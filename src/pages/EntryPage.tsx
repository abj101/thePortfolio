import { Link } from "react-router-dom";
import styles from "./EntryPage.module.css";

export function EntryPage() {
  return (
    <main className={styles.page}>
      <header className={styles.identity}>
        <h1 className={styles.title}>MY LIFE THROUGH GAMES</h1>
        <p className={styles.name}>Ayush Bandopadhyay</p>
        <p className={styles.role}>Gameplay Programmer</p>
      </header>

      <hr className={styles.rule} aria-hidden="true" />

      <nav className={styles.actions} aria-label="Entry choices">
        <Link className={styles.action} to="/play">
          Play
        </Link>
        <Link className={styles.action} to="/portfolio">
          Skip to portfolio →
        </Link>
      </nav>
    </main>
  );
}
