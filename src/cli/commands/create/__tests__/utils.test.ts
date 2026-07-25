import { getUserAgent } from 'package-manager-detector/detect';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPackageManager } from '../utils';

vi.mock('package-manager-detector/detect', () => ({
  getUserAgent: vi.fn(),
}));

describe('getPackageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the detected package manager agent', () => {
    vi.mocked(getUserAgent).mockReturnValue('pnpm');

    expect(getPackageManager()).toBe('pnpm');
  });

  it('falls back to npm when no agent is detected', () => {
    vi.mocked(getUserAgent).mockReturnValue(null);

    expect(getPackageManager()).toBe('npm');
  });
});
