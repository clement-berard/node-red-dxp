import { type CurrentContext, type ListNodesFull, currentContext } from './current-context';

type ContextParams = {
  withInit?: boolean;
};

export class Context {
  public listNodesFull!: ListNodesFull;
  readonly current: CurrentContext;

  constructor(params?: ContextParams) {
    const { withInit = true } = params || {};
    this.current = currentContext;
    if (withInit) {
      this.init();
    }
  }

  init() {
    this.listNodesFull = currentContext.getListNodesFull();
  }
}
