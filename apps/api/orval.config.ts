import { defineConfig } from 'orval';

export default defineConfig({
  menuportal: {
    input: {
      target: 'http://localhost:3000/api/docs-json',
    },
    output: {
      namingConvention: 'kebab-case',
      client: 'react-query',
      mode: 'tags-split',
      prettier: true,
      target: '../../libs/clients/src/lib/api/',
      schemas: '../../libs/clients/src/lib/api/schemas',
    },
  },
});
