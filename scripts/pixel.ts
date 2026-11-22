/** Deterministic SVG outlines from Silkscreen Regular (SIL OFL 1.1).
 * Source font and license: assets/fonts/. Paths render without viewer fonts or CSS.
 */
import { glyphs } from './pixel-glyphs.ts';

export function width(value:string,size:number):number {
  return [...value].reduce((sum,c)=>sum+(glyphs[c]??glyphs['?'])[0]*size/1000,0);
}
export function pixelText(x:number,y:number,value:string,size:number,color:string):string {
  let offset=0;
  const paths=[...value].map(c=>{
    const [advance,path]=glyphs[c]??glyphs['?'];
    const result=path?`<path d="${path}" transform="translate(${(x+offset).toFixed(2)} ${y}) scale(${size/1000} ${-size/1000})"/>`:'';
    offset+=advance*size/1000;
    return result;
  }).join('');
  return `<g fill="${color}">${paths}</g>`;
}
export function fit(value:string,size:number,maxWidth:number):string {
  if(width(value,size)<=maxWidth)return value;
  let result='';
  for(const c of value){if(width(result+c+'…',size)>maxWidth)break;result+=c;}
  return result+'…';
}
export function wrap(value:string,size:number,maxWidth:number,maxLines:number):string[] {
  const lines:string[]=[];
  let current='';
  for(const word of value.trim().split(/\s+/)){
    const next=current?current+' '+word:word;
    if(current&&width(next,size)>maxWidth){lines.push(current);current=word;}else current=next;
  }
  if(current)lines.push(current);
  if(lines.length>maxLines){const kept=lines.slice(0,maxLines);kept[maxLines-1]=fit(lines.slice(maxLines-1).join(' '),size,maxWidth);return kept;}
  return lines.map(line=>fit(line,size,maxWidth));
}
