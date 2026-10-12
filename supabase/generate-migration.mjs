import fs from 'node:fs/promises';
import { questionBank } from './question-bank.mjs';
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
const seed = questionBank.map(q => `insert into private.levelup_questions(id,idx,question,answer) values (${quote(q.id)},${q.index},${quote(JSON.stringify(q.question))}::jsonb,${quote(q.answer)}) on conflict(id) do update set idx=excluded.idx,question=excluded.question,answer=excluded.answer;`).join('\n');
await fs.mkdir(new URL('./migrations/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('./migrations/202610120001_levelup_accounts.sql',import.meta.url),schema.replace(/commit;\s*$/, seed + '\ncommit;\n'));
console.log('Prepared account schema and 32 server-owned lessons.');
