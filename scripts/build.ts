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
  layout:{projectsPerRow:number;projectsPerPage:number};
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
  assert(Number.isInteger(profile.layout.projectsPerPage)&&profile.layout.projectsPerPage>=1&&profile.layout.projectsPerPage<=12,'layout.projectsPerPage must be 1-12');
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
export function renderProjectTable(items:Project[],columns=3,assetPrefix='assets/'):string{
  if(items.length===0)return '_More projects coming soon._';
  const rows:string[]=[];
  const cardWidth=Math.floor(820/columns);
  for(let index=0;index<items.length;index+=columns){
    const cards=items.slice(index,index+columns).map(p=>
      `<a href="${esc(p.links.repo)}" aria-label="${esc(p.name)} repository"><img src="${assetPrefix}generated/${p.id}.svg" alt="${esc(p.name)} — ${esc(p.description)}" width="${cardWidth}" /></a>`);
    rows.push(`<p align="center">${cards.join(' &nbsp;&nbsp; ')}</p>`);
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
function desktopIdentitySvg(p:Profile,dark:boolean):string{
 const portrait=readFileSync(resolve(root,'assets/avatar-circle.png')).toString('base64');
 const subtitle=wrap(p.headline,17,530,4);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="790" height="178" viewBox="0 0 790 178" role="img" aria-label="${esc(p.name)} — ${esc(p.headline)}">`+
 `<image x="8" y="4" width="168" height="168" href="data:image/png;base64,${portrait}" />`+
 pixelText(220+(550-width(p.name,37))/2,65,p.name,37,dark?'#ffda86':'#694920')+
 subtitle.map((line,i)=>pixelText(220+(550-width(line,17))/2,105+i*28,line,17,dark?'#d3e5fb':'#263c60')).join('')+'</svg>';
}
function profileInfoSvg(p:Profile,dark:boolean,mobile:boolean):string{
 const w=mobile?350:790;
 const left=mobile?4:18;
 const description=wrap(p.about.description,16,mobile?330:350,22);
 const checks=p.about.highlights.flatMap(item=>wrap(item,16,mobile?300:322,6).map((line,i)=>({line,first:i===0})));
 const checksY=70+description.length*25+13;
 const leftEnd=checksY+checks.length*27;
 const toolsX=mobile?4:420;
 const toolsTitleY=mobile?leftEnd+38:40;
 const badgesY=toolsTitleY+28;
 const badgesEnd=badgesY+Math.ceil(p.skills.length/2)*42;
 const h=Math.max(leftEnd,badgesEnd)+18;
 const alt=`About: ${p.about.description}; ${p.about.highlights.join('; ')}. Tech and Tools: ${p.skills.map(s=>s.name).join(', ')}`;
 const foreground=dark?'#e0eaf7':'#253a59';
 const green=dark?'#a7e0cc':'#176047';
 const title=dark?'#f5e7bf':'#614b22';
 const badges=p.skills.map((s,i)=>{
  const x=toolsX+(i%2)*(mobile?174:184),y=badgesY+Math.floor(i/2)*42;
  return `<rect x="${x}" y="${y}" width="${mobile?166:174}" height="35" rx="7" fill="#263454"/>`+
   `<rect x="${x+6}" y="${y+6}" width="27" height="23" rx="4" fill="#416cb4"/>`+
   pixelText(x+8,y+23,s.icon,11,'#fff')+pixelText(x+39,y+24,s.name,13,'#f3f3fc');
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(alt)}">`+
 pixelText(left,40,'About',24,title)+
 description.map((line,i)=>pixelText(left,70+i*25,line,16,foreground)).join('')+
 checks.map((item,i)=>(item.first?`<path d="M${left+9} ${checksY-10+i*27} l5 5 9 -11" fill="none" stroke="${green}" stroke-width="3"/>`:'')+
 pixelText(left+35,checksY+i*27,item.line,16,green)).join('')+
 pixelText(toolsX,toolsTitleY,'Tech & Tools',24,title)+badges+'</svg>';
}
function socialSvg(link:SocialLink):string{
 const label=link.label;const badgeWidth=Math.ceil(width(label,15)+57);
 const icon=link.icon==='github'?'<rect x="13" y="12" width="23" height="18" rx="2" fill="#95bdf1"/><rect x="13" y="9" width="12" height="6" fill="#95bdf1"/>':
 link.icon==='book'?'<path d="M14 12 Q25 9 25 15 Q28 9 39 12 V29 Q29 27 25 33 Q21 27 14 29Z" fill="none" stroke="#95bdf1" stroke-width="2"/>':
 link.icon==='mail'?'<rect x="13" y="12" width="26" height="19" rx="2" fill="none" stroke="#95bdf1" stroke-width="2"/><path d="m14 14 12 9 12 -9" fill="none" stroke="#95bdf1" stroke-width="2"/>':pixelText(14,27,'in',16,'#95bdf1');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeWidth}" height="38" viewBox="0 0 ${badgeWidth} 38" role="img" aria-label="${esc(label)}"><rect width="${badgeWidth}" height="38" rx="7" fill="#243b57"/>${icon}${pixelText(46,25,label,15,'#aee5ff')}</svg>`;
}
function showLinks(links:SocialLink[],base='assets/'):string {return links.filter(l=>l.url!=='').map(l=>`<a href="${esc(l.url)}" aria-label="${esc(l.label)}"><img src="${base}generated/link-${slug(l.label)}.svg" alt="${esc(l.label)}" height="38" /></a>`).join(' ');}
function themed(name:string,alt:string,w:number,base='assets/'):string{
 return `<picture><source media="(prefers-color-scheme: dark)" srcset="${base}generated/${name}-dark.svg" /><img src="${base}generated/${name}-light.svg" alt="${esc(alt)}" width="${w}" /></picture>`;
}
function responsiveIdentity(p:Profile,base='assets/'):string{
 const alt=p.name+' — '+p.headline;
 return `<picture><source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="${base}generated/identity-dark.svg" />`+
 `<source media="(max-width: 600px)" srcset="${base}generated/identity-light.svg" />`+
 `<source media="(prefers-color-scheme: dark)" srcset="${base}generated/identity-desktop-dark.svg" />`+
 `<img src="${base}generated/identity-desktop-light.svg" alt="${esc(alt)}" width="790" /></picture>`;
}
function renderAbout(p:Profile,base='assets/'):string{
 const alt=`About: ${p.about.description}; ${p.about.highlights.join('; ')}. Tech and Tools: ${p.skills.map(s=>s.name).join(', ')}`;
 return `<p align="center"><picture>`+
 `<source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="${base}generated/profile-info-mobile-dark.svg" />`+
 `<source media="(max-width: 600px)" srcset="${base}generated/profile-info-mobile-light.svg" />`+
 `<source media="(prefers-color-scheme: dark)" srcset="${base}generated/profile-info-desktop-dark.svg" />`+
 `<img src="${base}generated/profile-info-desktop-light.svg" alt="${esc(alt)}" width="790" /></picture></p>`;
}
export const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function pageHref(target:number,current:number):string{
 const path=target===0?(current===0?'README.md':'../README.md'):
  (current===0?`projects/page-${target+1}.md`:`page-${target+1}.md`);
 return `${path}#featured-projects`;
}
function projectPager(page:number,total:number,base:string):string{
 if(total<=1)return '';
 const previous=(page-1+total)%total,next=(page+1)%total;
 const control=(target:number,icon:string,label:string,w:number)=>
  `<a href="${pageHref(target,page)}" aria-label="${esc(label)}"><img src="${base}generated/${icon}.svg" alt="${esc(label)}" width="${w}" /></a>`;
 const dots=Array.from({length:total},(_,i)=>control(i,i===page?'pager-dot-active':'pager-dot',`Page ${i+1} of ${total}${i===page?' (current)':''}`,24)).join(' ');
 return `<p align="center">${control(previous,'pager-left',`Previous projects, page ${previous+1} of ${total}`,42)} &nbsp; ${dots} &nbsp; ${control(next,'pager-right',`Next projects, page ${next+1} of ${total}`,42)}</p>`;
}
function pagerIconSvg(name:string):string{
 const start=`<svg xmlns="http://www.w3.org/2000/svg" width="${name.startsWith('pager-dot')?24:42}" height="${name.startsWith('pager-dot')?32:42}" role="img">`;
 if(name==='pager-dot-active')return start+'<circle cx="12" cy="16" r="6" fill="#f7e2b5"/><circle cx="12" cy="16" r="8" fill="none" stroke="#655184" stroke-width="2"/></svg>';
 if(name==='pager-dot')return start+'<circle cx="12" cy="16" r="5" fill="#7b83a3"/></svg>';
 const left=name==='pager-left';
 return start+`<circle cx="21" cy="21" r="18" fill="#24304d" stroke="#9a9ab7" stroke-width="2"/><path d="${left?'m24 13 -8 8 8 8':'m18 13 8 8 -8 8'}" fill="none" stroke="#f2edff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
export function renderReadme(p:Profile,projects:Project[],page=0):string{
 const featured=projects.filter(x=>x.featured);
 const pageCount=Math.max(1,Math.ceil(featured.length/p.layout.projectsPerPage));
 assert(page>=0&&page<pageCount,`Project page ${page+1} does not exist`);
 const base=page===0?'assets/':'../assets/';
 const cards=renderProjectTable(featured.slice(page*p.layout.projectsPerPage,(page+1)*p.layout.projectsPerPage),p.layout.projectsPerRow,base);
 const gallery=`<a name="featured-projects"></a>\n<p align="center">${themed('heading-projects','Featured Projects',350,base)}</p>\n${projectPager(page,pageCount,base)}\n${cards}`;
 if(page>0)return `<!-- GENERATED FILE. Edit data/profile.json or data/projects.json, then run npm run build. -->\n\n${gallery}\n`;
 const links=showLinks(p.links,base);
 return `<!-- GENERATED FILE. Edit data/profile.json or data/projects.json, then run npm run build. -->\n\n`+
 `<p align="center"><img src="${base}hero.webp" alt="Cozy pixel-art cabin at sunset. Sharon codes beside Winston, a cat, and a friendly AI robot." width="100%" /></p>\n\n`+
 `<p align="center">${responsiveIdentity(p,base)}</p>\n`+
 (links?`<p align="center">${links}</p>\n`:'')+`\n`+
 `${gallery}\n\n`+renderAbout(p,base)+`\n\n`+
 `<p align="center"><img src="${base}footer.webp" alt="Winston the dog and a sleeping cat resting in the grass" width="100%" /></p>\n\n`+
 `<!-- Generated with local TypeScript; see CONTRIBUTING.md for editing instructions. -->\n`;
}
export function outputs(profile:Profile,projects:Project[]):Map<string,string>{
 const files=new Map<string,string>();
 files.set('README.md',renderReadme(profile,projects));
 const count=Math.max(1,Math.ceil(projects.filter(p=>p.featured).length/profile.layout.projectsPerPage));
 for(let page=1;page<count;page++)files.set(`projects/page-${page+1}.md`,renderReadme(profile,projects,page));
 for(const name of ['pager-left','pager-right','pager-dot','pager-dot-active'])files.set(`assets/generated/${name}.svg`,pagerIconSvg(name));
 for(const dark of [false,true]){
  const theme=dark?'dark':'light';
  files.set(`assets/generated/identity-${theme}.svg`,identitySvg(profile,dark));
  files.set(`assets/generated/identity-desktop-${theme}.svg`,desktopIdentitySvg(profile,dark));
  files.set(`assets/generated/profile-info-desktop-${theme}.svg`,profileInfoSvg(profile,dark,false));
  files.set(`assets/generated/profile-info-mobile-${theme}.svg`,profileInfoSvg(profile,dark,true));
  files.set(`assets/generated/heading-projects-${theme}.svg`,headingSvg('Featured Projects',dark));
 }
 for(const link of profile.links.filter(l=>l.url))files.set(`assets/generated/link-${slug(link.label)}.svg`,socialSvg(link));
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
 const pagesDir=resolve(root,'projects');
 if(existsSync(pagesDir))for(const name of readdirSync(pagesDir)){
  if(/^page-\d+\.md$/.test(name)&&!files.has(`projects/${name}`)){
   if(check){console.error(`Obsolete project page: ${name}`);mismatches++;}
   else unlinkSync(resolve(pagesDir,name));
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
