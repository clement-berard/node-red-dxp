import { dash, pascal } from 'radash';

export function cleanSpaces(str: string) {
  return str.trim().replace(/\n\s+/g, '');
}

export function computeNodeName(name = '') {
  return {
    name,
    dashName: dash(name),
    pascalName: pascal(name),
  };
}
