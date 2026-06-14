For a solo founder/SDE, I would not write the PRD as "Credits-as-a-Service."

I would position it as:

> **UsageCredits** — Infrastructure for SaaS companies to sell, track, and monetize credits.

This is much easier to explain and sell.

---

# Product Requirements Document (PRD)

## Product Name

UsageCredits (working title)

## Vision

Enable SaaS companies to launch credit-based pricing in hours instead of weeks.

Developers should be able to:

* Create wallets
* Grant credits
* Consume credits
* Sell top-ups
* Track usage

without building billing infrastructure.

---

# Problem Statement

Modern SaaS products increasingly monetize through credits.

Examples:

| Product          | Credit Unit |
| ---------------- | ----------- |
| AI SaaS          | Tokens      |
| Image Generation | Images      |
| WhatsApp SaaS    | Messages    |
| API Business     | Requests    |
| Automation Tool  | Executions  |

Today most startups implement:

```sql
users.credits
```

This creates issues:

* race conditions
* inaccurate balances
* lack of audit logs
* no expiry support
* difficult top-up management
* poor reporting

There is no simple India-focused solution.

---

# Target Customers

## Primary

AI SaaS startups

Examples:

* AI agents
* Chatbots
* Image generators
* Coding assistants

Company size:

```text
1-20 engineers
```

Revenue:

```text
₹5L - ₹5Cr ARR
```

---

## Secondary

API businesses

Examples:

* SMS APIs
* WhatsApp APIs
* OCR APIs
* Geolocation APIs

---

## Tertiary

Internal enterprise platforms

---

# Success Metrics

## Business

Within 12 months:

```text
100 paying tenants
```

MRR:

```text
₹3L+
```

---

## Product

Wallet API latency:

```text
<100ms
```

Balance accuracy:

```text
100%
```

Transaction durability:

```text
100%
```

---

# User Personas

## Persona 1

AI SaaS Founder

Pain:

> I need credits but don't want to build a ledger.

Goal:

> Launch pricing quickly.

---

## Persona 2

Engineering Lead

Pain:

> Current implementation breaks under concurrency.

Goal:

> Reliable balance management.

---

# Core Concepts

## Tenant

Customer of our platform.

Example:

```text
Acme AI
```

---

## Account

End customer of tenant.

Example:

```text
John
Microsoft
Netflix
```

---

## Wallet

Credit balance container.

Example:

```text
5000 Credits
```

---

## Transaction

Immutable ledger entry.

Example:

```text
+1000 Subscription

-25 GPT Request

+500 Topup
```

---

## Credit Bucket

Credits grouped by source.

Example:

```text
Monthly Credits

1000

Expires:
2026-08-01
```

---

# MVP Features

## Feature 1: Tenant Management

### Create Tenant

```http
POST /tenants
```

### Update Tenant

```http
PATCH /tenants
```

### Authentication

API Keys

Example:

```text
sk_live_xxxxx
```

---

# Feature 2: Account Management

### Create Account

```http
POST /accounts
```

Request:

```json
{
  "external_id": "user_123",
  "name": "John"
}
```

---

# Feature 3: Wallets

Every account gets wallet.

### Get Balance

```http
GET /wallets/{id}
```

Response:

```json
{
  "balance": 5000
}
```

---

# Feature 4: Grant Credits

### API

```http
POST /credits/grant
```

Request:

```json
{
  "account_id": "123",
  "credits": 1000,
  "reason": "subscription"
}
```

Creates:

```text
Ledger Entry
```

---

# Feature 5: Consume Credits

### API

```http
POST /credits/consume
```

Request:

```json
{
  "account_id": "123",
  "credits": 10,
  "event": "gpt_request"
}
```

Validation:

* sufficient balance
* idempotency
* atomic transaction

---

# Feature 6: Ledger

Immutable transaction history.

### API

```http
GET /transactions
```

Response:

```json
[
 {
  "amount": -10,
  "event": "gpt_request"
 }
]
```

---

# Feature 7: Credit Expiry

Support:

```text
30 days

90 days

Never
```

Expiry job runs daily.

---

# Feature 8: Webhooks

Events:

```text
wallet.low_balance

wallet.empty

credits.granted

credits.consumed
```

Example:

```json
{
 "event":"wallet.low_balance"
}
```

---

# Feature 9: Dashboard

Tenant dashboard showing:

### Accounts

```text
Total Accounts
```

### Wallets

```text
Top Wallets
```

### Usage

```text
Credits Consumed
```

### Ledger

```text
Recent Transactions
```

---

# Feature 10: Razorpay Integration

Top-up flow.

Example:

```text
₹500
=
1000 Credits
```

Flow:

```text
Pay
↓
Webhook
↓
Grant Credits
```

---

# Non-Functional Requirements

## Security

* Tenant isolation
* API keys
* Audit logs

---

## Reliability

Balance consistency:

```text
Never negative
```

unless overage enabled.

---

## Idempotency

Support:

```http
Idempotency-Key
```

for all mutating APIs.

---

## Concurrency

Guarantee:

```text
Single deduction
```

under concurrent requests.

Implementation:

```sql
SELECT FOR UPDATE
```

or optimistic locking.

---

# V1 Database Design

### tenants

```sql
id
name
api_key
```

### accounts

```sql
id
tenant_id
external_id
```

### wallets

```sql
id
account_id
```

### transactions

```sql
id
wallet_id
amount
type
reference_id
```

### credit_buckets

```sql
id
wallet_id
remaining
expires_at
```

### webhook_endpoints

```sql
id
tenant_id
url
```

---

# Out of Scope (V1)

Do NOT build:

* Complex invoicing
* GST engine
* Subscription management
* Multi-currency
* Revenue recognition
* Enterprise contracts
* Usage analytics warehouse
* Orb-like metering engine

These can easily consume 12+ months.

---

# V2 Roadmap

After first 10 paying customers:

### Shared Wallets

```text
Team Wallet
```

### Usage Metering

```text
API Calls
Storage
Tokens
```

### Plans

```text
Starter
Pro
Enterprise
```

### Entitlements

```text
Feature Limits
```

### SDKs

```text
Node.js
Python
Go
Java
```

---

## What I Would Build First (First 30 Days)

If you are building this solo:

### Week 1

* Auth
* Tenants
* Accounts

### Week 2

* Wallets
* Ledger
* Credit Consumption

### Week 3

* Dashboard
* Webhooks

### Week 4

* Razorpay Topups
* Docs
* Node SDK