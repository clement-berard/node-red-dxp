import { merge } from 'merge-anything';
import type { EditorNodeDef, EditorNodeInstance, EditorNodeProperties } from 'node-red';
import type { EditorDomHelper } from './types';
import { resolveSelector } from './utils';
export type * from './types';
export * from './utils';
export * from './dom';
export * from './editor-dom-helper';

const defaultNodeDef: Partial<EditorNodeDef> = {};

export function createEditorNode<
  TProps extends EditorNodeProperties,
  TCreds = undefined,
  TInstProps extends TProps = TProps,
>(props: Partial<EditorNodeDef<TProps, TCreds, TInstProps>>): EditorNodeDef<TProps, TCreds, TInstProps> {
  return merge(defaultNodeDef, props) as EditorNodeDef<TProps, TCreds, TInstProps>;
}

function resolveInputKey(selector: string) {
  const realSelector = resolveSelector(selector);
  return realSelector.split('-input-')[1];
}

export function initSelect(
  selector: string,
  options: Record<string, string>[],
  params?: EditorDomHelper.InitSelectParams,
) {
  const realSelector = resolveSelector(selector);
  let realOptions = options;
  if (params?.emptyValue) {
    realOptions = [{ value: '', text: params.emptyValue }, ...options];
  }
  $(realSelector)
    .empty()
    .append(
      realOptions.map((opt) => {
        return $('<option>', { value: opt.value, text: opt.text, selected: opt.value === params?.selected });
      }),
    );
}

export function watchInput<T = any>(selectors: string | string[], callback: (values: T[]) => void) {
  const selectorsArray = Array.isArray(selectors) ? selectors : [selectors];
  const realSelectors = selectorsArray.map(resolveSelector).join(', ');

  $(realSelectors).on('input', () => {
    const values = $(realSelectors)
      .map(function () {
        return $(this).val() as T;
      })
      .get();

    callback(values);
  });
}

export function setInputValue(selector: string, val: string) {
  const realSelector = resolveSelector(selector);
  $(realSelector).val(val);
}

export function setText(selector: string, text: string) {
  const realSelector = resolveSelector(selector);
  $(realSelector).text(text);
}
