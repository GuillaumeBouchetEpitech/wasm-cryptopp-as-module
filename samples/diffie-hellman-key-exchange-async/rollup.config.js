import { dirname, join as joinPath } from 'path';
import { fileURLToPath } from 'url';

// __dirname for es6
const __dirname = dirname(fileURLToPath(import.meta.url));

import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace'

const isRelease = process.env["BUILD_MODE"] !== 'DEBUG';

const _getProjectName = () => {
  const buildType = process.env["BUILD_TYPE"];
  switch (buildType) {
    case "MAIN":
      return "main";
    case "WORKER":
      return "worker-diffie-hellman";
    default:
      throw new Error(`unknown build type: "${buildType}"`);
  }
}

const projectName = _getProjectName();

const plugins = [
  typescript({
    tsconfig: joinPath(__dirname, "projects", projectName, "tsconfig.json"),
  }),

  replace({
    preventAssignment: true,
    // remove word boundaries
    delimiters: ['', ''],
    // remove what would become 'require("wasmCryptoppJs")'
    values: {
      "import wasmCryptoppJs from \"wasmCryptoppJs\";": "",
    },
  }),

];

if (isRelease) {
  plugins.push(terser({ format: { comments: false }, compress: true }));
}

export default {
  input: joinPath(__dirname, "projects", projectName, "src", "main.ts"),
  output: {
    file: joinPath(__dirname, "dist", `${projectName}.js`),
    format: 'cjs',
  },
  plugins,
};
