import { readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=resolve(import.meta.dirname,'..');
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()&&!['.next','node_modules','.turbo','dist','coverage'].includes(entry.name)?files(join(dir,entry.name)):entry.isFile()&&entry.name.endsWith('.js')?[join(dir,entry.name)]:[]);}
const targets=['apps','packages'].flatMap(folder=>files(join(root,folder)));
let failed=false;
for(const file of targets){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0){failed=true;console.error(result.stderr||result.stdout);}}
if(failed)process.exit(1);
console.log(`Syntax checked ${targets.length} JavaScript files.`);
