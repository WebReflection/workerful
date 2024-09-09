import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const minify = process.env.NO_MIN ? [] : [terser()];

export default [
  {
    input: './src/index.js',
    plugins: [
      nodeResolve(),
      commonjs(),
    ].concat(minify),
    output: {
      esModule: true,
      file: './workerful.mjs',
    }
  },
];
