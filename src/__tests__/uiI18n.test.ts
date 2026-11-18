import { describe, expect, it } from 'vitest';
import { humanize } from '../ui/i18n.js';

describe('humanize', () => {
  it.each([
    ['name', 'Name'],
    ['inputData', 'Input data'],
    ['splitOut', 'Split out'],
    ['startTime', 'Start time'],
    ['outputProperties', 'Output properties'],
  ])('turns "%s" into "%s"', (key, text) => {
    expect(humanize(key)).toBe(text);
  });
});
