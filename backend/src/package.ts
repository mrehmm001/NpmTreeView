import { RequestHandler } from 'express';
import { maxSatisfying } from 'semver';
import got from 'got';
import { DependencyTree, NPMPackage, Package } from './types';

const getPackageCache: Record<string, DependencyTree> = {};
const getDependenciesCache: Record<string, Package> = {};

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;
  const cacheKey = `${name}_${version}`;
  if (cacheKey in getPackageCache) {
    console.log(`Cache hit ${cacheKey}`);
    return res
      .status(200)
      .json({ name, version, dependencies: getPackageCache[cacheKey] });
  }

  const dependencyTree: DependencyTree = {};
  try {
    const npmPackage: NPMPackage = await got(
      `https://registry.npmjs.org/${name}`,
    ).json();

    if (!npmPackage.versions[version]) {
      return res
        .status(404)
        .send(`The version ${version} of ${name} is not found.`);
    }
    const seen = new Set<string>();
    seen.add(cacheKey);
    const dependencies: Record<string, string> =
      npmPackage.versions[version]?.dependencies ?? {};
    for (const [name, range] of Object.entries(dependencies)) {
      const subDep = await getDependencies(name, range, seen);
      dependencyTree[name] = subDep;
    }

    getPackageCache[cacheKey] = dependencyTree;

    return res
      .status(200)
      .json({ name, version, dependencies: dependencyTree });
  } catch (error) {
    return next(error);
  }
};

export async function getDependencies(
  name: string,
  range: string,
  seen: Set<string> = new Set(),
): Promise<Package> {
  const npmPackage: NPMPackage = await got(
    `https://registry.npmjs.org/${name}`,
  ).json();
  const v = maxSatisfying(Object.keys(npmPackage.versions), range);
  const dependencies: DependencyTree = {};

  const cacheKey = `${name}_${v}`;

  if (cacheKey in getDependenciesCache) {
    console.log(`Cache hit ${cacheKey}`);
    return getDependenciesCache[cacheKey];
  }

  if (seen.has(cacheKey)) {
    console.log('Cycle detected');
    return { version: v ?? range, dependencies };
  }

  seen.add(cacheKey);

  if (v) {
    const newDeps = npmPackage.versions[v].dependencies;
    for (const [name, range] of Object.entries(newDeps ?? {})) {
      dependencies[name] = await getDependencies(name, range, seen);
    }
  }

  const result = { version: v ?? range, dependencies };
  getDependenciesCache[cacheKey] = result;
  return result;
}
