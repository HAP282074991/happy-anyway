import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['miniprogram/**/*.js', 'node_modules/**'] },
  ...tseslint.configs.recommended,
);
