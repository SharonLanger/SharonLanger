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
 const gap = 8;
 const badgeBaseWidth = 34;
 const labelWidth = pills.reduce((sum, tag) => sum + (tag.iconOnly ? 0 : width(tag.label, 1)), 0);
 const availableLabelWidth = w - 40 - pills.length * badgeBaseWidth - Math.max(0, pills.length - 1) * gap;
 const labelSize = Math.min(12, availableLabelWidth / Math.max(1, labelWidth));
 let x = 20;
 const tags = pills.map(tag => {
   const badgeWidth = badgeBaseWidth + (tag.iconOnly ? 0 : width(tag.label, labelSize));
   const badge = rect(x, 171, badgeWidth, 27, '#343c74', 8);
   const icon = iconImage(tag, x + 8, 175, 18);
   const label = tag.iconOnly ? '' : pixelText(x + 28, 185 + labelSize / 3, tag.label, labelSize, '#ecf5ff');
   x += badgeWidth + gap;
   return badge + icon + label;
 }).join('');
 const alt = [project.name, project.description, ...pills.map(tag => tag.label)].join(' — ');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(alt)}">`
 +rect(0,0,w,h,'#162132',12)
 +rect(22,27,50,50,'#283a5c',12)+iconImage(projectIcon,22,27,50)+pixelText(84,59,fit(project.name,18,245),18,'#f8f8ff')
 +lines.map((line,i)=>pixelText(20,105+i*21,line,15,'#e0e5f2')).join('')
 +tags+rect(20,208,62,4,'#5a9fee',2)+rect(90,208,46,4,'#946fe8',2)+`</svg>`;
}
