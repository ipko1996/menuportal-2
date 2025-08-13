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
      workspace: '../../libs/clients/src/lib/api/',
      target: './generated/',
      schemas: './schemas',
      override: {
        mutator: {
          path: '../utils/axios-instance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
});
