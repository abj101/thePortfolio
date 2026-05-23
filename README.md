# My Life Through Games

Playable memory portfolio for Ayush Bandopadhyay — gameplay programmer.

## Stack

- React + Vite + TypeScript
- React Three Fiber + Drei (Path A memories)
- React Router (entry, `/play`, `/portfolio`)

See [vision.md](./vision.md) for architecture and build order.

## Develop

```bash
npm install
npm run dev
```

- `/` — entry (Play / Skip to portfolio)
- `/portfolio` — Path B summary (no R3F; recruiter-fast)
- `/play` — Path A canvas shell (memories TBD)

## Build

```bash
npm run build
npm run preview
```

Deploy `dist/` to Vercel or GitHub Pages.
