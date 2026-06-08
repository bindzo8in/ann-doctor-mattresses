const { spawn } = require('child_process');

console.log("Starting prisma migrate dev...");
const child = spawn('npx', ['prisma', 'migrate', 'dev', '--name', 'init_refunds_and_audit'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true
});

setTimeout(() => {
  console.log("Sending 'y' to stdin just in case there is a prompt...");
  child.stdin.write('y\n');
  child.stdin.end();
}, 3000);

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  process.exit(code);
});
