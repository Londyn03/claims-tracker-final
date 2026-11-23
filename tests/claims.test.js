const request = require('supertest');
const { app, agingBucket, resetClaims } = require('../server');

beforeEach(() => resetClaims());

describe('agingBucket', () => {
  test('puts days into the right buckets (edges)', () => {
    expect(agingBucket(0)).toBe('0-30');
    expect(agingBucket(30)).toBe('0-30');
    expect(agingBucket(31)).toBe('31-60');
    expect(agingBucket(60)).toBe('31-60');
    expect(agingBucket(61)).toBe('61-90');
    expect(agingBucket(90)).toBe('61-90');
    expect(agingBucket(91)).toBe('90+');
  });
});

describe('Claims API', () => {
  test('GET /api/claims returns claims newest first with age', async () => {
    const res = await request(app).get('/api/claims');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(5);
    expect(res.body[0]).toHaveProperty('age');
    expect(res.body[0].dateOfService >= res.body[1].dateOfService).toBe(true);
  });

  test('POST /api/claims adds a claim', async () => {
    const res = await request(app).post('/api/claims').send({
      patientId: 'P-2001', payer: 'Guardian', dateOfService: '2026-11-01', procedureCode: 'D1110', amount: 120
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Submitted');
  });

  test('POST /api/claims rejects missing fields', async () => {
    const res = await request(app).post('/api/claims').send({ payer: 'Guardian' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/claims/:id updates status', async () => {
    const res = await request(app).put('/api/claims/1').send({ status: 'Paid' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Paid');
  });

  test('PUT /api/claims/:id rejects invalid status', async () => {
    const res = await request(app).put('/api/claims/1').send({ status: 'Lost' });
    expect(res.status).toBe(400);
  });

  test('POST /api/claims/:id/denials logs a denial and sets status to Denied', async () => {
    const res = await request(app).post('/api/claims/2/denials').send({ code: 'CO-197', notes: 'Missing pre-auth' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Denied');
    expect(res.body.denials.length).toBe(1);
  });

  test('GET /api/claims/aging leaves out Paid claims', async () => {
    const res = await request(app).get('/api/claims/aging');
    expect(res.status).toBe(200);
    const count = res.body.reduce((sum, b) => sum + b.count, 0);
    expect(count).toBe(4);
  });
});
