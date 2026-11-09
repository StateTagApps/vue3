import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import fs from 'fs';
import {spawn} from 'child_process';

// The runtime ships as one classic script (app.js) that any website can load from a CDN
// after its own sta-*.js app-layer scripts. The demo index.html is copied into dist with
// the dev module entry swapped for that script.
function demoPage() {
    return {
        name: 'sta-demo-page',
        apply: 'build',
        closeBundle() {
            const html = fs.readFileSync(resolve(import.meta.dirname, 'index.html'), 'utf-8');
            const devEntry = '<script type="module" src="/src/main.js"></script>';

            if (!html.includes(devEntry)) {
                throw new Error('index.html is missing the dev entry: ' + devEntry);
            }

            fs.writeFileSync(
                resolve(import.meta.dirname, 'dist/index.html'),
                html.replace(devEntry, '<script src="/app.js"></script>')
            );
        }
    };
}

// `yarn serve` also starts the local socket.io + gun relays the development env points at.
// They run as their own Node process: imported into Vite's process, the gun relay stored writes
// but never answered reads.
function devServers() {
    return {
        name: 'sta-dev-servers',
        apply: 'serve',
        configureServer(server) {
            const child = spawn(process.execPath, ['dev/servers.js'], {cwd: import.meta.dirname, stdio: 'inherit'});
            const stop = () => child.kill();

            server.httpServer?.once('close', stop);
            process.once('exit', stop);
        }
    };
}

export default defineConfig(({mode}) => ({
    plugins: [vue(), demoPage(), devServers()],

    resolve: {
        alias: {'@': resolve(import.meta.dirname, 'src')}
    },

    define: {
        __STA_VERSION__: JSON.stringify(process.env.npm_package_version),
        // Library mode leaves process.env.NODE_ENV in Vue's code; browsers have no `process`.
        'process.env.NODE_ENV': JSON.stringify(mode)
    },

    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'src/main.js'),
            name: 'StateTagAppRuntime',
            formats: ['iife'],
            fileName: () => 'app.js'
        }
    }
}));
