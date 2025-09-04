import type { AxiosRequestConfig } from 'axios';
import Axios, { AxiosError } from 'axios';

// This will be initialized in the setup function
let AXIOS_INSTANCE: ReturnType<typeof Axios.create>;

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | undefined;

export const setupAxiosInstance = (baseURL: string) => {
  AXIOS_INSTANCE = Axios.create({ baseURL });

  AXIOS_INSTANCE.interceptors.request.use(
    async config => {
      if (tokenProvider) {
        const token = await tokenProvider();
        if (token) {
          // console.log('Adding token to request:', `${token.slice(0, 10)}...`);
          // @ts-expect-error any
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        } else {
          console.log('No token available');
        }
      }
      return config;
    },
    // eslint-disable-next-line promise/no-promise-in-callback, promise/prefer-await-to-callbacks
    error => Promise.reject(error)
  );
};

export const setTokenProvider = (provider: TokenProvider) => {
  tokenProvider = provider;
};

// add a second options argument here if you want to pass extra options to each generated query
export const axiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
    // eslint-disable-next-line promise/prefer-await-to-then
  }).then(({ data }) => data);

  // @ts-expect-error any
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// In some case with react-query and swr you want to be able to override the return error type
export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
