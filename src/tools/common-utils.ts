import { dash, pascal } from 'radash';

export function cleanSpaces(str: string) {
  return str.trim().replace(/\n\s+/g, '');
}

export function computeNodeName(inName = '') {
  return {
    name: inName,
    dashName: dash(inName),
    pascalName: pascal(inName),
  };
}
