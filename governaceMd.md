# Governance Feature Documentation

This document describes the governance/voting implementation added across backend and frontend.

## Overview

The platform now supports:

- Company-side governance proposal creation
- Investor-side proposal viewing and voting
- Equity creation flow with optional initial proposal setup
- Dashboard integrations that use live governance data (no local mock arrays)

## Backend (NestJS) Changes

### New Data Model

- `src/companies/proposal.schema.ts`
  - Stores governance proposals and vote records.
  - Key fields:
    - `companyId`, optional `equityId`
    - `title`, `description`, `proposalType`
    - `status` (`active` or `closed`)
    - `startDate`, `endDate`
    - `votesFor`, `votesAgainst`, `totalVotes`
    - `votes[]` (voter account/email, choice, timestamp)

### New DTOs

- `src/companies/dto/create-proposal.dto.ts`
- `src/companies/dto/vote-proposal.dto.ts`

### Module Wiring

- `src/companies/companies.module.ts`
  - Registers `Proposal` schema in `MongooseModule.forFeature`.

### Service Methods

- `createProposal(companyId, dto, createdByAccountId?, createdByEmail?)`
- `findProposalsByCompany(companyId, status?)`
- `findInvestorProposals(status?)`
- `voteOnProposal(companyId, proposalId, dto)`
- Internal status sync:
  - expired active proposals are auto-marked as `closed`

### API Endpoints

All under `/companies`:

- `POST /:id/proposals` (JWT required)
  - Create governance proposal for company
- `GET /:id/proposals`
  - List company proposals
- `GET /investor/proposals`
  - List investor-facing proposals
- `POST /:id/proposals/:proposalId/vote` (JWT required)
  - Submit a vote (`for` or `against`)

## Frontend (Next.js) Changes

### API Client

- `lib/api/client.ts`
  - Added `GovernanceProposal` type
  - Added methods:
    - `createProposal`
    - `getCompanyProposals`
    - `getInvestorProposals`
    - `voteProposal`

### Company Corporate Actions Page

- `app/company/dashboard/[id]/actions/page.tsx`
  - Replaced mocked data with live API integration
  - Loads proposals + equities
  - Creates proposals from form
  - Shows voting progress from backend counts

### Investor Dashboard

- `app/dashboard/page.tsx`
  - Replaced mocked holdings/governance arrays
  - Pulls live proposals from backend
  - Pulls holdings from Hedera Mirror Node
  - Supports voting from dashboard
  - Shows empty state when no holdings/equities are found

### Company Dashboard Empty Equity State

- `app/company/dashboard/[id]/page.tsx`
  - Added explicit message when company has no equity issues under account.

### Equity Creation Voting Integration

- `app/company/dashboard/[id]/equity/new/page.tsx`
  - Added optional “Create Initial Voting Proposal” block when `Voting Rights` is enabled
  - On successful equity deployment:
    - optional proposal is created automatically
    - user is redirected to governance actions page

## Wallet Send by Account ID

### Service Layer

- `lib/hedera/ATSService.ts`
  - Added `transferAsset(targetAccountId, amount, tokenId?)`
  - Supports:
    - HBAR transfer
    - HTS token transfer

### Wallet Context

- `lib/context/WalletContext.tsx`
  - Exposes `transferAsset(...)` to UI

### Wallet UI

- `app/wallet/page.tsx`
  - Added Transfer modal
  - Supports destination account ID + amount + asset selection
  - Wires quick action `transfer` to the new modal and service

## Notes

- Proposal end dates are sent as ISO strings from the frontend.
- Voting prevents duplicate votes per voter account/email.
- Proposal status automatically closes after end date.

