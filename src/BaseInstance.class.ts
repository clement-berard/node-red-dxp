import path from 'node:path';
import { currentInstance } from './current-instance';

export class BaseInstanceClass {
  protected currentInstance: typeof currentInstance;
  protected currentConfig: (typeof currentInstance)['config'];
  protected currentPackagedDistPath: string;

  constructor() {
    this.currentInstance = currentInstance;
    this.currentConfig = this.currentInstance.config;
    this.currentPackagedDistPath = `${path.resolve(__dirname, '..')}`;
  }
}
