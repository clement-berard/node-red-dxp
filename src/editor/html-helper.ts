type CreateNodeInputParams = {
  id: string;
  icon?: string;
  label: string;
};

export function createNodeInput(params: CreateNodeInputParams) {
  const realId = `node-input-${params.id}`;

  //
  const formRowContainer = document.createElement('div');
  formRowContainer.classList.add('dxp-form-row');
  //
  const mainContainer = document.createElement('div');
  mainContainer.classList.add('main');
  //
  const subMainContainer = document.createElement('div');

  if (params?.icon) {
    const icon = document.createElement('i');
    icon.classList.add('fa', `fa-${params.icon}`);
    subMainContainer.appendChild(icon);
  }

  // label
  const label = document.createElement('label');
  label.setAttribute('for', realId);
  label.textContent = params.label;
  subMainContainer.appendChild(label);

  //
  mainContainer.appendChild(subMainContainer);

  // input
  const input = document.createElement('input');
  input.setAttribute('id', realId);
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', params.label);
  mainContainer.appendChild(input);

  formRowContainer.appendChild(mainContainer);

  return formRowContainer;
}
