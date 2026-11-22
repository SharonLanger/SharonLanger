import { mkdirSync,writeFileSync,readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root } from './build.ts';
// Preview the generated markup itself; GitHub still determines the final layout.
const readme=readFileSync(resolve(root,'README.md'),'utf8').replaceAll('src="assets/','src="../assets/').replaceAll('srcset="assets/','srcset="../assets/');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Profile preview</title><style>
:root{color-scheme:light dark}body{margin:0;background:#fff;color:#1f2328;font:16px system-ui,sans-serif}main{max-width:896px;margin:0 auto;padding:24px}img{max-width:100%;vertical-align:middle}p{margin:20px 0}a{color:#0969da}@media(prefers-color-scheme:dark){body{background:#0d1117;color:#f0f6fc}a{color:#58a6ff}}
</style></head><body><main>${readme}</main></body></html>`;
mkdirSync(resolve(root,'.profile-preview'),{recursive:true});
writeFileSync(resolve(root,'.profile-preview/index.html'),html);
console.log('Open .profile-preview/index.html in a browser; inspect the PR README on GitHub for final rendering.');
