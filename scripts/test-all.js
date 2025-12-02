import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function run(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  return typeof res.status === 'number' ? res.status : res.exitCode;
}

const rootDir = process.cwd();
const backendDir = join(rootDir, 'backend');
const venvPython = join(backendDir, '.venv', 'bin', 'python');

console.log('\n Ejecutando pruebas unitarias de backend (pytest)');
let backendExit = 1;
if (existsSync(venvPython)) {
  backendExit = run(venvPython, ['-m', 'pytest', '-q', '--disable-warnings'], { cwd: backendDir });
} else {
  console.warn(' No se encontró \'backend/.venv/bin/python\'. Probando con python3 del sistema...');
  backendExit = run('python3', ['-m', 'pytest', '-q', '--disable-warnings'], { cwd: backendDir });
}

if (backendExit !== 0) {
  console.error('\n Fallaron pruebas de backend. Deteniendo ejecución.');
  process.exit(backendExit || 1);
}

console.log('\n Ejecutando pruebas unitarias de frontend (Karma CI)');
const frontendExit = run('npm', ['run', 'test:ci'], { cwd: rootDir });

if (frontendExit !== 0) {
  console.error('\n Fallaron pruebas de frontend.');
  process.exit(frontendExit || 1);
}

console.log('\n Todas las pruebas unitarias pasaron (backend + frontend).');

