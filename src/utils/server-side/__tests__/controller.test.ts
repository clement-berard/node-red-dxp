import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { evaluateNodeProperty, getREDNode, splitBooleanOutputs, useControllerNode } from '../controller';

// Mock global RED object
const mockRED = {
  nodes: {
    getNode: vi.fn(),
  },
  util: {
    evaluateNodeProperty: vi.fn(),
  },
};

// Make RED available globally
global.RED = mockRED as any;

describe('controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('splitBooleanOutputs', () => {
    const mockMsg = { payload: 'test message' };

    it('should return message in first position when condition is true', () => {
      const result = splitBooleanOutputs(true, mockMsg);
      expect(result).toEqual([mockMsg, null]);
    });

    it('should return message in second position when condition is false', () => {
      const result = splitBooleanOutputs(false, mockMsg);
      expect(result).toEqual([null, mockMsg]);
    });

    it('should handle non-boolean input and return null for both outputs', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(splitBooleanOutputs('true' as any, mockMsg)).toEqual([null, null]);
      expect(splitBooleanOutputs(1 as any, mockMsg)).toEqual([null, null]);
      expect(splitBooleanOutputs(null as any, mockMsg)).toEqual([null, null]);
      expect(splitBooleanOutputs(undefined as any, mockMsg)).toEqual([null, null]);

      expect(consoleSpy).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenCalledWith('Payload must be a boolean (true or false).');

      consoleSpy.mockRestore();
    });

    it('should handle any message type', () => {
      expect(splitBooleanOutputs(true, 'string')).toEqual(['string', null]);
      expect(splitBooleanOutputs(false, 123)).toEqual([null, 123]);
      expect(splitBooleanOutputs(true, { complex: 'object' })).toEqual([{ complex: 'object' }, null]);
      expect(splitBooleanOutputs(false, null)).toEqual([null, null]);
    });
  });

  describe('getREDNode', () => {
    it('should return node when found', () => {
      const mockNode = { id: 'test-node', type: 'test' };
      (mockRED.nodes.getNode as Mock).mockReturnValue(mockNode);

      const result = getREDNode('test-node');

      expect(mockRED.nodes.getNode).toHaveBeenCalledWith('test-node');
      expect(result).toBe(mockNode);
    });

    it('should return null when node not found', () => {
      (mockRED.nodes.getNode as Mock).mockReturnValue(null);

      const result = getREDNode('non-existent-node');

      expect(mockRED.nodes.getNode).toHaveBeenCalledWith('non-existent-node');
      expect(result).toBeNull();
    });

    it('should preserve type information', () => {
      type CustomNode = { customField: string };
      type CustomCreds = { apiKey: string };

      const mockNode = {
        id: 'test-node',
        type: 'test',
        customField: 'value',
        apiKey: 'secret',
      };
      (mockRED.nodes.getNode as Mock).mockReturnValue(mockNode);

      const result = getREDNode<CustomNode, CustomCreds>('test-node');

      expect(result).toBe(mockNode);
      if (result) {
        expect(result.customField).toBe('value');
        // @ts-ignore
        expect(result.apiKey).toBe('secret');
      }
    });
  });

  describe('evaluateNodeProperty', () => {
    const mockNode = { id: 'test-node' } as any;
    const mockMsg = { payload: 'test' } as any;

    it('should resolve with result when evaluation succeeds', async () => {
      (mockRED.util.evaluateNodeProperty as Mock).mockImplementation((_value, _type, _node, _msg, callback) => {
        callback(null, 'evaluated-result');
      });

      const result = await evaluateNodeProperty({
        value: 'test-value',
        type: 'str',
        node: mockNode,
        msg: mockMsg,
      });

      expect(result).toEqual([null, 'evaluated-result']);
      expect(mockRED.util.evaluateNodeProperty).toHaveBeenCalledWith(
        'test-value',
        'str',
        mockNode,
        mockMsg,
        expect.any(Function),
      );
    });

    it('should resolve with error when evaluation fails', async () => {
      const mockError = new Error('Evaluation failed');
      (mockRED.util.evaluateNodeProperty as Mock).mockImplementation((_value, _type, _node, _msg, callback) => {
        callback(mockError, null);
      });

      const result = await evaluateNodeProperty({
        value: 'test-value',
        type: 'jsonata',
        node: mockNode,
        msg: mockMsg,
      });

      expect(result).toEqual([mockError, null]);
    });

    it('should handle synchronous exceptions', async () => {
      const mockError = new Error('Sync error');
      (mockRED.util.evaluateNodeProperty as Mock).mockImplementation(() => {
        throw mockError;
      });

      const result = await evaluateNodeProperty({
        value: 'test-value',
        type: 'str',
        node: mockNode,
        msg: mockMsg,
      });

      expect(result).toEqual([mockError, undefined]);
    });
  });

  describe('useControllerNode', () => {
    const mockNode = { id: 'test-node' } as any;
    const mockMsg = { payload: 'test' } as any;

    beforeEach(() => {
      (mockRED.util.evaluateNodeProperty as Mock).mockImplementation((value, _type, _node, _msg, callback) => {
        // Default mock behavior
        callback(null, value);
      });
    });

    it('should return controller object with expected methods', () => {
      const controller = useControllerNode(mockNode, mockMsg);

      expect(controller).toHaveProperty('evaluateNodeProperty');
      expect(controller).toHaveProperty('quickNodePropertyEval');
      expect(typeof controller.evaluateNodeProperty).toBe('function');
      expect(typeof controller.quickNodePropertyEval).toBe('function');
    });

    describe('evaluateNodeProperty', () => {
      it('should evaluate property with correct parameters', async () => {
        const controller = useControllerNode(mockNode, mockMsg);

        const result = await controller.evaluateNodeProperty('test-value', 'str');

        expect(mockRED.util.evaluateNodeProperty).toHaveBeenCalledWith(
          'test-value',
          'str',
          mockNode,
          mockMsg,
          expect.any(Function),
        );
        expect(result).toEqual([null, 'test-value']);
      });
    });

    describe('quickNodePropertyEval', () => {
      it('should evaluate property from bag object', async () => {
        const controller = useControllerNode(mockNode, mockMsg);
        const bag = {
          testProp: 'test-value',
          testPropType: 'str',
        };

        (mockRED.util.evaluateNodeProperty as Mock).mockImplementation((_value, _type, _node, _msg, callback) => {
          callback(null, 'evaluated-value');
        });

        const result = await controller.quickNodePropertyEval(bag, 'testProp');

        expect(mockRED.util.evaluateNodeProperty).toHaveBeenCalledWith(
          'test-value',
          'str',
          mockNode,
          mockMsg,
          expect.any(Function),
        );
        expect(result).toBe('evaluated-value');
      });

      it('should use custom typed suffix', async () => {
        const controller = useControllerNode(mockNode, mockMsg, { typedSuffix: 'Kind' });
        const bag = {
          testProp: 'test-value',
          testPropKind: 'jsonata',
        };

        await controller.quickNodePropertyEval(bag, 'testProp');

        expect(mockRED.util.evaluateNodeProperty).toHaveBeenCalledWith(
          'test-value',
          'jsonata',
          mockNode,
          mockMsg,
          expect.any(Function),
        );
      });

      it('should apply strict default value when result is empty string', async () => {
        const controller = useControllerNode(mockNode, mockMsg);
        const bag = {
          testProp: 'test-value',
          testPropType: 'str',
        };

        (mockRED.util.evaluateNodeProperty as Mock).mockImplementation((_value, _type, _node, _msg, callback) => {
          callback(null, ''); // empty string
        });

        const result = await controller.quickNodePropertyEval(bag, 'testProp', {
          strictDefaultValue: 'default-value',
        });

        expect(result).toBe('default-value');
      });

      it('should not apply strict default for boolean false', async () => {
        const controller = useControllerNode(mockNode, mockMsg);
        const bag = {
          testProp: 'test-value',
          testPropType: 'bool',
        };

        (mockRED.util.evaluateNodeProperty as Mock).mockImplementation((_value, _type, _node, _msg, callback) => {
          callback(null, false);
        });

        const result = await controller.quickNodePropertyEval(bag, 'testProp', {
          strictDefaultValue: 'default-value',
        });

        expect(result).toBe(false);
      });

      it('should return actual value when not empty', async () => {
        const controller = useControllerNode(mockNode, mockMsg);
        const bag = {
          testProp: 'test-value',
          testPropType: 'str',
        };

        (mockRED.util.evaluateNodeProperty as Mock).mockImplementation((_value, _type, _node, _msg, callback) => {
          callback(null, 'actual-value');
        });

        const result = await controller.quickNodePropertyEval(bag, 'testProp', {
          strictDefaultValue: 'default-value',
        });

        expect(result).toBe('actual-value');
      });

      it('should handle missing type property', async () => {
        const controller = useControllerNode(mockNode, mockMsg);
        const bag = {
          testProp: 'test-value',
          // no testPropType
        };

        await controller.quickNodePropertyEval(bag, 'testProp');

        expect(mockRED.util.evaluateNodeProperty).toHaveBeenCalledWith(
          'test-value',
          undefined,
          mockNode,
          mockMsg,
          expect.any(Function),
        );
      });
    });
  });
});
