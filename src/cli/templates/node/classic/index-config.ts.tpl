import { createEditorNode, type NodeEditorProps } from '@keload/node-red-dxp/editor';
import type { Node{{pascalName}}Props } from '../types';

interface NodeCredentials {
  user: string;
  password: string;
}

const {{pascalName}} = createEditorNode<NodeEditorProps<Node{{pascalName}}Props>, NodeCredentials>({
  category: 'config',
  color: '#a6bbcf',
  defaults: {
    name: { value: '' },
    host: { value: 'localhost', required: true },
  },
  credentials: {
    user: { type: 'text' },
    password: { type: 'password' },
  },
  inputs: 1,
  outputs: 1,
  icon: 'font-awesome/fa-server',
  label: function () {
    return this.name || this.host || '{{pascalName}}';
  },
});

export default {{pascalName}};
