import { describe, expect, it } from 'vitest';
import { validateProperty } from '../../../ui/validation.js';

describe('validateProperty', () => {
  const node = {};

  it('should accept anything without rule', () => {
    expect(validateProperty(undefined, 'x', node)).toBe(true);
    expect(validateProperty({}, '', node)).toBe(true);
  });

  it('should refuse an empty required value', () => {
    expect(validateProperty({ required: true }, '', node)).toBe(false);
    expect(validateProperty({ required: true }, 'a', node)).toBe(true);
  });

  it('should run the validator on the node', () => {
    const rule = {
      validate(this: { max: number }, value: number) {
        return value <= this.max;
      },
    };

    expect(validateProperty(rule, 3, { max: 5 })).toBe(true);
    expect(validateProperty(rule, 9, { max: 5 })).toBe(false);
  });

  it('should coerce a truthy result to a boolean', () => {
    expect(validateProperty({ validate: () => 'yes' as never }, 'a', node)).toBe('yes');
    expect(validateProperty({ validate: () => 1 }, 'a', node)).toBe(true);
    expect(validateProperty({ validate: () => 0 }, 'a', node)).toBe(false);
  });

  it('should return the message of the validator', () => {
    expect(validateProperty({ validate: () => 'Must be a URL' }, 'a', node)).toBe('Must be a URL');
  });

  it('should skip the validator for an empty optional value', () => {
    expect(validateProperty({ required: false, validate: () => false }, '', node)).toBe(true);
  });

  it('should refuse a value when the validator throws', () => {
    expect(
      validateProperty(
        {
          validate: () => {
            throw new Error('boom');
          },
        },
        'a',
        node,
      ),
    ).toBe(false);
  });

  it('should accept an environment variable', () => {
    expect(validateProperty({ validate: () => false }, ['$', '{MY_URL}'].join(''), node)).toBe(true);
    expect(validateProperty({ validate: () => false }, '$(MY_URL)', node)).toBe(true);
  });
});
