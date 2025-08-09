import { defineConfig } from 'orval';

export default defineConfig({
  menuportal: {
    input: {
      target: 'http://localhost:3000/api/docs-json',
    },
    output: {
      client: 'react-query',
      mode: 'tags-split',
      prettier: true,
      target: '../../libs/api-client/src/api.ts',
    },
  },
});
