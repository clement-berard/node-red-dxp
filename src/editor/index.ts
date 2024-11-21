// @ts-ignore
import { merge } from 'merge-anything';
import type { EditorNodeDef, EditorNodeInstance, EditorNodeProperties } from 'node-red';
import type { EditorDomHelper } from './types';
import { resolveSelector } from './utils';
export type * from './types';
export * from './utils';
export * from './dom';

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

export function domHelper<TProps>(vm: EditorNodeInstance) {
  function getVmInputKey(key: string) {
    return vm[key];
  }

  const initSelect = (
    selector: string,
    options: Record<string, string>[],
    params?: EditorDomHelper.InitSelectParams,
  ) => {
    const selectedValue = params?.selected || getVmInputKey(resolveInputKey(selector));
    const realSelector = resolveSelector(selector);
    let realOptions = options;
    if (params?.emptyValue) {
      realOptions = [{ value: '', text: params.emptyValue }, ...options];
    }
    $(realSelector)
      .empty()
      .append(
        realOptions.map((opt) => {
          return $('<option>', { value: opt.value, text: opt.text, selected: opt.value === selectedValue });
        }),
      );
  };

  const getInputValue = (key: Exclude<keyof TProps, 'inputs'>) => {
    const keyStr = key as string;
    return $(`#node-input-${keyStr}`).val();
  };

  function setText(selector: string, text: string) {
    const realSelector = resolveSelector(selector);
    $(realSelector).text(text);
  }

  function jqSelector(selector: string) {
    const realSelector = resolveSelector(selector);
    return $(realSelector);
  }

  function setInputValue(selector: string, val: string) {
    const realSelector = resolveSelector(selector);
    $(realSelector).val(val);
  }

  function watchInput<T = any>(selectors: string | string[], callback: (values: T[]) => void) {
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

  return {
    getInputValue,
    watchInput,
    setText,
    setInputValue,
    jqSelector,
    initSelect,
  };
}
