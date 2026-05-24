import { Link } from "react-router-dom";
import styles from "./PortfolioPage.module.css";

const FEATURED = {
  slug: "my-life-through-games",
  title: "MY LIFE THROUGH GAMES",
  tagline: "Seven gaming memories, made playable.",
  tech: ["React Three Fiber", "JavaScript", "WebGL"],
} as const;

const PROJECTS = [
  {
    slug: "the-last-stick",
    title: "The Last Stick",
    tagline: "Narrative combat platformer. Built every player system from scratch.",
    tech: ["Unity 2D", "C#"],
    status: "In Development" as const,
    playUrl: "#",
  },
  {
    slug: "of-bone-and-stone",
    title: "Of Bone and Stone",
    tagline: "Isometric Unity RPG. Sole programmer. Also ran production for a team of five.",
    tech: ["Unity", "C#"],
    status: "Playable" as const,
    playUrl: "#",
  },
  {
    slug: "bonestorm",
    title: "BoneStorm",
    tagline: "Browser game — content TBD.",
    tech: ["Phaser 3", "JavaScript"],
    status: "Playable" as const,
    playUrl: "#",
  },
  {
    slug: "chop-chop",
    title: "Chop Chop",
    tagline: "Unity 3D project — content TBD.",
    tech: ["Unity 3D", "C#"],
    status: "Playable" as const,
    playUrl: "#",
  },
] as const;

export function PortfolioPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.name}>AYUSH BANDOPADHYAY</h1>
        <p className={styles.specialization}>
          Gameplay Programmer — Game Feel &amp; Player Systems
        </p>
        <p className={styles.stack}>Unity · C# · JavaScript · Phaser 3</p>

        <nav className={styles.contact} aria-label="Contact links">
          <a href="#resume">Resume</a>
          <span aria-hidden="true">·</span>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <span aria-hidden="true">·</span>
          <a href="mailto:hello@example.com">Email</a>
        </nav>
      </header>

      <section className={styles.projects} aria-labelledby="projects-heading">
        <h2 id="projects-heading" className={styles.sectionTitle}>
          Projects
        </h2>

        <article className={styles.featured} aria-labelledby="featured-title">
          <div className={styles.featuredMedia}>
            <span className={styles.mediaPlaceholder}>Clip</span>
          </div>
          <div className={styles.featuredBody}>
            <h3 id="featured-title" className={styles.featuredTitle}>
              {FEATURED.title}
            </h3>
            <p className={styles.tagline}>{FEATURED.tagline}</p>
            <ul className={styles.tech}>
              {FEATURED.tech.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <div className={styles.featuredActions}>
              <Link className={styles.primaryAction} to="/play">
                Enter Experience
              </Link>
              <Link
                className={styles.secondaryAction}
                to={`/projects/${FEATURED.slug}`}
              >
                View Project
              </Link>
            </div>
          </div>
        </article>

        <ul className={styles.grid}>
          {PROJECTS.map((project) => (
            <li key={project.slug}>
              <article className={styles.card}>
                <div className={styles.media} aria-hidden="true">
                  <span className={styles.mediaPlaceholder}>Clip</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <span className={styles.badge}>{project.status}</span>
                  </div>
                  <p className={styles.tagline}>{project.tagline}</p>
                  <ul className={styles.tech}>
                    {project.tech.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <div className={styles.cardActions}>
                    <a
                      className={styles.primaryAction}
                      href={project.playUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Play
                    </a>
                    <Link
                      className={styles.secondaryAction}
                      to={`/projects/${project.slug}`}
                    >
                      View Project
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <footer className={styles.footer}>
        <Link to="/about">About</Link>
        <span aria-hidden="true">·</span>
        <Link to="/contact">Contact</Link>
      </footer>
    </div>
  );
}
