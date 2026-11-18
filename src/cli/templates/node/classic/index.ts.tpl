import { createEditorNode, type NodeEditorProps } from '@keload/node-red-dxp/editor';
import { watchInput } from '@keload/node-red-dxp/editor/dom-helper';
import type { Node{{pascalName}}Props } from '../types';

const {{pascalName}} = createEditorNode<NodeEditorProps<Node{{pascalName}}Props>>({
  category: '{{category}}',
  color: '{{color}}',
  defaults: {
    name: { value: '' },
    message: { value: 'hello' },
  },
  inputs: 1,
  outputs: 1,
  icon: 'font-awesome/fa-tower-broadcast',
  label: function () {
    return this.name || '{{pascalName}}';
  },
  oneditprepare: () => {
    // $message == #node-input-message in the DOM
    watchInput('$message', ([message]) => {
      console.log('message', message);
    });
  },
});

export default {{pascalName}};
