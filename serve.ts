import { createServer } from 'node:http';
import { readFile } from 'node:fs';
import { resolve, join, extname, relative } from 'node:path';

const port = Number(process.env.PORT || 8080);
const gameRoot = resolve('game');

const contentTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = resolve(join(gameRoot, requested));
  const withinGame = filePath === gameRoot || relative(gameRoot, filePath).split('/').every(part => part !== '..' && part !== '');
  if (!withinGame) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const type = contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type });
    response.end(data);
  });
}).listen(port, () => {
  console.log(`SKYWARDEN at http://localhost:${port}`);
});
