export function getNodeInputId(id: string) {
  const isConfig = id.startsWith('[config]');
  const realId = id.replace('[config]', '');
  return `node-${isConfig ? 'config-' : ''}input-${realId}`;
}

export function getFormRowElement() {
  const formRowContainer = document.createElement('div');
  formRowContainer.classList.add('dxp-form-row');

  return formRowContainer;
}

type GetFormInputParams = {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'password' | string;
  placeholder?: string;
};

export function getFormInput(params: GetFormInputParams) {
  let wrap: HTMLElement;
  if (['text', 'checkbox', 'password'].includes(params.type)) {
    wrap = document.createElement('input');
    wrap.setAttribute('type', params.type);

    if (params.type === 'text' && params?.placeholder) {
      wrap.setAttribute('placeholder', params.placeholder);
    }
  }

  if (params.type === 'select') {
    wrap = document.createElement('select');
  }

  wrap.setAttribute('id', params.id);

  return wrap;
}
