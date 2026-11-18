import type { NodeControllerConfig, NodeControllerInst } from '@keload/node-red-dxp/editor';
import type { Node{{pascalName}}Props } from './types';

export const credentials = {
  user: { type: 'text' },
  password: { type: 'password' },
};

export default function (this: NodeControllerInst<Node{{pascalName}}Props>, config: NodeControllerConfig<Node{{pascalName}}Props>) {
  RED.nodes.createNode(this, config);

  // the nodes that use this config node read these through `RED.nodes.getNode(config.<property>)`
  this.host = config.host;
}
