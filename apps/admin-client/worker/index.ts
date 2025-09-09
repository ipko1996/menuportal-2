/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// Define the shape of the environment bindings.
// ASSETS is a binding to the Cloudflare Pages asset server.
export interface Env {
  ASSETS: Fetcher;
}

export default {
  /**
   * This is the main fetch handler for the worker.
   * @param request - The incoming request.
   * @param env - The environment bindings.
   * @param ctx - The execution context.
   * @returns A promise that resolves to a response.
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle API requests separately.
    if (url.pathname.startsWith('/api/')) {
      const apiResponseData = {
        name: 'Cloudflare',
        message: 'This response came from the API!',
      };

      return new Response(JSON.stringify(apiResponseData), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For all other requests, fetch the static asset from Cloudflare Pages.
    return env.ASSETS.fetch(request);
  },
};
