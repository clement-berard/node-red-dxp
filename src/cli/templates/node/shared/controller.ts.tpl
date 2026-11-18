import type { NodeControllerConfig, NodeControllerInst } from '@keload/node-red-dxp/editor';
import type { Node{{pascalName}}Props } from './types';

export default function (this: NodeControllerInst<Node{{pascalName}}Props>, config: NodeControllerConfig<Node{{pascalName}}Props>) {
  RED.nodes.createNode(this, config);

  this.on('input', async (msg) => {
    this.send({
      ...msg,
      payload: config.message,
    });
  });
}
