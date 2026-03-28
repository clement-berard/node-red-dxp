import { kebabCase, mergeWith, pascalCase } from 'es-toolkit';

export function cleanSpaces(str: string) {
  return str.trim().replace(/\n\s+/g, '');
}

export function computeNodeName(name = '') {
  return {
    name,
    dashName: kebabCase(name),
    pascalName: pascalCase(name),
  };
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function mergeConfigs<T extends object>(target: T, source: DeepPartial<T>): T {
  return mergeWith(structuredClone(target), source, (targetVal, sourceVal) => {
    if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
      return [...new Set([...targetVal, ...sourceVal])];
    }
  });
}
