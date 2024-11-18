import type { EditorNodeProperties, Node, NodeDef } from 'node-red';

export type NodeControllerConfig<T> = NodeDef & T;
export type NodeControllerInst<T> = Node & T;

export type NodeEditorProps<T> = EditorNodeProperties & T;

export namespace EditorDomHelper {
  export type InitSelectParams = {
    selected?: string;
    emptyValue?: string;
  };
}
