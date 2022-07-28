
import tsPlugin from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import pkg from './package.json';
import dts from 'rollup-plugin-dts';
import { defineConfig } from 'rollup'

export default defineConfig([
  {
    input: "./source/index.ts",
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
      // {
      //   format: 'umd',
      //   file: 'dist/index.min.js',
      //   name: 'PackageName',
      // },
    ],
    plugins: [
      tsPlugin(),
      // nodeResolve(),
      // commonjs()
    ],
  },
  /* 单独生成声明文件 */
  {
    input: "./source/index.ts",
    plugins: [dts()],
    output: {
      format: 'esm',
      file: pkg.types,
    },
  },
])