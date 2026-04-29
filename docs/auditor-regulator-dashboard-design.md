# Auditor/Regulator Dashboard Design (Draft)

## 1. Purpose
Design a dedicated regulator/auditor dashboard for compliance operations:
- KYC case management
- Immutable-style audit trail review
- External list management (sanctions, PEP, internal watchlists, blocked entities)

This is a **design-first** spec for approval before implementation.

## 2. Target Users
- **Regulator Analyst**: reviews KYC submissions and flags.
- **Auditor**: inspects decisions and timeline events for traceability.
- **Compliance Admin**: manages external screening lists and matching rules.

## 3. Proposed Routes
- `/auditor/dashboard` - overview and risk signals
- `/auditor/kyc` - KYC queue and case review
- `/auditor/audit-trail` - full event log explorer
- `/auditor/external-lists` - external list sources and records
- `/auditor/reports` - exports and regulatory reports

## 4. Information Architecture
Main left nav for auditor role:
1. Dashboard
2. KYC Cases
3. Audit Trail
4. External Lists
5. Reports

Global top bar:
- Search (`case id`, `account id`, `email`, `tx hash`)
- Date range filter
- Quick actions: `Export`, `Create Alert Rule`

## 5. Dashboard (Overview Page)
## 5.1 KPI Cards
- `Pending KYC Reviews`
- `High-Risk Cases (24h)`
- `Screening Matches (24h)`
- `Audit Events Logged (24h)`
- `SLA Breaches`

## 5.2 Core Widgets
- **KYC Queue Snapshot**: top pending cases with age and risk score.
- **Risk Distribution**: low/medium/high/critical bar chart.
- **Recent Audit Events**: latest 20 actions with actor and timestamp.
- **List Match Alerts**: newest sanctions/watchlist hits.
- **Compliance SLA Monitor**: overdue cases and owner.

## 5.3 UX Notes
- Keep existing dark visual language (`black + gray + orange` accents).
- Use badge colors only for status/risk:
  - `green`: cleared
  - `yellow`: pending/review
  - `red`: high risk/rejected
  - `gray`: archived/closed

## 6. KYC Management Page
## 6.1 Table Columns
- Case ID
- Applicant (name/email/account)
- Type (`individual` | `business`)
- Country
- Risk Score
- Current Status
- Last Updated
- Assigned Reviewer
- Actions (`View`, `Approve`, `Reject`, `Escalate`)

## 6.2 Filters
- Status: pending, in_review, approved, rejected, escalated
- Risk level: low, medium, high, critical
- Country
- Date submitted
- Has watchlist match (yes/no)

## 6.3 Case Detail Drawer/Page
- Identity docs preview and metadata
- PEP/sanctions screening results
- Linked accounts/entities
- Decision panel:
  - Decision reason (required for reject/escalate)
  - Notes
  - 4-eyes control (optional second approver)
- Write-through audit event on every action

## 7. Audit Trail Page
## 7.1 Event Explorer
- Full event feed with pagination
- Filters:
  - Event type (`kyc.created`, `kyc.approved`, `list.match`, `rule.updated`, etc.)
  - Actor (user/service)
  - Entity type (user, company, security, list-record)
  - Date/time range
- Event details:
  - Event ID
  - Actor + role
  - Before/after diff (for updates)
  - Correlation ID / request ID
  - Related case ID or account ID

## 7.2 Integrity Expectations
- Events are append-only at application level.
- No hard delete from UI.
- Exports include hash/checksum column for downstream verification.

## 8. External Lists Management Page
## 8.1 List Sources
- Sanctions lists (e.g., OFAC-like source)
- PEP list provider
- Internal blocked entities list
- Internal high-risk geography list

## 8.2 Capabilities
- Add/Edit/Disable list source
- Manual record add/remove for internal lists
- Bulk upload (CSV) with validation preview
- Sync status panel:
  - Last sync time
  - Records added/updated/failed
  - Next scheduled sync

## 8.3 Match Rules
- Fuzzy name threshold
- Date-of-birth exact/relaxed match option
- Country weighting
- Alias matching toggle

## 9. Auditor Page Proposal (What It Should Present)
The auditor-facing page should prioritize:
1. **What changed**: latest compliance decisions and rule changes.
2. **Why it changed**: decision reasons and evidence.
3. **Who changed it**: actor identity, role, and timestamp.
4. **Risk impact**: high-risk and unresolved matches first.
5. **Proof of control**: clear audit chain and exportable evidence.

Suggested layout:
- Top: KPI strip + date scope
- Mid-left: pending/recent KYC decisions
- Mid-right: watchlist/sanctions alert panel
- Bottom: audit timeline with drill-down details

## 10. Data Contract Draft (Frontend View Models)
```ts
type KycCase = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  hederaAccountId?: string;
  type: "individual" | "business";
  country: string;
  riskScore: number;
  status: "pending" | "in_review" | "approved" | "rejected" | "escalated";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  hasListMatch: boolean;
};

type AuditEvent = {
  id: string;
  eventType: string;
  actorId: string;
  actorRole: string;
  entityType: string;
  entityId: string;
  correlationId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: string;
};

type ExternalListSource = {
  id: string;
  name: string;
  type: "sanctions" | "pep" | "internal_blocked" | "internal_geo";
  status: "active" | "disabled";
  lastSyncAt?: string;
  nextSyncAt?: string;
  totalRecords: number;
};
```

## 11. Implementation Phases
1. **Phase 1 (UI skeleton)**: routes, nav, static cards/tables, mock state.
2. **Phase 2 (KYC integration)**: wire to backend KYC endpoints and actions.
3. **Phase 3 (Audit trail)**: event model, timeline, filter/search, export.
4. **Phase 4 (External lists)**: source config, upload/sync, rule tuning.
5. **Phase 5 (hardening)**: role guards, audit integrity checks, SLA alerts.

## 12. Open Decisions For Your Approval
1. Keep path as `/auditor/*` or rename to `/regulator/*`.
2. Should auditor users be read-only, while regulator admins can approve/reject KYC?
3. Confirm required external list providers for v1.
4. Confirm if 4-eyes approval is mandatory for `high/critical` risk.

MY PROPOSALS
Keep path as `/auditor/*`
3. Dont set  external list providers yet allow for them to be added later 
