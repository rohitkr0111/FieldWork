import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const app=resolve(import.meta.dirname,'../app');
test('public catalogue routes and lead form are present',()=>{for(const file of ['page.js','projects/page.js','projects/[slug]/page.js','industries/page.js','industries/[slug]/page.js','categories/[slug]/page.js','testimonials/page.js','contact/page.js','privacy/page.js','terms/page.js'])assert.ok(existsSync(resolve(app,file)),`${file} exists`);const source=readFileSync(resolve(app,'components.js'),'utf8');assert.match(source,/contactConsent/);assert.match(source,/\+91/);});
