
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace'

const currentDir = `${process.cwd()}/samples/interactive`;

const plugins = [
  typescript({ tsconfig: `${currentDir}/tsconfig.json` }),

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

if (process.env["BUILD_MODE"] !== 'DEBUG') {
  plugins.push(terser({ format: { comments: false }, compress: true }));
}

export default {
  input: `${currentDir}/src/main.ts`,
  output: {
    file: `${currentDir}/dist/bundle.js`,
    format: 'cjs',
  },
  plugins,
};
