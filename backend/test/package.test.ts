import got from 'got';
import { Server } from 'http';
import { createApp } from '../src/app';
import { CycleMock, mockData } from './mock';
import { NPMPackage } from '../src/types';
import { getDependencies } from '../src/package';

describe('/package/:name/:version endpoint', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    server = await new Promise((resolve, reject) => {
      const server = createApp().listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          port = addr.port;
          resolve(server);
        } else {
          reject(new Error('Unexpected address ${addr} for server'));
        }
      });
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('responds', async () => {
    const packageName = 'react';
    const packageVersion = '16.13.0';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await got(
      `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    );
    const json = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(json.name).toEqual(packageName);
    expect(json.version).toEqual(packageVersion);
    expect(json.dependencies).toEqual(mockData);
  });

  it('handles cycles', async () => {
    const name = 'loose-envify';
    const version = '1.4.0';
    const mockGot = got as jest.MockedFunction<typeof got>;
    mockGot.mockResolvedValue({
      name: 'loose-envify',
      'dist-tags': {},
      description: '',
      versions: {
        '1.4.0': {
          name: 'loose-envify',
          version: '1.4.0',
          dependencies: {},
        },
      },
    } as NPMPackage);
    const seen = new Set<string>();
    seen.add(`${name}_${version}`);
    const dependencies = await getDependencies(name, version, seen);
    expect(dependencies).toEqual(CycleMock);

    jest.clearAllMocks();
  });
});
