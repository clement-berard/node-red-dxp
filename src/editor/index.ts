import { merge } from 'merge-anything';
import type { EditorNodeDef, EditorNodeProperties } from 'node-red';

export type * from './types';

const defaultNodeDef: Partial<EditorNodeDef> = {};

export function createEditorNode<
  TProps extends EditorNodeProperties,
  TCreds = undefined,
  TInstProps extends TProps = TProps,
>(props: Partial<EditorNodeDef<TProps, TCreds, TInstProps>>): EditorNodeDef<TProps, TCreds, TInstProps> {
  return merge(defaultNodeDef, props) as EditorNodeDef<TProps, TCreds, TInstProps>;
}
