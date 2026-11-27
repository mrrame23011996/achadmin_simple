# ACH Admin

Local-first development for the ACH Admin web app. The web app is in [`web/`](./web); it uses Next.js, React, and TypeScript. Its pages and server-side Next.js code run locally during development. A database or third-party integration can be added later and run locally or against a separately configured service.

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In VS Code or Codespaces, forward port 3000 if prompted.

## Owner access

The web app starts with owner sign-in and first-time setup screens. For local previews, sign in with `owner@achadmin.local` and `DemoOwner123!` to open the overview. This is a client-side demo only: it is not secure authentication, the overview route is not protected, and no credentials or account details are stored. Owner registration is not connected yet. Replace the demo flow with secure server-side authentication and persistent storage before using this app with real accounts or hospital data.

The first hospital overview prototype is available at `/overview`. It includes a time-based greeting and sample values for available beds, OPD visits, overdue duties, active alerts, and open staff problems. These values are illustrative only and are not live hospital data.

The Reception tab supports searching sample OPD patients, registering new OPD patients with name, age, gender, and address (phone is optional), admitting an existing OPD patient to IPD, and tracking current admissions and discharge history. Direct IPD registration is available through the emergency toggle in the registration form. Reception records are in-memory preview data; they persist while switching tabs but reset when the page is refreshed.

To run the overview prototype on its own development port, start it from `web/` with `npm run dev:overview` and open [http://localhost:3001/overview](http://localhost:3001/overview). It uses a separate Next.js build directory so it can run alongside the default development server.

## Test and validate

Run these from `web/`:

```bash
npm test          # Run component tests once
npm run test:watch
npm run lint
npm run typecheck
npm run build
npm run check     # Run lint, typecheck, tests, and production build
```

To serve a production build locally, run `npm run build` followed by `npm start`.
