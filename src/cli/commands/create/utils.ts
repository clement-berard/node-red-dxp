import type { AgentName } from 'package-manager-detector';
import { getUserAgent } from 'package-manager-detector/detect';

export const getPackageManager = (): AgentName => {
  return getUserAgent() || 'npm';
};
