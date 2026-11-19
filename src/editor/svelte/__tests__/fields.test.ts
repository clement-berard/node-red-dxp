import { describe, expect, it } from 'vitest';
import { typedFieldDefaults } from '../fields';

describe('typedFieldDefaults', () => {
  it('should default the type to the value type', () => {
    expect(typedFieldDefaults('timeout', { value: 5000, valueType: 'num' })).toEqual({
      timeout: { value: 5000 },
      timeoutType: { value: 'num' },
    });
  });

  it('should start from another type, for a node that inherits', () => {
    const defaults = typedFieldDefaults('timeout', { value: 5000, valueType: 'num', type: 'from_client' });

    expect(defaults.timeoutType).toEqual({ value: 'from_client' });
  });

  it('should carry the required flag only when given', () => {
    expect(typedFieldDefaults('a', { value: '', valueType: 'str' }).a).not.toHaveProperty('required');
    expect(typedFieldDefaults('a', { value: '', valueType: 'str', required: true }).a).toEqual({
      value: '',
      required: true,
    });
  });
});
