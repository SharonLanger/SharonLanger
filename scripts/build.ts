import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cardSvg, escapeXml } from './art.ts';
import { pixelText, width, wrap } from './pixel.ts';
import { iconImage, loadIcons, type IconCatalog } from './icons.ts';

export type SocialLink = { label:string; icon:string; url:string };
export type Profile = {
  name:string; headline:string;
  about:{description:string;highlights:string[]};
  links:SocialLink[]; skills:string[];
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
export function validate(profile:Profile, projects:Project[], icons:IconCatalog):void{
  const requireIcon = (id: string) => {
    assert(typeof id === 'string' && Object.hasOwn(icons, id), `Unknown icon or tag ID: ${id}`);
    return icons[id];
  };
  assert(requireIcon('project').image && requireIcon('check').image, 'Project fallback and checklist icons require SVG files');
  requireText(profile.name,'profile.name',70);requireText(profile.headline,'profile.headline');
  requireText(profile.about.description,'profile.about.description',600);
  assert(Array.isArray(profile.about.highlights),'about.highlights must be an array');
  profile.about.highlights.forEach((x,i)=>requireText(x,`highlight ${i}`));
  assert(Array.isArray(profile.skills),'skills must be an array');
  profile.skills.forEach((id,i)=>requireText(requireIcon(id).label,`skill ${i}`,35));
  assert(Array.isArray(profile.links),'links must be an array');
  profile.links.forEach((l,i)=>{requireText(l.label,`link label ${i}`,40);requireIcon(l.icon);validateOptionalLink(l.url,`link ${i}`);});
  assert(Number.isInteger(profile.layout.projectsPerRow)&&profile.layout.projectsPerRow>=1&&profile.layout.projectsPerRow<=4,'layout.projectsPerRow must be 1-4');
  assert(Array.isArray(projects),'projects must be an array');
  const ids=new Set<string>();
  for(const [i,p] of projects.entries()){
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id),`projects[${i}].id must be kebab-case`);
    assert(!ids.has(p.id),`Duplicate project id: ${p.id}`);ids.add(p.id);
    requireText(p.name,`project ${p.id} name`,45);requireIcon(p.icon);
    requireText(p.description,`project ${p.id} description`,240);
    assert(typeof p.featured==='boolean',`project ${p.id} featured must be boolean`);
    assert(Array.isArray(p.tags)&&p.tags.length<=3,`project ${p.id} needs 0-3 tags`);
    p.tags.forEach(id => {
      assert(requireIcon(id).image, `Project ${p.id} tag ${id} requires an SVG in data/icons.json`);
    });
    assert(p.links!==null&&typeof p.links==='object',`project ${p.id} links missing`);
    assert(allowedUrl(p.links.repo),`project ${p.id} requires an https repo URL`);
    for(const field of ['docs','demo'] as const)if(p.links[field]!==undefined)validateOptionalLink(p.links[field],`project ${p.id} ${field}`);
  }
}
export function load():{profile:Profile;projects:Project[];icons:IconCatalog}{
  const profile=JSON.parse(readFileSync(resolve(root,'data/profile.json'),'utf8')) as Profile;
  const projects=(JSON.parse(readFileSync(resolve(root,'data/projects.json'),'utf8')) as {projects:Project[]}).projects;
  const icons = loadIcons(root);
  validate(profile,projects,icons);return {profile,projects,icons};
}
export function renderProjectTable(items:Project[],icons:IconCatalog,columns=3,assetPrefix='assets/'):string{
  if(items.length===0)return '_More projects coming soon._';
  const rows:string[]=[];
  const cardWidth=Math.floor(820/columns);
  for(let index=0;index<items.length;index+=columns){
    const cards=items.slice(index,index+columns).map(p=>{
      const alt = [p.name, p.description, ...p.tags.map(id => icons[id].label)].join(' — ');
      return `<a href="${esc(p.links.repo)}" aria-label="${esc(p.name)} repository"><img src="${assetPrefix}generated/${p.id}.svg" alt="${esc(alt)}" width="${cardWidth}" /></a>`;
    });
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
function profileInfoAlt(p: Profile, icons: IconCatalog): string {
 return `About: ${p.about.description}; ${p.about.highlights.join('; ')}. Tech and Tools: ${p.skills.map(id => icons[id].label).join(', ')}`;
}
function profileInfoSvg(p:Profile,icons:IconCatalog,dark:boolean,mobile:boolean):string{
 const w=mobile?350:790;
 const left=mobile?4:18;
 const description=wrap(p.about.description,16,mobile?330:350,22);
 const checks=p.about.highlights.flatMap(item=>wrap(item,16,mobile?300:322,6).map((line,i)=>({line,first:i===0})));
 const checksY=70+description.length*25+13;
 const leftEnd=checksY+checks.length*27;
 const toolsX=mobile?4:420;
 const toolsTitleY=mobile?leftEnd+38:40;
 const badgesY=toolsTitleY+28;
 const skills = p.skills.map(id => icons[id]);
 const logos = skills.filter(skill => skill.iconOnly);
 const textSkills = skills.filter(skill => !skill.iconOnly);
 const textSkillsY = badgesY + Math.ceil(logos.length / 6) * 52;
 const badgesEnd = textSkillsY + Math.ceil(textSkills.length / 2) * 42;
 const h=Math.max(leftEnd,badgesEnd)+18;
 const alt = profileInfoAlt(p, icons);
 const foreground=dark?'#e0eaf7':'#253a59';
 const green=dark?'#a7e0cc':'#176047';
 const title=dark?'#f5e7bf':'#614b22';
 const logoBadges = logos.map((logo, i) => {
  const x = toolsX + (i % 6) * 55;
  const y = badgesY + Math.floor(i / 6) * 52;
  return `<rect x="${x}" y="${y}" width="43" height="43" rx="7" fill="#263454"/>` + iconImage(logo, x + 7, y + 7, 29);
 }).join('');
 const badges=textSkills.map((skill,i)=>{
  const x=toolsX+(i%2)*(mobile?174:184),y=textSkillsY+Math.floor(i/2)*42;
  const labelOffset = skill.image ? 32 : 10;
  const badgeWidth = mobile ? 166 : 174;
  return `<rect x="${x}" y="${y}" width="${badgeWidth}" height="35" rx="7" fill="#263454"/>`+
   iconImage(skill, x + 8, y + 8, 19) +
   pixelText(x+labelOffset,y+24,wrap(skill.label,13,badgeWidth-labelOffset-8,1)[0],13,'#f3f3fc');
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(alt)}">`+
 pixelText(left,40,'About',24,title)+
 description.map((line,i)=>pixelText(left,70+i*25,line,16,foreground)).join('')+
 checks.map((item,i)=>(item.first?iconImage(icons.check,left+7,checksY-17+i*27,19):'')+
 pixelText(left+35,checksY+i*27,item.line,16,green)).join('')+
 pixelText(toolsX,toolsTitleY,'Tech & Tools',24,title)+logoBadges+badges+'</svg>';
}
function socialSvg(link:SocialLink, icons:IconCatalog):string{
 const label=link.label;
 const icon=icons[link.icon];
 const labelX=icon.image?46:12;
 const badgeWidth=Math.ceil(width(label,15)+labelX+12);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeWidth}" height="38" viewBox="0 0 ${badgeWidth} 38" role="img" aria-label="${esc(label)}"><rect width="${badgeWidth}" height="38" rx="7" fill="#243b57"/>${iconImage(icon,12,7,24)}${pixelText(labelX,25,label,15,'#aee5ff')}</svg>`;
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
function renderAbout(p:Profile,icons:IconCatalog,base='assets/'):string{
 const alt = profileInfoAlt(p, icons);
 return `<p align="center"><picture>`+
 `<source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="${base}generated/profile-info-mobile-dark.svg" />`+
 `<source media="(max-width: 600px)" srcset="${base}generated/profile-info-mobile-light.svg" />`+
 `<source media="(prefers-color-scheme: dark)" srcset="${base}generated/profile-info-desktop-dark.svg" />`+
 `<img src="${base}generated/profile-info-desktop-light.svg" alt="${esc(alt)}" width="790" /></picture></p>`;
}
export const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function renderReadme(p:Profile,projects:Project[],icons:IconCatalog):string{
 const base='assets/';
 const cards=renderProjectTable(projects.filter(x=>x.featured),icons,p.layout.projectsPerRow,base);
 const gallery=`<p align="center">${themed('heading-projects','Featured Projects',350,base)}</p>\n${cards}`;
 const links=showLinks(p.links,base);
 return `<!-- GENERATED FILE. Edit data/profile.json, data/projects.json, or data/icons.json, then run npm run build. -->\n\n`+
 `<p align="center"><img src="${base}hero.webp" alt="Cozy pixel-art cabin at sunset. Sharon codes beside Winston, a cat, and a friendly AI robot." width="100%" /></p>\n\n`+
 `<p align="center">${responsiveIdentity(p,base)}</p>\n`+
 (links?`<p align="center">${links}</p>\n`:'')+`\n`+
 `${gallery}\n\n`+renderAbout(p,icons,base)+`\n\n`+
 `<p align="center"><img src="${base}footer.webp" alt="Winston the dog and a sleeping cat resting in the grass" width="100%" /></p>\n\n`+
 `<!-- Generated with local TypeScript; see CONTRIBUTING.md for editing instructions. -->\n`;
}
export function outputs(profile:Profile,projects:Project[],icons:IconCatalog):Map<string,string>{
 const files=new Map<string,string>();
 files.set('README.md',renderReadme(profile,projects,icons));
 for(const dark of [false,true]){
  const theme=dark?'dark':'light';
  files.set(`assets/generated/identity-${theme}.svg`,identitySvg(profile,dark));
  files.set(`assets/generated/identity-desktop-${theme}.svg`,desktopIdentitySvg(profile,dark));
  files.set(`assets/generated/profile-info-desktop-${theme}.svg`,profileInfoSvg(profile,icons,dark,false));
  files.set(`assets/generated/profile-info-mobile-${theme}.svg`,profileInfoSvg(profile,icons,dark,true));
  files.set(`assets/generated/heading-projects-${theme}.svg`,headingSvg('Featured Projects',dark));
 }
 for(const link of profile.links.filter(l=>l.url))files.set(`assets/generated/link-${slug(link.label)}.svg`,socialSvg(link,icons));
 for(const project of projects.filter(p=>p.featured))files.set(`assets/generated/${project.id}.svg`,cardSvg(project,icons));
 return files;
}
export function run(check=false):void{
 const {profile,projects,icons}=load();const files=outputs(profile,projects,icons);
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
