import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cardSvg, escapeXml } from './art.ts';

export type SocialLink = { label:string; icon:string; url:string };
export type Skill = { name:string; icon:string };
export type Profile = {
  name:string; headline:string;
  about:{description:string;highlights:string[]};
  links:SocialLink[]; skills:Skill[];
  layout:{projectsPerRow:number};
};
export type Project = {
  id:string; name:string;icon:string;description:string;tags:string[];
  links:{repo:string;docs?:string;demo?:string};featured:boolean;
};
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const esc=(s:string)=>escapeXml(s);
const assert=(condition:unknown, message:string):asserts condition => {if(!condition)throw new Error(message);};
const allowedUrl=(url:string)=> /^https:\/\//.test(url) && !/[<>"\s]/.test(url);
function requireText(value:unknown,path:string,max=260):asserts value is string {assert(typeof value==='string'&&value.trim().length>0&&value.length<=max,`${path} must be a nonempty string (max ${max})`);}
function validateOptionalLink(url:unknown,path:string){assert(typeof url==='string',`${path} must be a string`);assert(url===''||allowedUrl(url),`${path} must be an https URL or empty`);}
export function validate(profile:Profile, projects:Project[]):void{
  requireText(profile.name,'profile.name',70);requireText(profile.headline,'profile.headline');
  requireText(profile.about.description,'profile.about.description',600);
  assert(Array.isArray(profile.about.highlights),'about.highlights must be an array');
  profile.about.highlights.forEach((x,i)=>requireText(x,`highlight ${i}`));
  assert(Array.isArray(profile.skills),'skills must be an array');
  profile.skills.forEach((s,i)=>{requireText(s.name,`skill ${i}`,35);requireText(s.icon,`skill icon ${i}`,5);});
  assert(Array.isArray(profile.links),'links must be an array');
  profile.links.forEach((l,i)=>{requireText(l.label,`link label ${i}`,40);requireText(l.icon,`link icon ${i}`,30);validateOptionalLink(l.url,`link ${i}`);});
  assert(Number.isInteger(profile.layout.projectsPerRow)&&profile.layout.projectsPerRow>=1&&profile.layout.projectsPerRow<=4,'layout.projectsPerRow must be 1-4');
  assert(Array.isArray(projects),'projects must be an array');
  const ids=new Set<string>();
  for(const [i,p] of projects.entries()){
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id),`projects[${i}].id must be kebab-case`);
    assert(!ids.has(p.id),`Duplicate project id: ${p.id}`);ids.add(p.id);
    requireText(p.name,`project ${p.id} name`,45);requireText(p.icon,`project ${p.id} icon`,30);
    requireText(p.description,`project ${p.id} description`,240);
    assert(typeof p.featured==='boolean',`project ${p.id} featured must be boolean`);
    assert(Array.isArray(p.tags)&&p.tags.length<=3,`project ${p.id} needs 0-3 tags`);
    p.tags.forEach((tag,j)=>requireText(tag,`tag ${p.id}/${j}`,13));
    assert(p.links!==null&&typeof p.links==='object',`project ${p.id} links missing`);
    assert(allowedUrl(p.links.repo),`project ${p.id} requires an https repo URL`);
    for(const field of ['docs','demo'] as const)if(p.links[field]!==undefined)validateOptionalLink(p.links[field],`project ${p.id} ${field}`);
  }
}
export function load():{profile:Profile;projects:Project[]}{
  const profile=JSON.parse(readFileSync(resolve(root,'data/profile.json'),'utf8')) as Profile;
  const projects=(JSON.parse(readFileSync(resolve(root,'data/projects.json'),'utf8')) as {projects:Project[]}).projects;
  validate(profile,projects);return {profile,projects};
}
function skillSvg(s:Skill):string{
  const label=s.name, width=Math.max(116,Math.min(228,label.length*9+67));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="38" viewBox="0 0 ${width} 38" role="img" aria-label="${esc(label)}">`+
    `<rect x="1" y="1" width="${width-2}" height="36" rx="11" fill="#263454" stroke="#7d82ba"/>`+
    `<rect x="8" y="7" width="25" height="24" rx="5" fill="#416cb4"/>`+
    `<text x="20.5" y="24" text-anchor="middle" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">${esc(s.icon)}</text>`+
    `<text x="43" y="24" fill="#f3f3fc" font-family="monospace" font-size="14">${esc(label)}</text></svg>`;
}
export function renderProjectTable(items:Project[],columns=3):string{
  if(items.length===0)return '_More projects coming soon._';
  const rows:string[]=[];
  for(let i=0;i<items.length;i+=columns){
    const section=items.slice(i,i+columns);
    rows.push('<tr>');
    for(const p of section){
      const secondary=(['docs','demo'] as const).filter(key=>p.links[key]).map(key=>`<a href="${esc(p.links[key]!)}">${key==='docs'?'Docs':'Demo'}</a>`).join(' · ');
      rows.push(`<td width="${Math.floor(100/columns)}%" valign="top" align="center"><a href="${esc(p.links.repo)}"><img src="assets/generated/${p.id}.svg" alt="${esc(p.name)} — ${esc(p.description)}" width="100%" /></a><br/><sub><a href="${esc(p.links.repo)}">Repository</a>${secondary?' · '+secondary:''}</sub></td>`);
    }
    for(let empty=section.length;empty<columns;empty++)rows.push(`<td width="${Math.floor(100/columns)}%"></td>`);
    rows.push('</tr>');
  }
  return '<table>\n'+rows.join('\n')+'\n</table>';
}
function showLinks(links:SocialLink[]):string {return links.filter(l=>l.url!=='').map(l=>`<a href="${esc(l.url)}">${l.icon==='github'?'⌘':l.icon==='linkedin'?'in':l.icon==='book'?'▤':'✉'} ${esc(l.label)}</a>`).join(' &nbsp; · &nbsp; ');}
function renderAbout(p:Profile):string{
 const checks=p.about.highlights.map(c=>`<li>✅ ${esc(c)}</li>`).join('');
 const skills=p.skills.map(s=>`<img src="assets/generated/skill-${slug(s.name)}.svg" alt="${esc(s.name)}" height="29" />`).join(' ');
 return `<table>\n<tr>\n<td width="54%" valign="top">\n<h3>🌱 About</h3>\n<p>${esc(p.about.description)}</p>\n<ul>${checks}</ul>\n</td>\n<td width="46%" valign="top">\n<h3>🛠️ Tech &amp; Tools</h3>\n<p>${skills}</p>\n</td>\n</tr>\n</table>`;
}
export const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function renderReadme(p:Profile,projects:Project[]):string{
 const cards=renderProjectTable(projects.filter(x=>x.featured),p.layout.projectsPerRow);
 const links=showLinks(p.links);
 return `<!-- GENERATED FILE. Edit data/profile.json or data/projects.json, then run npm run build. -->\n\n`+
 `<p align="center"><img src="assets/hero.webp" alt="Cozy pixel-art cabin at sunset. Sharon codes beside Winston, a cat, and a friendly AI robot." width="100%" /></p>\n\n`+
 `<table><tr><td width="116" align="center"><img src="assets/avatar.webp" alt="Pixel portrait of ${esc(p.name)}" width="95" /></td>`+
 `<td><h1>${esc(p.name)}</h1><p>${esc(p.headline)}</p>${links?`<p>${links}</p>`:''}</td></tr></table>\n\n`+
 `## 💻 Featured Projects\n\n${cards}\n\n`+renderAbout(p)+`\n\n`+
 `<p align="center"><img src="assets/footer.webp" alt="Winston the dog and a sleeping cat resting in the grass" width="100%" /></p>\n\n`+
 `<!-- Generated with local TypeScript; see CONTRIBUTING.md for editing instructions. -->\n`;
}
export function outputs(profile:Profile,projects:Project[]):Map<string,string>{
 const files=new Map<string,string>();
 files.set('README.md',renderReadme(profile,projects));
 for(const skill of profile.skills)files.set(`assets/generated/skill-${slug(skill.name)}.svg`,skillSvg(skill));
 for(const project of projects.filter(p=>p.featured))files.set(`assets/generated/${project.id}.svg`,cardSvg(project));
 return files;
}
export function run(check=false):void{
 const {profile,projects}=load();const files=outputs(profile,projects);
 let mismatches=0;
 for(const [filename,contents] of files){const target=resolve(root,filename);
  if(check){if(!existsSync(target)||readFileSync(target,'utf8')!==contents){console.error(`Out of date: ${filename}`);mismatches++;}}
  else{mkdirSync(dirname(target),{recursive:true});writeFileSync(target,contents);}
 }
 if(check){if(mismatches)process.exitCode=1;else console.log(`OK: ${files.size} generated files match JSON`);}else console.log(`Generated ${files.size} files from JSON`);
}
// Only execute when directly invoked; allows tests to import pure renderers.
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))run(process.argv.includes('--check'));
