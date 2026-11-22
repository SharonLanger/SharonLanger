/** SVG project cards. Content and tags are loaded from JSON by build.ts. */
export const escapeXml = (value: string): string => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c] ?? c));
const rect = (x:number,y:number,w:number,h:number,c:string,rx=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}"/>`;
const poly = (points:string,fill:string) => `<polygon points="${points}" fill="${fill}"/>`;
const circle = (x:number,y:number,r:number,fill:string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const text = (x:number,y:number,str:string,size=15,color='#fff',weight=700) => `<text x="${x}" y="${y}" font-size="${size}" font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-weight="${weight}" fill="${color}" letter-spacing=".4">${escapeXml(str)}</text>`;
function projectIcon(kind:string){
 const frame=(body:string)=>`<g transform="translate(22 27)">`+rect(0,0,50,50,'#283a5c',12)+body+'</g>';
 if(kind==='bot')return frame(rect(10,11,30,26,'#b9b4fb',6)+rect(15,17,20,16,'#282f5a',4)+circle(21,24,3,'#79ebf1')+circle(29,24,3,'#79ebf1')+rect(22,5,5,6,'#b9b4fb')+rect(6,20,4,12,'#b9b4fb')+rect(40,20,4,12,'#b9b4fb'));
 if(kind==='bolt')return frame(poly('28,5 13,29 26,29 18,47 42,20 30,21 36,5','#ffbe58'));
 if(kind==='layers')return frame(poly('7,18 25,6 43,18 25,30','#b8a7ff')+poly('7,27 25,39 43,27 43,34 25,47 7,34','#867ae6'));
 if(kind==='flask')return frame(rect(20,7,12,24,'#8de6f0')+poly('19,26 33,26 42,44 10,44','#87e8cf')+rect(17,5,18,5,'#bef5ee'));
 return frame(circle(25,25,18,'#a2b3f7')+text(14,31,'<>',17,'#17213c'));
}
function wrapWords(message:string,maxChars:number,maxLines=3):string[] {
 const words=message.trim().split(/\s+/), lines:string[]=[]; let line='';
 for(const word of words){const next=line?line+' '+word:word; if(next.length>maxChars&&line){lines.push(line);line=word;}else line=next;}
 if(line)lines.push(line);
 if(lines.length>maxLines){const reduced=lines.slice(0,maxLines); reduced[maxLines-1]=reduced[maxLines-1].slice(0,maxChars-1).trimEnd()+'…';return reduced;}
 return lines;
}
export type ArtworkProject={name:string;icon:string;description:string;tags:string[]};
export function cardSvg(project:ArtworkProject):string{
 const w=350,h=235; const lines=wrapWords(project.description,37,3);
 const pills=project.tags.slice(0,3); let px=20;
 const tags=pills.map((tag,i)=>{const tw=Math.min(109,Math.max(54,tag.length*8+20));if(px+tw>334)return '';const out=rect(px,171,tw,27,i===0?'#245aa0':'#343c74',14)+text(px+10,189,tag,12,'#ecf5ff',600);px+=tw+8;return out;}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(project.name)}: ${escapeXml(project.description)}">`
 +rect(2,2,w-4,h-4,'#162132',14)+`<rect x="2" y="2" width="346" height="231" rx="14" fill="none" stroke="#8b82bf" stroke-width="2"/>`
 +projectIcon(project.icon)+text(84,59,project.name.length>19?project.name.slice(0,19)+'…':project.name,19,'#f8f8ff')
 +lines.map((line,i)=>text(20,105+i*21,line,14,'#e0e5f2',400)).join('')
 +tags+rect(20,208,62,4,'#5a9fee',2)+rect(90,208,46,4,'#946fe8',2)+`</svg>`;
}
