// Run locally after `firebase login`. No token, OAuth secret, or student data is
// printed or written to this repository. Requests are confined to this project.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { questionBank } from './question-bank.mjs';
const require = createRequire(import.meta.url);
const firebaseAuth = require('firebase-tools/lib/auth');
const project = 'zehnedu-1';
const owner = firebaseAuth.getGlobalDefaultAccount();
if (!owner?.tokens?.refresh_token) throw new Error('Run firebase login first.');
const credentials = await firebaseAuth.getAccessToken(owner.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase']);
const accessToken = credentials.access_token;
async function api(host, path, method = 'GET', body) {
  const response = await fetch('https://' + host + path, { method, headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  if (!response.ok) { const e = new Error(`${response.status} ${result.error?.status || 'request failed'}: ${result.error?.message || 'No detail'}`); e.status = response.status; throw e; }
  return result;
}
const projectPath = '/v1/projects/' + project;
const action = process.argv[2];
if (action === 'inspect') {
  for (const [name, host, path] of [
    ['auth', 'identitytoolkit.googleapis.com', '/admin/v2/projects/' + project + '/config'],
    ['google', 'identitytoolkit.googleapis.com', '/admin/v2/projects/' + project + '/defaultSupportedIdpConfigs/google.com'],
    ['databases', 'firestore.googleapis.com', projectPath + '/databases'],
    ['rules', 'firebaserules.googleapis.com', projectPath + '/releases/cloud.firestore']
  ]) {
    try { const value = await api(host, path);
      if (name === 'auth') console.log(JSON.stringify({ name, authorizedDomains: value.authorizedDomains, projectNumber: value.name }));
      if (name === 'google') console.log(JSON.stringify({ name, enabled: value.enabled, hasClientId: !!value.clientId, hasSecret: !!value.clientSecret }));
      if (name === 'databases') console.log(JSON.stringify({ name, databases: value.databases?.map(d => ({ name: d.name, location: d.locationId, type: d.type })) || [] }));
      if (name === 'rules') { const rules = await api('firebaserules.googleapis.com', '/v1/' + value.rulesetName); console.log(JSON.stringify({ name, files: rules.source?.files?.map(f => ({ name: f.name, content: f.content })) })); }
    } catch (e) { console.log(JSON.stringify({ name, error: e.message })); }
  }
} else if (action === 'seed') {
  const encode = value => typeof value === 'string' ? { stringValue: value } : typeof value === 'number' ? { integerValue: String(value) } : typeof value === 'boolean' ? { booleanValue: value } : Array.isArray(value) ? { arrayValue: { values: value.map(encode) } } : { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k,v]) => [k, encode(v)])) } };
  const writes = questionBank.flatMap(q => [
    { update: { name: `projects/${project}/databases/(default)/documents/questions/${q.id}`, fields: Object.fromEntries(Object.entries(q.question).map(([k,v]) => [k,encode(v)])) } },
    { update: { name: `projects/${project}/databases/(default)/documents/answerKeys/${q.id}`, fields: { index: encode(q.index), cycle: encode(Math.floor(q.index / 4)), answer: encode(q.answer) } } }
  ]);
  writes.push({ update: { name: `projects/${project}/databases/(default)/documents/policy/access`, fields: { developerEmail: encode(owner.user.email) } } });
  const result = await api('firestore.googleapis.com', projectPath + '/databases/(default)/documents:commit', 'POST', { writes });
  console.log(JSON.stringify({ project, seededQuestions: questionBank.length, policyConfigured: true, commitTime: result.commitTime }));
} else if (action === 'owner') {
  if (!owner.user.email_verified || !owner.user.sub) throw new Error('A verified Google CLI account is required.');
  const authPath = '/v1/projects/' + project + '/accounts';
  let lookup = await api('identitytoolkit.googleapis.com', authPath + ':lookup', 'POST', { email: [owner.user.email] });
  if (!lookup.users?.length) {
    const uid = 'developer-' + randomUUID();
    const uploaded = await api('identitytoolkit.googleapis.com', authPath + ':batchCreate', 'POST', {
      sanityCheck: true, allowOverwrite: false,
      users: [{ localId: uid, email: owner.user.email, emailVerified: true, providerUserInfo: [{ providerId: 'google.com', rawId: owner.user.sub, email: owner.user.email }] }]
    });
    if (uploaded.error?.length) throw new Error('Developer account import failed: ' + uploaded.error.map(e => e.message).join(', '));
    lookup = await api('identitytoolkit.googleapis.com', authPath + ':lookup', 'POST', { email: [owner.user.email] });
  }
  const uid = lookup.users?.[0]?.localId;
  if (!uid) throw new Error('No developer identity was found.');
  const walletPath = `projects/${project}/databases/(default)/documents/accounts/${uid}`;
  let wallet;
  try { wallet = await api('firestore.googleapis.com', '/v1/' + walletPath); } catch(e) { if(e.status !== 404) throw e; }
  const stamp = { timestampValue: new Date().toISOString() };
  const fields = wallet?.fields || { credits:{integerValue:'0'},earned:{integerValue:'0'},cursor:{integerValue:'0'},phase:{stringValue:'idle'},questionId:{stringValue:''},answer:{stringValue:''},startedAt:stamp,lastEarnAt:stamp,passUntil:stamp,updatedAt:stamp };
  fields.role={stringValue:'developer'};
  await api('firestore.googleapis.com', projectPath+'/databases/(default)/documents:commit','POST',{writes:[{update:{name:walletPath,fields}}]});
  console.log(JSON.stringify({ project, developerAccountCreated: true, role: 'developer', googleLinked: lookup.users[0].providerUserInfo?.some(p => p.providerId === 'google.com') || false }));
} else if (action === 'enable-api') {
  for (const service of ['firestore.googleapis.com', 'firebaserules.googleapis.com']) {
    const result = await api('serviceusage.googleapis.com', `/v1/projects/${project}/services/${service}:enable`, 'POST', {});
    console.log(JSON.stringify({ service, operation: result.name, done: result.done || false }));
  }
} else if (action === 'database') {
  const result = await api('firestore.googleapis.com', projectPath + '/databases?databaseId=(default)', 'POST', { locationId: 'asia-south1', type: 'FIRESTORE_NATIVE' });
  console.log(JSON.stringify({ operation: result.name, done: result.done || false }));
} else if (action === 'domains') {
  const path = '/admin/v2/projects/' + project + '/config';
  const current = await api('identitytoolkit.googleapis.com', path);
  const authorizedDomains = [...new Set([...(current.authorizedDomains || []), 'elshod-gosling.github.io', 'levelup-learning-arcade.awareeel4.chatgpt.site', 'localhost', '127.0.0.1'])];
  const result = await api('identitytoolkit.googleapis.com', path + '?updateMask=authorizedDomains', 'PATCH', { authorizedDomains });
  console.log(JSON.stringify({ project, authorizedDomains: result.authorizedDomains }));
} else if (action === 'google') {
  const path = '/admin/v2/projects/' + project + '/defaultSupportedIdpConfigs/google.com';
  const current = await api('identitytoolkit.googleapis.com', path);
  if (!current.clientId || !current.clientSecret) throw new Error('Enable the Google provider in the Firebase console first; no client secret belongs in this repository.');
  const result = await api('identitytoolkit.googleapis.com', path + '?updateMask=enabled', 'PATCH', { enabled: true });
  console.log(JSON.stringify({ project, googleEnabled: result.enabled }));
} else if (action === 'config') {
  const appId = process.argv[3]; if (!appId) throw new Error('Supply the registered web app ID.');
  const result = await api('firebase.googleapis.com', '/v1beta1/projects/' + project + '/webApps/' + encodeURIComponent(appId) + '/config');
  const config = { apiKey: result.apiKey, authDomain: result.authDomain, projectId: result.projectId, appId: result.appId };
  await fs.writeFile('dist/account-config.mjs', '// Public Firebase web identifiers. Administrative credentials never belong here.\nexport const firebaseConfig = ' + JSON.stringify(config, null, 2) + ';\n');
  console.log(JSON.stringify({ project, appId, configured: true }));
} else { throw new Error('Choose inspect, seed, owner, enable-api, database, domains, google, or config.'); }
