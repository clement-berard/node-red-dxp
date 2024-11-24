class DxpFormRow extends HTMLElement {
  private wrapper: HTMLDivElement;
  constructor() {
    super();

    const iconClass = this.getAttribute('icon');
    const labelText = this.getAttribute('label') || 'Label';
    const inputId = this.getAttribute('input-id') || 'input-id';

    const wrapper = document.createElement('div');
    wrapper.classList.add('dxp-form-row');

    wrapper.innerHTML = `
            <div class="main">
                <div>
                    ${iconClass ? `<i class="fa ${iconClass}"></i>` : ''}
                    <label for="${inputId}" data-i18n="tonton">${labelText}</label>
                </div>
            </div>
        `;

    this.appendChild(wrapper);

    this.wrapper = wrapper;
  }

  connectedCallback() {
    const slotInput = this.querySelector('[slot="main"]');
    const slotHint = this.querySelector('.hint');
    const mainDiv = this.querySelector('.main');

    if (slotInput) {
      mainDiv.appendChild(slotInput);
    }

    if (slotHint) {
      this.wrapper.appendChild(slotHint);
    }
  }
}

customElements.define('dxp-form-row', DxpFormRow);
