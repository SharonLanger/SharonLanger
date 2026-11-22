import test from 'node:test';
import assert from 'node:assert/strict';
import {load, renderProjectTable, renderReadme, validate, outputs} from './build.ts';

const {profile,projects}=load();
test('valid configuration with repository links',()=>{validate(profile,projects);assert.ok(projects.every(p=>p.links.repo.startsWith('https://')))});
test('three to six cards retain order, link the entire image and reveal pairs',()=>{
  for(const count of [3,4,5,6]){
    const expanded=Array.from({length:count},(_,i)=>({...projects[0],id:'project-'+i,name:'Project '+i,links:{repo:`https://github.com/example/project-${i}`}}));
    const result=renderProjectTable(expanded,2);
    assert.equal((result.match(/<p align="center">/g)??[]).length,Math.ceil(count/2));
    assert.equal((result.match(/<details>/g)??[]).length,Math.ceil(count/2)-1);
    assert.equal((result.match(/<a href=/g)??[]).length,count);
    assert.equal((result.match(/<picture>/g)??[]).length,count);
    assert.equal((result.match(/-mobile\.svg/g)??[]).length,count);
    assert.equal((result.split('<details>')[0].match(/<a href=/g)??[]).length,2);
    assert.ok(!/<table|<td|Repository<\/a>|stroke=/i.test(result));
    expanded.forEach((item,i)=>{
      const anchor=`<a href="${item.links.repo}"`;
      assert.ok(result.includes(anchor));
      if(i)assert.ok(result.indexOf(anchor)>result.indexOf(`<a href="${expanded[i-1].links.repo}"`));
    });
  }
});
test('actual project list starts in the requested order and uses verified links',()=>{
 assert.deepEqual(projects.slice(0,3).map(p=>p.id),['agent-playbook','claude-backstage','system-one-harness']);
 assert.equal(projects.length,9);
 assert.ok(projects.every(p=>p.links.repo.startsWith('https://github.com/SharonLanger/')));
});
test('mobile selects compact cards and an identity without the portrait',()=>{
 const files=outputs(profile,projects),readme=files.get('README.md')!;
 assert.match(readme,/media="\(max-width: 600px\)" srcset="assets\/generated\/identity-light.svg"/);
 assert.match(readme,/agent-playbook-mobile\.svg/);
 assert.ok(!files.get('assets/generated/identity-light.svg')!.includes('<image'));
 assert.match(files.get('assets/generated/identity-desktop-light.svg')!,/data:image\/png;base64,/);
 assert.ok(!readme.includes('src="assets/avatar-circle'));
});
test('empty optional links remain hidden',()=>{const text=renderReadme(profile,projects);assert.ok(!text.includes('href=""'));assert.ok(!text.includes('LinkedIn'));});
test('profile SVGs reflect changed text and escape markup',()=>{
  const changed={...profile,name:'A New Name',headline:'A new headline',about:{description:'Hello <world>',highlights:['Build & share']}};
  const files=outputs(changed,projects);
  assert.match(files.get('assets/generated/identity-dark.svg')!,/A New Name/);
  assert.match(files.get('assets/generated/identity-desktop-dark.svg')!,/A New Name/);
  assert.match(files.get('assets/generated/about-dark.svg')!,/Hello &lt;world&gt;/);
  assert.match(files.get('assets/generated/checklist-dark.svg')!,/Build &amp; share/);
  assert.match(files.get('README.md')!,/A New Name/);
  assert.ok(!files.get('README.md')!.includes('<table'));
});
test('reject duplicate IDs and unsafe URLs',()=>{
  assert.throws(()=>validate(profile,[projects[0],projects[0]]),/Duplicate/);
  assert.throws(()=>validate(profile,[{...projects[0],links:{repo:'javascript:alert(1)'}}]),/https/);
});
test('generated assets are deterministic',()=>{
  assert.deepEqual([...outputs(profile,projects).entries()],[...outputs(profile,projects).entries()]);
});
