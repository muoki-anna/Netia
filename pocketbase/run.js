import { spawn } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === 'win32';
const bin = path.join(__dirname, isWin ? 'pocketbase.exe' : 'pocketbase');

const child = spawn(bin, process.argv.slice(2), {
	cwd: __dirname,
	stdio: 'inherit'
});

child.on('exit', (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
	} else {
		process.exit(code ?? 0);
	}
});

child.on('error', (err) => {
	console.error(`Failed to start PocketBase binary at ${bin}:`, err);
	process.exit(1);
});
