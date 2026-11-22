import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cardSvg, escapeXml } from './art.ts';
import { pixelText, width, wrap } from './pixel.ts';

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
  const label=s.name, badgeWidth=Math.ceil(Math.max(116,width(label,14)+67));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeWidth}" height="38" viewBox="0 0 ${badgeWidth} 38" role="img" aria-label="${esc(label)}">`+
    `<rect x="0" y="0" width="${badgeWidth}" height="38" rx="8" fill="#263454"/>`+
    `<rect x="8" y="7" width="25" height="24" rx="5" fill="#416cb4"/>`+
    pixelText(11,24,s.icon,11,'#fff')+
    pixelText(43,25,label,14,'#f3f3fc')+'</svg>';
}
export function renderProjectTable(items:Project[],columns=3):string{
  if(items.length===0)return '_More projects coming soon._';
  const rows:string[]=[];
  const cardWidth=Math.floor(825/columns);
  for(let i=0;i<items.length;i+=columns){
    const section=items.slice(i,i+columns);
    const cards:string[]=[];
    for(const p of section){
      cards.push(`<a href="${esc(p.links.repo)}" aria-label="${esc(p.name)} repository"><img src="assets/generated/${p.id}.svg" alt="${esc(p.name)} — ${esc(p.description)}" width="${cardWidth}" /></a>`);
    }
    rows.push(`<p align="center">${cards.join(' ')}</p>`);
  }
  return rows.join('\n');
}
function headingSvg(label:string,dark:boolean):string{
 return `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="47" viewBox="0 0 350 47" role="img" aria-label="${esc(label)}">${pixelText(4,32,label,24,dark?'#f5e7bf':'#614b22')}</svg>`;
}
function identitySvg(p:Profile,dark:boolean):string{
 const subtitle=wrap(p.headline,16,334,6);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="${70+subtitle.length*25}" viewBox="0 0 350 ${70+subtitle.length*25}" role="img" aria-label="${esc(p.name)} — ${esc(p.headline)}">`+
 pixelText((350-width(p.name,33))/2,40,p.name,33,dark?'#ffda86':'#694920')+
 subtitle.map((line,i)=>pixelText((350-width(line,16))/2,69+i*25,line,16,dark?'#d3e5fb':'#263c60')).join('')+'</svg>';
}
function aboutSvg(p:Profile,dark:boolean):string{
 const description=wrap(p.about.description,16,330,22);
 const h=20+description.length*25;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="${h}" viewBox="0 0 350 ${h}" role="img" aria-label="${esc(p.about.description)}">`+
 description.map((line,i)=>pixelText(4,24+i*25,line,16,dark?'#e0eaf7':'#253a59')).join('')+'</svg>';
}
function checklistSvg(p:Profile,dark:boolean):string{
 const lines=p.about.highlights.flatMap(item=>wrap(item,16,308,6).map((line,i)=>({line,first:i===0})));
 const h=20+lines.length*27;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="${h}" viewBox="0 0 350 ${h}" role="img" aria-label="${esc(p.about.highlights.join('; '))}">`+
 lines.map((item,i)=>(item.first?`<path d="M14 ${16+i*27} l5 5 9 -11" fill="none" stroke="${dark?'#a7e0cc':'#176047'}" stroke-width="3"/>`:'')+
 pixelText(38,25+i*27,item.line,16,dark?'#a7e0cc':'#176047')).join('')+'</svg>';
}
function socialSvg(link:SocialLink):string{
 const label=link.label;const badgeWidth=Math.ceil(width(label,15)+32);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeWidth}" height="38" viewBox="0 0 ${badgeWidth} 38" role="img" aria-label="${esc(label)}"><rect width="${badgeWidth}" height="38" rx="7" fill="#243b57"/>${pixelText(16,25,label,15,'#aee5ff')}</svg>`;
}
function showLinks(links:SocialLink[]):string {return links.filter(l=>l.url!=='').map(l=>`<a href="${esc(l.url)}" aria-label="${esc(l.label)}"><img src="assets/generated/link-${slug(l.label)}.svg" alt="${esc(l.label)}" height="38" /></a>`).join(' ');}
function themed(name:string,alt:string,w:number):string{
 return `<picture><source media="(prefers-color-scheme: dark)" srcset="assets/generated/${name}-dark.svg" /><img src="assets/generated/${name}-light.svg" alt="${esc(alt)}" width="${w}" /></picture>`;
}
function renderAbout(p:Profile):string{
 const skills=p.skills.map(s=>`<img src="assets/generated/skill-${slug(s.name)}.svg" alt="${esc(s.name)}" height="38" />`).join(' ');
 return `<p align="center">${themed('heading-about','About',350)}</p>\n`+
 `<p align="center">${themed('about',p.about.description,350)} ${themed('checklist',p.about.highlights.join('; '),350)}</p>\n`+
 `<p align="center">${themed('heading-tools','Tech and Tools',350)}</p>\n`+
 `<p align="center">${skills}</p>`;
}
export const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function renderReadme(p:Profile,projects:Project[]):string{
 const cards=renderProjectTable(projects.filter(x=>x.featured),p.layout.projectsPerRow);
 const links=showLinks(p.links);
 return `<!-- GENERATED FILE. Edit data/profile.json or data/projects.json, then run npm run build. -->\n\n`+
 `<p align="center"><img src="assets/hero.webp" alt="Cozy pixel-art cabin at sunset. Sharon codes beside Winston, a cat, and a friendly AI robot." width="100%" /></p>\n\n`+
 `<p align="center"><img src="assets/avatar-circle.webp" alt="Full circular pixel portrait of ${esc(p.name)}" width="168" /></p>\n`+
 `<p align="center">${themed('identity',p.name+' — '+p.headline,350)}</p>\n`+
 (links?`<p align="center">${links}</p>\n`:'')+`\n`+
 `<p align="center">${themed('heading-projects','Featured Projects',350)}</p>\n${cards}\n\n`+renderAbout(p)+`\n\n`+
 `<p align="center"><img src="assets/footer.webp" alt="Winston the dog and a sleeping cat resting in the grass" width="100%" /></p>\n\n`+
 `<!-- Generated with local TypeScript; see CONTRIBUTING.md for editing instructions. -->\n`;
}
export function outputs(profile:Profile,projects:Project[]):Map<string,string>{
 const files=new Map<string,string>();
 files.set('README.md',renderReadme(profile,projects));
 for(const dark of [false,true]){
  const theme=dark?'dark':'light';
  files.set(`assets/generated/identity-${theme}.svg`,identitySvg(profile,dark));
  files.set(`assets/generated/about-${theme}.svg`,aboutSvg(profile,dark));
  files.set(`assets/generated/checklist-${theme}.svg`,checklistSvg(profile,dark));
  files.set(`assets/generated/heading-projects-${theme}.svg`,headingSvg('Featured Projects',dark));
  files.set(`assets/generated/heading-about-${theme}.svg`,headingSvg('About',dark));
  files.set(`assets/generated/heading-tools-${theme}.svg`,headingSvg('Tech & Tools',dark));
 }
 for(const link of profile.links.filter(l=>l.url))files.set(`assets/generated/link-${slug(link.label)}.svg`,socialSvg(link));
 for(const skill of profile.skills)files.set(`assets/generated/skill-${slug(skill.name)}.svg`,skillSvg(skill));
 for(const project of projects.filter(p=>p.featured))files.set(`assets/generated/${project.id}.svg`,cardSvg(project));
 return files;
}
export function run(check=false):void{
 const {profile,projects}=load();const files=outputs(profile,projects);
 let mismatches=0;
 const generatedDir=resolve(root,'assets/generated');
 if(existsSync(generatedDir))for(const name of readdirSync(generatedDir)){
  if(name.endsWith('.svg')&&!files.has(`assets/generated/${name}`)){
   if(check){console.error(`Obsolete generated asset: ${name}`);mismatches++;}
   else unlinkSync(resolve(generatedDir,name));
  }
 }
 for(const [filename,contents] of files){const target=resolve(root,filename);
  if(check){if(!existsSync(target)||readFileSync(target,'utf8')!==contents){console.error(`Out of date: ${filename}`);mismatches++;}}
  else{mkdirSync(dirname(target),{recursive:true});writeFileSync(target,contents);}
 }
 if(check){if(mismatches)process.exitCode=1;else console.log(`OK: ${files.size} generated files match JSON`);}else console.log(`Generated ${files.size} files from JSON`);
}
// Only execute when directly invoked; allows tests to import pure renderers.
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))run(process.argv.includes('--check'));
