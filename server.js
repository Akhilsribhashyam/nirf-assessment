// ─────────────────────────────────────────────────────────
//  NIRF Assessment Backend  |  server.js
//  Receives score payload → sends professional email report
// ─────────────────────────────────────────────────────────

require('dotenv').config();
const express  = require('express');
const nodemailer = require('nodemailer');
const cors     = require('cors');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Nodemailer transporter ────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── Grade helper ──────────────────────────────────────────
function getGrade(pct) {
  if (pct >= 87) return { label: 'Excellent',      color: '#10b981', bg: '#022c1e', border: '#064e3b', emoji: '🎯' };
  if (pct >= 70) return { label: 'Good',           color: '#3b82f6', bg: '#0c1a2e', border: '#1d3a5f', emoji: '👍' };
  if (pct >= 50) return { label: 'Needs Work',     color: '#f59e0b', bg: '#1c1200', border: '#3d2800', emoji: '⚠️'  };
  return            { label: 'Revisit Basics',  color: '#ef4444', bg: '#1c0606', border: '#3d0f0f', emoji: '📚' };
}

function getGradeNote(pct) {
  if (pct >= 87) return 'Strong command of TLR methodology — ready for institutional benchmarking work.';
  if (pct >= 70) return 'Solid understanding of TLR. Minor gaps in formula-based questions worth reviewing.';
  if (pct >= 50) return 'Core concepts are clear, but calculation-based components need more practice.';
  return            'Recommend thoroughly re-reading the TLR methodology before re-attempting.';
}

// ── Email HTML builder ────────────────────────────────────
function buildEmailHTML(data) {
  const { name, score, total, pct, catScore, timestamp } = data;
  const grade = getGrade(pct);
  const note  = getGradeNote(pct);
  const date  = timestamp || new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short'
  });

  const catLabels = { c: 'Conceptual', k: 'Calculation', a: 'Applied' };
  let catRowsHTML = '';
  for (const [key, label] of Object.entries(catLabels)) {
    const [got, tot] = catScore[key] || [0, 0];
    if (!tot) continue;
    const catPct = Math.round((got / tot) * 100);
    const barColor = catPct >= 70 ? '#10b981' : catPct >= 50 ? '#3b82f6' : '#f59e0b';
    catRowsHTML += `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #1a2540;color:#94a3b8;font-size:14px;width:140px">${label}</td>
      <td style="padding:14px 20px;border-bottom:1px solid #1a2540;">
        <div style="background:#0d1320;border-radius:4px;height:6px;overflow:hidden">
          <div style="width:${catPct}%;height:100%;background:${barColor};border-radius:4px"></div>
        </div>
      </td>
      <td style="padding:14px 20px;border-bottom:1px solid #1a2540;color:#e2e8f0;font-size:14px;font-weight:700;text-align:right;white-space:nowrap">${got} / ${tot}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NIRF TLR Score Sheet — ${name}</title>
</head>
<body style="margin:0;padding:0;background:#030508;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:32px 16px">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:32px">
    <div style="display:inline-block;background:#0c1a2e;border:1px solid #1d3a5f;border-radius:100px;padding:6px 18px;margin-bottom:20px">
      <span style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#60a5fa">NIRF · TLR PARAMETER ASSESSMENT</span>
    </div>
    <h1 style="font-size:28px;font-weight:800;color:#e2e8f0;margin:0 0 6px;letter-spacing:-0.5px">Score Report</h1>
    <p style="font-size:13px;color:#475569;margin:0">${date}</p>
  </div>

  <!-- Participant -->
  <div style="background:#0d1320;border:1px solid #1a2540;border-radius:16px;padding:20px 24px;margin-bottom:20px;display:flex;align-items:center">
    <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#1d3a5f,#1e2a4a);display:flex;align-items:center;justify-content:center;margin-right:14px;flex-shrink:0">
      <span style="font-size:18px;font-weight:800;color:#60a5fa">${name.charAt(0).toUpperCase()}</span>
    </div>
    <div>
      <div style="font-size:16px;font-weight:700;color:#e2e8f0">${name}</div>
      <div style="font-size:12px;color:#475569;margin-top:2px">Teaching, Learning &amp; Resources · NIRF Ranking Weight: 0.30</div>
    </div>
  </div>

  <!-- Score Hero -->
  <div style="background:${grade.bg};border:1px solid ${grade.border};border-radius:16px;padding:32px 24px;margin-bottom:20px;text-align:center">
    <div style="font-size:64px;font-weight:800;color:${grade.color};line-height:1;margin-bottom:10px;letter-spacing:-2px">${pct}%</div>
    <div style="font-size:11px;color:#475569;margin-bottom:14px">${score} correct answers out of ${total} questions</div>
    <div style="display:inline-block;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:100px;padding:7px 20px">
      <span style="font-size:14px;font-weight:700;color:${grade.color}">${grade.emoji} ${grade.label}</span>
    </div>
    <p style="font-size:13px;color:#64748b;margin:14px 0 0;line-height:1.6">${note}</p>
  </div>

  <!-- Breakdown Table -->
  <div style="background:#0d1320;border:1px solid #1a2540;border-radius:16px;overflow:hidden;margin-bottom:20px">
    <div style="padding:16px 20px;border-bottom:1px solid #1a2540;background:#0a1020">
      <span style="font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#6366f1">Score Breakdown</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #1a2540;color:#94a3b8;font-size:14px;width:140px">Total</td>
        <td style="padding:14px 20px;border-bottom:1px solid #1a2540;">
          <div style="background:#0a1020;border-radius:4px;height:6px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${grade.color};border-radius:4px"></div>
          </div>
        </td>
        <td style="padding:14px 20px;border-bottom:1px solid #1a2540;color:#e2e8f0;font-size:14px;font-weight:700;text-align:right;white-space:nowrap">${score} / ${total}</td>
      </tr>
      ${catRowsHTML}
    </table>
  </div>

  <!-- Sub-component Marks Guide -->
  <div style="background:#0d1320;border:1px solid #1a2540;border-radius:16px;overflow:hidden;margin-bottom:28px">
    <div style="padding:16px 20px;border-bottom:1px solid #1a2540;background:#0a1020">
      <span style="font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#6366f1">TLR Component Reference</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      ${[
        ['SS','Student Strength incl. PhD','20'],
        ['FSR','Faculty-Student Ratio','25'],
        ['FQE','Faculty Qualification & Experience','20'],
        ['FRU','Financial Resources Utilisation','20'],
        ['OE','Online Education','10'],
        ['MIRS','Multiple Entry/Exit, IKS, Regional Lang, SLP','5'],
      ].map(([code, desc, marks], i) => `
      <tr>
        <td style="padding:11px 20px;${i<5?'border-bottom:1px solid #111d30;':''}width:52px">
          <span style="font-size:11px;font-weight:700;color:#6366f1;font-family:monospace">${code}</span>
        </td>
        <td style="padding:11px 20px;${i<5?'border-bottom:1px solid #111d30;':''}color:#64748b;font-size:13px">${desc}</td>
        <td style="padding:11px 20px;${i<5?'border-bottom:1px solid #111d30;':''}color:#94a3b8;font-size:13px;font-weight:600;text-align:right">${marks} marks</td>
      </tr>`).join('')}
    </table>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding-top:8px">
    <p style="font-size:11px;color:#1e293b;margin:0">Generated by ICARE NIRF Assessment Platform &nbsp;·&nbsp; TLR Parameter &nbsp;·&nbsp; Ranking Weight 0.30</p>
  </div>

</div>
</body>
</html>`;
}

// ── POST /submit-score ────────────────────────────────────
app.post('/submit-score', async (req, res) => {
  try {
    const { name, score, total, pct, catScore } = req.body;

    // Basic validation
    if (!name || score === undefined || !total || pct === undefined || !catScore) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short'
    });

    const html    = buildEmailHTML({ name, score, total, pct, catScore, timestamp });
    const grade   = getGrade(pct);
    const subject = `NIRF TLR Score — ${name} | ${pct}% · ${grade.label} | ${timestamp}`;

    await transporter.sendMail({
      from:    `"NIRF Assessment" <${process.env.GMAIL_USER}>`,
      to:      process.env.TRAINER_EMAIL,
      subject,
      html,
      text: `NIRF TLR Assessment Score Sheet\n\nParticipant: ${name}\nScore: ${score}/${total} (${pct}%)\nGrade: ${grade.label}\nDate: ${timestamp}\n\nBreakdown:\nConceptual: ${catScore.c[0]}/${catScore.c[1]}\nCalculation: ${catScore.k[0]}/${catScore.k[1]}\nApplied: ${catScore.a[0]}/${catScore.a[1]}`,
    });

    console.log(`✓ Score sent: ${name} — ${pct}% (${grade.label})`);
    res.json({ success: true, message: 'Score sheet sent successfully.' });

  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. Check server logs.' });
  }
});

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NIRF Assessment Backend', time: new Date().toISOString() });
});

// ── Serve frontend for all other routes ───────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  NIRF Assessment Backend running`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → POST /submit-score  (accepts score payload)`);
  console.log(`  → GET  /health\n`);
});
