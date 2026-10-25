// 4pm nudge: for each family, if Aaron hasn't played today (UK time), send one reminder to every device that turned reminders on.
import admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.SA)) });
const db = admin.firestore(), fcm = admin.messaging();
const force = process.env.FORCE === '1';
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/London', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', hour12:false })
  .formatToParts(new Date()).map(p => [p.type, p.value]));
const today = `${parts.year}-${parts.month}-${parts.day}`, hour = +parts.hour;
console.log('UK time', today, hour + ':xx', force ? '(forced test)' : '');
const isSun = new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/London', weekday:'short' }).format(new Date()) === 'Sun';
if (!force && process.env.MODE !== 'report' && !(isSun && hour >= 18 && hour <= 19) && (hour < 16 || hour > 18)) { console.log('Not 4pm in the UK yet, nothing to do.'); process.exit(0); }
const addDays = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const pick = a => a[Math.floor(Math.random() * a.length)];
const daysAgo = d => Math.round((new Date(today + 'T12:00:00Z') - new Date(d + 'T12:00:00Z')) / 864e5);
/* Sunday 6pm: a short weekly report, to grown-up devices only */
async function weeklyReport(){
  const fams = await db.collection('families').listDocuments();
  for (const fam of fams) {
    const toks = (await fam.collection('tokens').get()).docs.filter(t => t.data().grownup);
    if (!toks.length) continue;
    const mark = fam.collection('state').doc('report');
    if (!force && ((await mark.get()).data() || {}).d === today) { console.log(fam.id.slice(0, 4) + '…: report already sent'); continue; }
    let S = {};
    try { S = JSON.parse((await fam.collection('state').doc('progress').get()).data().s || '{}'); } catch (e) {}
    const name = S.name || 'Aaron', prog = Object.entries(S.prog || {});
    const mastered = prog.filter(([k, r]) => r && r.m && !r.wob && r.md && daysAgo(r.md) <= 6).length;
    const days = new Set((S.history || []).filter(x => daysAgo(x.d) <= 6).map(x => x.d)).size;
    const qs = (S.rounds || []).filter(x => daysAgo(x.d) <= 6).reduce((a, x) => a + (x.n || 0), 0);
    const tricky = prog.filter(([k, r]) => r && r.miss > 0 && !(r.m && !r.wob) && r.seen >= 2).sort((a, b) => b[1].miss / b[1].seen - a[1].miss / a[1].seen).slice(0, 3).map(([k]) => k.replace(/^card:/, ''));
    const school = !S.school || !S.school.d || daysAgo(S.school.d) >= 7;
    const body = `${name} played on ${days} of 7 days · ${qs} questions · ${mastered} new word${mastered === 1 ? '' : 's'} mastered.` + (tricky.length ? ` Worth a chat: ${tricky.join(', ')}.` : '') + (school ? ' 📅 Add this week’s school words.' : '');
    let sent = 0;
    for (const t of toks) {
      try { await fcm.send({ token:t.data().t, data:{ title:`${name}’s week 📊`, body, url:'./#report', tag:'cuffin-report' }, webpush:{ headers:{ Urgency:'normal', TTL:'43200' } } }); sent++; }
      catch (e) { console.log('send failed', e.code); if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(e.code)) await t.ref.delete(); }
    }
    await mark.set({ d:today, body });
    console.log(fam.id.slice(0, 4) + '…: report sent to', sent, JSON.stringify(body));
  }
}
function message(S){
  const name = S.name || 'Aaron', d = (S.points || 0) - ((S.race || {}).mf || 0);
  const days = new Set((S.history || []).map(x => x.d).concat(S.freeze || []));
  let streak = 0, x = addDays(today, -1); while (days.has(x)) { streak++; x = addDays(x, -1); }
  if (streak >= 2 && Math.random() < .6) return pick([
    `🔥 Your ${streak}-day streak ends at midnight! Cuffin is guarding it. Nervously.`,
    `🔥 ${streak} days in a row. The puffin community would like it to be ${streak + 1}.`]);
  if (d < 0) return pick([`🪞 The Mirror is ${-d} fish ahead and admiring himself. Cuffin needs you, ${name}!`, `🪞 The Mirror is in front. Four in. Four hold. Four out. Then a match?`]);
  if (d <= 5) return pick([`🪞 The Mirror is catching up! Only ${d} fish in it.`, `🪞 The Mirror has been practising in front of a puddle. Only ${d} fish between you.`]);
  return pick([`🐟 Cuffin is ${d} fish clear. The Mirror is plotting. One quick match?`, `🍮 Cuffin has saved you a seat. And possibly some custard. Match time?`,
    `📓 Cuffin has his book ready. Ten quick questions, ${name}?`]);
}
const reportMode = process.env.MODE === 'report' || (!force && isSun && hour >= 18 && hour <= 19);
if (reportMode) { await weeklyReport(); process.exit(0); }
const fams = await db.collection('families').listDocuments();
let sent = 0;
for (const fam of fams) {
  const toks = await fam.collection('tokens').get();
  if (toks.empty) continue;
  const nudge = fam.collection('state').doc('nudge');
  if (!force && ((await nudge.get()).data() || {}).d === today) { console.log(fam.id.slice(0, 4) + '…: already nudged today'); continue; }
  let S = {};
  try { S = JSON.parse((await fam.collection('state').doc('progress').get()).data().s || '{}'); } catch (e) {}
  const played = S.last === today || (S.history || []).some(x => x.d === today);
  if (played && !force) { console.log(fam.id.slice(0, 4) + '…: played today, no nudge'); continue; }
  const body = message(S);
  for (const t of toks.docs) {
    try {
      await fcm.send({ token:t.data().t, data:{ title:'Cuffin’s Word Quest', body }, webpush:{ headers:{ Urgency:'high', TTL:'14400' } } });
      sent++;
    } catch (e) {
      console.log('send failed', e.code);
      if (['messaging/registration-token-not-registered', 'messaging/invalid-argument', 'messaging/invalid-registration-token'].includes(e.code)) await t.ref.delete();
    }
  }
  await nudge.set({ d:today, body });
  console.log(fam.id.slice(0, 4) + '…: sent', JSON.stringify(body));
}
console.log('done, sent', sent);
