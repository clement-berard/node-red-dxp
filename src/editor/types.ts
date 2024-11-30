import type { EditorNodeDef, EditorNodeProperties, Node, NodeDef } from 'node-red';

export type NodeControllerConfig<T> = NodeDef & T;
export type NodeControllerInst<T> = Node & T;

export type NodeEditorProps<T = Record<any, any>> = EditorNodeProperties & T;
export type NodeEditorDefinition<
  TProps extends EditorNodeProperties,
  TCreds = undefined,
  TInstProps extends TProps = TProps,
> = EditorNodeDef<TProps, TCreds, TInstProps>;

export namespace EditorDomHelper {
  export type InitSelectParams = {
    selected?: string | number | unknown;
    emptyValue?: string;
  };
}
