import { getUserAgent } from 'package-manager-detector/detect';

export const getPackageManager = () => {
  return getUserAgent() || 'npm';
};
