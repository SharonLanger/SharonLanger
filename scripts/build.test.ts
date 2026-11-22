import test from 'node:test';
import assert from 'node:assert/strict';
import {load, renderProjectTable, renderReadme, validate, outputs} from './build.ts';

const {profile,projects}=load();
test('valid configuration with working repository links',()=>{validate(profile,projects);assert.ok(projects.every(p=>p.links.repo.startsWith('https://')))});
test('three cards per row grows from 3 to 5 without dropping links',()=>{
  const expanded=Array.from({length:5},(_,i)=>({...projects[0],id:'project-'+i,name:'Project '+i}));
  const result=renderProjectTable(expanded,3);
  assert.equal((result.match(/<tr>/g)??[]).length,2);
  assert.equal((result.match(/Repository<\/a>/g)??[]).length,5);
  assert.equal((result.match(/<td /g)??[]).length,6);
});
test('empty optional links never become broken anchors',()=>{const text=renderReadme(profile,projects);assert.ok(!text.includes('href=""'));assert.ok(!text.includes(']( )'));});
test('profile content and checkmarks are data-driven',()=>{const result=renderReadme({...profile,name:'A New Name',headline:'A new headline'},projects);assert.ok(result.includes('A New Name'));assert.ok(result.includes('A new headline'));assert.ok(result.includes('✅'));});
test('reject duplicate IDs and unsafe URLs',()=>{
  assert.throws(()=>validate(profile,[projects[0],projects[0]]),/Duplicate/);
  assert.throws(()=>validate(profile,[{...projects[0],links:{repo:'javascript:alert(1)'}}]),/https/);
});
test('assets are deterministic',()=>{
  const a=outputs(profile,projects),b=outputs(profile,projects);
  assert.deepEqual([...a.entries()],[...b.entries()]);
});
