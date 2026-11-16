import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nativeJsPath = path.resolve(__dirname, '../node_modules/rollup/dist/native.js');

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (!content.includes('@rollup/wasm-node')) {
    content = content.replace(
      'const nativeModule = requireWithFriendlyError(',
      `let nativeModule;
try {
  nativeModule = require(existsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`);
} catch (err) {
  try {
    nativeModule = require('@rollup/wasm-node/dist/native.js');
  } catch (wasmErr) {
    nativeModule = requireWithFriendlyError(existsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`);
  }
}
const _origRequire = (`
    );
    fs.writeFileSync(nativeJsPath, content, 'utf8');
    console.log('[CustomerIQ] Rollup wasm fallback successfully patched.');
  }
}
