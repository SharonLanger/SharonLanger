import test from 'node:test';
import assert from 'node:assert/strict';
import {load, renderProjectTable, renderReadme, validate, outputs} from './build.ts';

const {profile,projects,icons}=load();
test('valid configuration with repository links',()=>{validate(profile,projects,icons);assert.ok(projects.every(p=>p.links.repo.startsWith('https://')))});
test('three to six cards retain order, link the entire image and render complete rows',()=>{
  for(const count of [3,4,5,6]){
    const expanded=Array.from({length:count},(_,i)=>({...projects[0],id:'project-'+i,name:'Project '+i,links:{repo:`https://github.com/example/project-${i}`}}));
    const result=renderProjectTable(expanded,icons,2);
    assert.equal((result.match(/<p align="center">/g)??[]).length,Math.ceil(count/2));
    assert.ok(!result.includes('<details>'));
    assert.equal((result.match(/<a href=/g)??[]).length,count);
    assert.equal((result.match(/<img /g)??[]).length,count);
    assert.equal((result.split('</p>')[0].match(/<a href=/g)??[]).length,2);
    assert.ok(result.includes('width="410"'));
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
test('showcases only the three selected repositories on one page',()=>{
 const files=outputs(profile,projects,icons),readme=files.get('README.md')!;
 assert.deepEqual(projects.filter(p=>p.featured).map(p=>p.id),['agent-playbook','claude-backstage','system-one-harness']);
 assert.equal((readme.match(/aria-label="[^"]+ repository"/g)??[]).length,3);
 for(const project of projects){
  assert.equal(readme.includes(`href="${project.links.repo}"`),project.featured);
  assert.equal(files.has(`assets/generated/${project.id}.svg`),project.featured);
 }
 assert.ok(!readme.includes('pager-'));
 assert.ok(![...files.keys()].some(path=>path.startsWith('projects/')));
 assert.match(readme,/aria-label="All projects"/);
 assert.match(readme,/href="https:\/\/github.com\/SharonLanger\?tab=repositories"/);
});
test('mobile selects an identity without the portrait and retains full cards',()=>{
 const files=outputs(profile,projects,icons),readme=files.get('README.md')!;
 assert.match(readme,/media="\(max-width: 600px\)" srcset="assets\/generated\/identity-light.svg"/);
 assert.match(readme,/agent-playbook\.svg/);
 assert.ok(!readme.includes('agent-playbook-mobile.svg'));
 assert.ok(!files.get('assets/generated/identity-light.svg')!.includes('<image'));
 assert.match(files.get('assets/generated/identity-desktop-light.svg')!,/data:image\/png;base64,/);
 assert.ok(!readme.includes('src="assets/avatar-circle'));
});
test('empty optional links remain hidden',()=>{const text=renderReadme(profile,projects,icons);assert.ok(!text.includes('href=""'));assert.ok(!text.includes('LinkedIn'));});
test('profile SVGs reflect changed text and escape markup',()=>{
  const changed={...profile,name:'A New Name',headline:'A new headline',about:{description:'Hello <world>',highlights:['Build & share']}};
  const files=outputs(changed,projects,icons);
  assert.match(files.get('assets/generated/identity-dark.svg')!,/A New Name/);
  assert.match(files.get('assets/generated/identity-desktop-dark.svg')!,/A New Name/);
  assert.match(files.get('assets/generated/profile-info-mobile-dark.svg')!,/Hello &lt;world&gt;/);
  assert.match(files.get('assets/generated/profile-info-mobile-dark.svg')!,/Build &amp; share/);
  assert.match(files.get('assets/generated/profile-info-desktop-dark.svg')!,/Tech and Tools/);
  assert.match(files.get('assets/generated/profile-info-desktop-dark.svg')!,/x="420"/);
  assert.match(files.get('assets/generated/profile-info-mobile-dark.svg')!,/width="350"/);
  assert.match(files.get('README.md')!,/A New Name/);
  assert.ok(!files.get('README.md')!.includes('<table'));
});
test('reject duplicate IDs and unsafe URLs',()=>{
  assert.throws(()=>validate(profile,[projects[0],projects[0]],icons),/Duplicate/);
  assert.throws(()=>validate(profile,[{...projects[0],links:{repo:'javascript:alert(1)'}}],icons),/https/);
});
test('generated assets are deterministic',()=>{
  assert.deepEqual([...outputs(profile,projects,icons).entries()],[...outputs(profile,projects,icons).entries()]);
});

test('shared icons render on cards, tools and links while text-only tags keep their names',()=>{
  const files=outputs(profile,projects,icons);
  const card=files.get('assets/generated/agent-playbook.svg')!;
  const tools=files.get('assets/generated/profile-info-mobile-dark.svg')!;
  const repositories=files.get('assets/generated/link-all-projects.svg')!;
  assert.ok(card.includes(icons['agent-playbook'].image!));
  assert.ok(card.includes(icons.python.image!));
  assert.ok(tools.includes(icons.python.image!));
  assert.ok(tools.includes(icons.github.image!));
  assert.ok(repositories.includes(icons.github.image!));
  assert.match(card,/aria-label="[^"]*Python — Agents — Orchestration"/);
  const withLinkedIn={...profile,links:profile.links.map(link=>link.icon==='linkedin'?{...link,url:'https://www.linkedin.com/in/example/'}:link)};
  assert.ok(outputs(withLinkedIn,projects,icons).get('assets/generated/link-linkedin.svg')!.includes(icons.linkedin.image!));
  assert.throws(()=>validate(profile,[{...projects[0],tags:['unknown-tag']}],icons),/Unknown icon or tag ID/);
});
