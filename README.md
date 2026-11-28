# ACH Admin

Local-first development for the ACH Admin web app. The web app is in [`web/`](./web); it uses Next.js, React, and TypeScript. Its pages and server-side Next.js code run locally during development. Supabase Auth can be configured for owner access; hospital records remain sample data and are not connected to a database.

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

## Supabase owner access

1. Copy `web/.env.example` to `web/.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` using the project URL and publishable/anon key from your Supabase project's API settings. These are public client values; never put a service-role key in the app.
3. In Supabase Authentication settings, disable public sign-ups so only invited users can access this owner portal. In URL configuration, set the local site URL to `http://localhost:3000` and allow `http://localhost:3000/auth/callback`. Configure invitation email links to return to `/auth/callback?type=invite&next=%2Fauth%2Fupdate-password`.
4. Invite the initial owner from Supabase Authentication → Users. The account invite panel is informational; public sign-up is intentionally disabled. Invite only trusted administrators because invited accounts can access the owner overview. Invitees finish setting a password from the email link, then sign in. Password reset is also handled through Supabase email.

The overview route uses the Supabase session cookie and redirects signed-out visitors to the sign-in page. The overview logout button ends the session. Authentication is connected, but patient, employee, facility, and escalation data are still previews; do not enter real hospital or patient information until persistence, authorization, and database row-level security policies are implemented.

The first hospital overview prototype is available at `/overview`. It includes a time-based greeting and sample values for admitted patients, OPD visits, priority escalations, and staff approvals. These values are illustrative only and are not live hospital data.

The Reception tab supports searching sample OPD patients, registering new OPD patients with name, age, gender, and address (phone is optional), admitting an existing OPD patient to IPD, and tracking current admissions and discharge history. Direct IPD registration is available through the emergency toggle in the registration form. Reception records are in-memory preview data; they persist while switching tabs but reset when the page is refreshed.

The Escalation inbox is a local preview for reviewing staff-reported problems, filtering by seriousness and due status, assigning work to sample staff, creating owner-assigned work that was not reported, and marking items completed. It is not connected to a staff app or shared backend: reports and assignments are sample in-memory data, and staff-app notifications are not sent. Connect the staff app, persistent storage, and a notification service before using this workflow operationally.

The Employees tab provides a sample employee directory, custom shift creation with employee assignment, daily and monthly attendance tables with late-entry details, leave-request review, monthly payroll estimates, and a Reports section. Its report selector includes the employee directory, daily attendance, employees on leave for a date, monthly payroll, late entries for a month, and absent employees for a date. Employee, shift, attendance, and leave records are in-memory preview data and reset on refresh; leave requests do not sync with a staff app. Payroll shows gross base salaries only and does not apply tax, deductions, overtime, attendance adjustments, or statutory rules. Connect a shared backend and define payroll policies before relying on these workflows.

The Staff Access section is a UI preview for assigning usernames and temporary passwords, reviewing a one-time first-login approval, and recording owner-initiated password resets. It does not store passwords or authenticate users. The staff app and shared backend are not implemented; when added, they must enforce owner approval before access and keep punch-in/out inside the staff app.

The Facilities tab includes an equipment register, biomedical supply stock with restocking and low-stock alerts, and staff supply requests that deduct stock only after owner approval. Equipment and inventory are sample in-memory data, and requests are preview records until the staff app and a shared backend are connected.

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
