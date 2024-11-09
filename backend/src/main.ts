import * as assert from 'assert';
import * as getPort from 'get-port';
import { createApp } from './app';

async function main() {
  // Initialise the server framework and routing
  const app = createApp();
  const port = 3000;
  app.listen(port, () => {
    console.info(`Server listening on http://localhost:${port}`);
  });
}

main();
