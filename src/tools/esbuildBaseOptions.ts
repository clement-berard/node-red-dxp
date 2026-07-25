type EsbuildBaseOptionsParams = {
  minify: boolean;
};

export function getEsbuildBaseOptions({ minify }: EsbuildBaseOptionsParams) {
  return {
    bundle: true,
    minify,
    loader: { '.ts': 'ts' as const },
  };
}
