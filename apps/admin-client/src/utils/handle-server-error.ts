import { AxiosError } from 'axios';
import { toast } from 'sonner';

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error);

  let errMsg = 'Something went wrong!';

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Content not found.';
  }

  if (error instanceof AxiosError) {
    // Check if it's a network error (server not running/unreachable)
    const networkErrorCodes = [
      'ERR_NETWORK',
      'ERR_CONNECTION_REFUSED',
      'ECONNREFUSED',
      'ENOTFOUND',
    ];

    if (!error.response && networkErrorCodes.includes(error.code || '')) {
      errMsg = 'Unexpected error happened';
    } else if (error.response?.data?.title) {
      errMsg = error.response.data.title;
    } else {
      errMsg = 'Unexpected error happened';
    }
  }

  // Ensure we always have a message
  if (!errMsg || errMsg.trim() === '') {
    errMsg = 'Unexpected error happened';
  }

  toast.error(errMsg);
}
