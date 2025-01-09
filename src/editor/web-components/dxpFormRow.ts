import { getFormInput, getFormRowElement, getNodeInputId } from './html-helper';

export class DxpFormRow extends HTMLElement {
  private formRowContainer: HTMLDivElement;
  private mainContainer: HTMLDivElement;
  private labelText: string;
  private inputType: string;
  private iconClass: string;
  private rowId: string;

  constructor() {
    super();
    this.formRowContainer = getFormRowElement();
    this.rowId = getNodeInputId(this.getAttribute('row-id') || 'row-id');
    this.labelText = this.getAttribute('label') || 'Label';
    this.inputType = this.getAttribute('type') || 'text';
    this.iconClass = this.getAttribute('icon');

    this.mainContainer = document.createElement('div');
    this.mainContainer.classList.add('main');

    const slotHint = this.querySelector('.hint');
    const checkboxHint = this.querySelector('.checkbox-hint');

    const subMainContainer = document.createElement('div');

    if (this.iconClass) {
      const icon = document.createElement('i');
      icon.classList.add('fa', `fa-${this.iconClass}`);
      subMainContainer.appendChild(icon);
    }

    // label
    const label = document.createElement('label');
    label.setAttribute('for', this.rowId);
    label.textContent = this.labelText;
    subMainContainer.appendChild(label);

    //
    this.mainContainer.appendChild(subMainContainer);

    const formInput = getFormInput({
      type: this.inputType,
      id: this.rowId,
    });

    this.mainContainer.appendChild(formInput);

    if (this.inputType === 'checkbox' && checkboxHint) {
      this.mainContainer.appendChild(checkboxHint);
    }

    this.formRowContainer.appendChild(this.mainContainer);

    if (slotHint) {
      this.formRowContainer.appendChild(slotHint);
    }

    this.appendChild(this.formRowContainer);
  }
}

if (!customElements.get('dxp-form-row')) {
  customElements.define('dxp-form-row', DxpFormRow);
}
