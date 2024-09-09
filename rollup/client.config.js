import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const minify = process.env.NO_MIN ? [] : [terser()];
const plugins = [
  nodeResolve(),
].concat(minify);

export default [
  {
    input: './src/window.js',
    plugins,
    output: {
      esModule: false,
      file: './src/window.mjs',
      format: 'iife',
    }
  },
  {
    input: './src/worker.js',
    plugins,
    output: {
      esModule: true,
      file: './src/worker.mjs',
    }
  },
];
