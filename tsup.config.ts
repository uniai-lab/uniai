/** @format */

import { defineConfig } from 'tsup'
import fixCjsExports from 'tsup-fix-cjs-exports'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    splitting: false,
    sourcemap: true,
    clean: true,
    plugins: [fixCjsExports()]
})
