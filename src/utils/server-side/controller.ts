import type { Node, NodeMessage } from 'node-red';

/**
 * Splits a message into two outputs based on a boolean condition.
 *
 * @param conditionTerm - The condition to evaluate. Expected to be a boolean (`true` or `false`).
 * @param msg - The message object to route based on the condition.
 *
 * @returns An array of two elements:
 * - The first element contains the message if `conditionTerm` is `true`, otherwise `null`.
 * - The second element contains the message if `conditionTerm` is `false`, otherwise `null`.
 *
 * @example
 * const msg = { payload: 'Hello, world!' };
 * const result = splitBooleanOutputs(true, msg);
 * console.log(result); // Output: [{ payload: 'Hello, world!' }, null]
 */
export function splitBooleanOutputs(conditionTerm: boolean, msg: unknown) {
  if (typeof conditionTerm !== 'boolean') {
    console.warn('Payload must be a boolean (true or false).');
    return [null, null];
  }

  return conditionTerm ? [msg, null] : [null, msg];
}

/**
 * Retrieves a node by its ID from the RED.nodes collection. This function returns the node object,
 * which includes any custom fields and credentials associated with it. If the node with the specified
 * ID doesn't exist, the function returns `null`.
 *
 * @template TFields - A generic type that extends an object, representing the additional fields
 *                      associated with the node. This allows the caller to extend the node with custom fields.
 * @template TCreds - A generic type that extends an object, representing the credentials associated with the node.
 *                    This allows the caller to extend the node with custom credentials.
 *
 * @param {string} idNode - The unique identifier of the node to be retrieved.
 *
 * @returns {(Node<TCreds> & TFields) | null} The node object with credentials and additional fields, or `null` if
 *                                            the node cannot be found.
 *
 * @example
 * // Example usage of the getREDNode function
 * const nodeId = 'node123';
 * const node = getREDNode<{customField: string}, {apiKey: string}>(nodeId);
 * if (node) {
 *   console.log(node.customField);  // Accessing custom field
 *   console.log(node.apiKey);       // Accessing node credentials
 * } else {
 *   console.log('Node not found');
 * }
 *
 * // In this example:
 * // - We retrieve the node with ID 'node123'.
 * // - The node is expected to have a custom field called 'customField' and credentials including 'apiKey'.
 *
 * @throws {Error} Throws an error if the `idNode` is invalid or if there are issues retrieving the node.
 */
export function getREDNode<TFields extends {} = {}, TCreds extends {} = {}>(idNode: string) {
  return RED.nodes.getNode(idNode) as (Node<TCreds> & TFields) | null;
}

type EvaluateNodePropertyParams = {
  value: string;
  type: string;
  node: Node;
  msg: NodeMessage;
};

/**
 * Evaluates a node property in the Node-RED environment.
 * This function wraps the `evaluateNodeProperty` utility from `RED.util` and returns a Promise.
 * It resolves with a tuple containing an `Error` (if any) and the evaluation result.
 *
 * The evaluation is performed asynchronously, and the function never rejects.
 * The result will always be a tuple where:
 * - The first element is an `Error` if one occurs during the evaluation, or `undefined` if no error occurs.
 * - The second element is the result of the property evaluation, or `undefined` if no result is produced.
 *
 * **Note**: This function is designed to be used in the context of Node-RED node development.
 * It requires access to the `RED` object and the necessary node properties.
 *
 * @param {EvaluateNodePropertyParams} params - The parameters needed to evaluate the node property.
 * @param {string} params.value - The string representing the value or property to evaluate.
 * @param {string} params.type - The type of the value (e.g., "jsonata", "str").
 * @param {Node} params.node - The Node-RED node performing the evaluation.
 * @param {NodeMessage} params.msg - The message object to be passed into the evaluation.
 *
 * @returns {Promise<[Error | undefined, any | undefined]>} - A promise that resolves with a tuple containing:
 *  - The error (if any) or `undefined` if no error occurs.
 *  - The result of the evaluation or `undefined` if no result is produced.
 *
 * @example
 * // Example usage of evaluateNodeProperty with async/await
 * async function processNodeProperty() {
 *   const params: EvaluateNodePropertyParams = {
 *     value: "msg.payload",
 *     type: "jsonata",
 *     node: myNode,  // assuming myNode is a valid Node object
 *     msg: myMsg,    // assuming myMsg is a valid NodeMessage object
 *   };
 *
 *   const [err, result] = await evaluateNodeProperty(params);
 *
 *   if (err) {
 *     console.error("Error:", err);
 *   } else {
 *     console.log("Evaluation Result:", result);
 *   }
 * }
 *
 * @example
 * // Handling the result when using the promise directly
 * evaluateNodeProperty({
 *   value: "msg.payload.someProperty",
 *   type: "str",
 *   node: myNode,  // assuming myNode is a valid Node object
 *   msg: myMsg,    // assuming myMsg is a valid NodeMessage object
 * })
 * .then(([err, result]) => {
 *   if (err) {
 *     console.error("Error:", err);
 *   } else {
 *     console.log("Result:", result);
 *   }
 * });
 */
export function evaluateNodeProperty(
  params: EvaluateNodePropertyParams,
): Promise<[Error | undefined, any | undefined]> {
  return new Promise((resolve) => {
    try {
      RED.util.evaluateNodeProperty(params.value, params.type, params.node, params.msg, (err, result) => {
        resolve([err, result]);
      });
    } catch (e) {
      resolve([e, undefined]);
    }
  });
}

export function useControllerNode(node: Node, msg: NodeMessage) {
  function evaluateNodePropertyWithDefaults(
    value: EvaluateNodePropertyParams['value'],
    type: EvaluateNodePropertyParams['type'],
  ): Promise<[Error | undefined, any | undefined]> {
    return evaluateNodeProperty({
      value,
      type,
      node,
      msg,
    });
  }

  return {
    evaluateNodeProperty: evaluateNodePropertyWithDefaults,
  };
}
