const PACKAGE_NAME_REGEX = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** Reason why `name` is not a valid npm package name, `undefined` when it is valid. */
export function validatePackageName(name: string | undefined): string | undefined {
  if (!name?.trim()) {
    return 'The package name is required';
  }
  if (name.length > 214) {
    return 'The package name is too long (214 characters max)';
  }
  if (!PACKAGE_NAME_REGEX.test(name)) {
    return 'Use lowercase letters, digits and - . _ ~ only, with an optional @scope/ prefix';
  }
  return undefined;
}

/** Folder of a package: its name without the scope (`@scope/node-red-contrib-foo` -> `node-red-contrib-foo`). */
export function getProjectDirName(packageName: string): string {
  return packageName.replace(/^@[^/]+\//, '');
}
