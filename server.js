// Claims Tracker API (MVP)
// Uses an in-memory store with fictional demo data. No real patient information (PHI).
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const STATUSES = ['Submitted', 'Pending', 'Paid', 'Denied', 'Appealed'];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seedClaims() {
  return [
    { id: 1, patientId: 'P-1001', payer: 'Delta Dental', dateOfService: daysAgo(12), procedureCode: 'D1110', amount: 125.0, status: 'Submitted', denials: [] },
    { id: 2, patientId: 'P-1002', payer: 'Cigna', dateOfService: daysAgo(45), procedureCode: 'D2740', amount: 1150.0, status: 'Pending', denials: [] },
    { id: 3, patientId: 'P-1003', payer: 'MetLife', dateOfService: daysAgo(72), procedureCode: 'D0210', amount: 160.0, status: 'Denied', denials: [{ code: 'CO-29', notes: 'Timely filing limit expired', date: daysAgo(20) }] },
    { id: 4, patientId: 'P-1004', payer: 'Aetna', dateOfService: daysAgo(110), procedureCode: 'D4341', amount: 640.0, status: 'Appealed', denials: [] },
    { id: 5, patientId: 'P-1005', payer: 'Delta Dental', dateOfService: daysAgo(30), procedureCode: 'D0120', amount: 75.0, status: 'Paid', denials: [] }
  ].map((c) => ({ ...c, lastUpdated: daysAgo(0) }));
}

let claims = seedClaims();
let nextId = claims.length + 1;

function ageInDays(dateOfService) {
  const ms = Date.now() - new Date(dateOfService).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function agingBucket(days) {
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

function withAge(c) {
  return { ...c, age: ageInDays(c.dateOfService) };
}

// GET /api/claims - list all claims, newest date of service first
app.get('/api/claims', (req, res) => {
  const sorted = [...claims].sort((a, b) => b.dateOfService.localeCompare(a.dateOfService));
  res.json(sorted.map(withAge));
});

// POST /api/claims - add a claim
app.post('/api/claims', (req, res) => {
  const { patientId, payer, dateOfService, procedureCode, amount } = req.body || {};
  const missing = ['patientId', 'payer', 'dateOfService', 'procedureCode', 'amount'].filter(
    (f) => req.body?.[f] === undefined || req.body?.[f] === ''
  );
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }
  if (Number.isNaN(Number(amount)) || Number(amount) < 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  const claim = {
    id: nextId++,
    patientId,
    payer,
    dateOfService,
    procedureCode,
    amount: Number(amount),
    status: 'Submitted',
    denials: [],
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
  claims.push(claim);
  res.status(201).json(withAge(claim));
});

// PUT /api/claims/:id - update status
app.put('/api/claims/:id', (req, res) => {
  const claim = claims.find((c) => c.id === Number(req.params.id));
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}` });
  }
  claim.status = status;
  claim.lastUpdated = new Date().toISOString().slice(0, 10);
  res.json(withAge(claim));
});

// POST /api/claims/:id/denials - log a denial code and notes
app.post('/api/claims/:id/denials', (req, res) => {
  const claim = claims.find((c) => c.id === Number(req.params.id));
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  const { code, notes } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Denial code is required' });
  const denial = { code, notes: notes || '', date: new Date().toISOString().slice(0, 10) };
  claim.denials.push(denial);
  claim.status = 'Denied';
  claim.lastUpdated = denial.date;
  res.status(201).json(withAge(claim));
});

// GET /api/claims/aging - unpaid claims grouped into aging buckets
app.get('/api/claims/aging', (req, res) => {
  const buckets = { '0-30': [], '31-60': [], '61-90': [], '90+': [] };
  claims
    .filter((c) => c.status !== 'Paid')
    .forEach((c) => buckets[agingBucket(ageInDays(c.dateOfService))].push(withAge(c)));
  const summary = Object.entries(buckets).map(([bucket, items]) => ({
    bucket,
    count: items.length,
    total: Number(items.reduce((sum, c) => sum + c.amount, 0).toFixed(2)),
    claims: items
  }));
  res.json(summary);
});

// Test helper: reset demo data
function resetClaims() {
  claims = seedClaims();
  nextId = claims.length + 1;
}

const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Claims Tracker running on port ${PORT}`));
}

module.exports = { app, agingBucket, ageInDays, resetClaims };
