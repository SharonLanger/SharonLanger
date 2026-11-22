/** SVG project cards. Content and tags are loaded from JSON by build.ts. */
import { pixelText, width, fit, wrap } from './pixel.ts';
import { iconImage, type IconCatalog } from './icons.ts';
export const escapeXml = (value: string): string => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c] ?? c));
const rect = (x:number,y:number,w:number,h:number,c:string,rx=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}"/>`;
export type ArtworkProject={name:string;icon:string;description:string;tags:string[]};
export function cardSvg(project:ArtworkProject, icons:IconCatalog):string{
 const w=350,h=235; const lines=wrap(project.description,15,310,3);
 const projectIcon = icons[project.icon].image ? icons[project.icon] : icons.project;
 const pills = project.tags.map(id => icons[id]);
 let px=20;
 const tags = pills.map((tag, i) => {
   const tagWidth = tag.image ? 34 : width(tag.label, 12) + 18;
   if (px + tagWidth > 334) return '';
   const badge = rect(px, 171, tagWidth, 27, i === 0 && !tag.image ? '#245aa0' : '#343c74', 8);
   const content = tag.image
     ? iconImage(tag, px + 8, 175, 18)
     : pixelText(px + 9, 189, tag.label, 12, '#ecf5ff');
   px += tagWidth + 8;
   return badge + content;
 }).join('');
 const alt = [project.name, project.description, ...pills.map(tag => tag.label)].join(' — ');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(alt)}">`
 +rect(0,0,w,h,'#162132',12)
 +rect(22,27,50,50,'#283a5c',12)+iconImage(projectIcon,22,27,50)+pixelText(84,59,fit(project.name,18,245),18,'#f8f8ff')
 +lines.map((line,i)=>pixelText(20,105+i*21,line,15,'#e0e5f2')).join('')
 +tags+rect(20,208,62,4,'#5a9fee',2)+rect(90,208,46,4,'#946fe8',2)+`</svg>`;
}
