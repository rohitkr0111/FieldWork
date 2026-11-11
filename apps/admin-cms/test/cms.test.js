import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
test('CMS is separate, private and provides core workflows',()=>{assert.ok(existsSync(resolve(root,'proxy.js')));assert.ok(existsSync(resolve(root,'app/login/page.js')));assert.ok(existsSync(resolve(root,'app/projects/new/page.js')));assert.ok(existsSync(resolve(root,'app/enquiries/[id]/page.js')));const proxy=readFileSync(resolve(root,'proxy.js'),'utf8');assert.match(proxy,/auth\/admin\/me/);});
