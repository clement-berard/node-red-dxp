import { ipVersion, isIP, isIPv4, isIPv6 } from 'is-ip';

function isUrl(string: string, { lenient = false } = {}) {
  if (typeof string !== 'string') {
    throw new TypeError('isUrl: Expected a string');
  }

  const nString = string.trim();
  if (nString.includes(' ')) {
    return false;
  }

  try {
    new URL(nString); // eslint-disable-line no-new
    return true;
  } catch {
    if (lenient) {
      return isUrl(`https://${nString}`);
    }

    return false;
  }
}

export const validators = {
  isIP,
  isIPv4,
  isIPv6,
  ipVersion,
  isUrl,
};
