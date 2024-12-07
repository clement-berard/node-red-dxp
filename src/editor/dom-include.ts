import { DxpFormRow } from './web-components/dxpFormRow';

if (!customElements.get('dxp-form-row')) {
  customElements.define('dxp-form-row', DxpFormRow);
}
