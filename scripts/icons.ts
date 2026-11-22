import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Icon = { label: string; image?: string };
export type IconCatalog = Record<string, Icon>;

export function loadIcons(root: string): IconCatalog {
  const entries = JSON.parse(readFileSync(resolve(root, 'data/icons.json'), 'utf8')) as Record<string, { label: string; file?: string }>;
  return Object.fromEntries(Object.entries(entries).map(([id, { label, file }]) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || typeof label !== 'string' || !label.trim()) {
      throw new Error(`Invalid icon entry: ${id}`);
    }
    if (file === undefined) return [id, { label }];
    if (typeof file !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/.test(file)) {
      throw new Error(`Icon ${id} must reference an SVG filename in assets/icons`);
    }
    const svg = readFileSync(resolve(root, 'assets/icons', file)).toString('base64');
    return [id, { label, image: `data:image/svg+xml;base64,${svg}` }];
  }));
}

export function iconImage(icon: Icon, x: number, y: number, size: number): string {
  return icon.image
    ? `<image x="${x}" y="${y}" width="${size}" height="${size}" href="${icon.image}" />`
    : '';
}
