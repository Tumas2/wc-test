import terser from '@rollup/plugin-terser';

export default [
    // Standard build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/swc.js',
            format: 'umd',
            name: 'SWC',
            sourcemap: true
        }
    },
    // Minified build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/swc.min.js',
            format: 'umd',
            name: 'SWC',
            sourcemap: true
        },
        plugins: [terser()]
    }
];
