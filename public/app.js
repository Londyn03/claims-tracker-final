// Claims Tracker frontend
let activeBucket = null;

function money(n) {
  return '$' + Number(n).toFixed(2);
}

function bucketFor(age) {
  if (age <= 30) return '0-30';
  if (age <= 60) return '31-60';
  if (age <= 90) return '61-90';
  return '90+';
}

async function loadAging() {
  const res = await fetch('/api/claims/aging');
  const buckets = await res.json();
  const el = document.getElementById('aging');
  el.innerHTML = '';
  buckets.forEach((b) => {
    const card = document.createElement('div');
    card.className = 'bucket' + (activeBucket === b.bucket ? ' active' : '');
    card.innerHTML = `<div class="label">${b.bucket} days</div><div class="total">${money(b.total)}</div><div class="muted">${b.count} claim(s)</div>`;
    card.onclick = () => {
      activeBucket = activeBucket === b.bucket ? null : b.bucket;
      refresh();
    };
    el.appendChild(card);
  });
}

async function loadClaims() {
  const res = await fetch('/api/claims');
  let claims = await res.json();
  if (activeBucket) {
    claims = claims.filter((c) => c.status !== 'Paid' && bucketFor(c.age) === activeBucket);
  }
  document.getElementById('filter-label').textContent = activeBucket
    ? `Showing unpaid claims ${activeBucket} days old (click the card again to clear)`
    : '';
  const body = document.getElementById('claims-body');
  body.innerHTML = '';
  document.getElementById('empty').hidden = claims.length > 0;

  claims.forEach((c) => {
    const tr = document.createElement('tr');
    const lastDenial = c.denials.length ? c.denials[c.denials.length - 1] : null;
    tr.innerHTML = `
      <td>${c.patientId}</td>
      <td>${c.payer}</td>
      <td>${c.dateOfService}</td>
      <td>${c.procedureCode}</td>
      <td>${money(c.amount)}</td>
      <td>${c.age}d</td>
      <td>
        <select data-id="${c.id}">
          ${['Submitted', 'Pending', 'Paid', 'Denied', 'Appealed']
            .map((s) => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`)
            .join('')}
        </select>
      </td>
      <td>
        ${lastDenial ? `<div class="denial">${lastDenial.code}: ${lastDenial.notes}</div>` : ''}
        <button class="small" data-deny="${c.id}">Log denial</button>
      </td>`;
    body.appendChild(tr);
  });

  body.querySelectorAll('select').forEach((sel) => {
    sel.onchange = async () => {
      await fetch(`/api/claims/${sel.dataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: sel.value })
      });
      refresh();
    };
  });

  body.querySelectorAll('[data-deny]').forEach((btn) => {
    btn.onclick = async () => {
      const code = prompt('Denial code (e.g. CO-197):');
      if (!code) return;
      const notes = prompt('Notes (optional):') || '';
      await fetch(`/api/claims/${btn.dataset.deny}/denials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, notes })
      });
      refresh();
    };
  });
}

document.getElementById('claim-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const res = await fetch('/api/claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const errorEl = document.getElementById('form-error');
  if (!res.ok) {
    errorEl.textContent = (await res.json()).error;
    return;
  }
  errorEl.textContent = '';
  e.target.reset();
  refresh();
});

function refresh() {
  loadAging();
  loadClaims();
}

refresh();
