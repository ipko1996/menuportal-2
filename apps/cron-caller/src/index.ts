export interface Env {
  CRON_SECRET_KEY: string;
  API_URL: string;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('Cron job triggered! Attempting to call the API...');

    try {
      const response = await fetch(env.API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': env.CRON_SECRET_KEY,
        },
        body: JSON.stringify({
          message: 'This call was triggered by a Cloudflare Cron Worker.',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log(`Successfully called API. Status: ${response.status}.`);
      } else {
        const errorText = await response.text();
        console.error(
          `API call failed with status: ${response.status}. Response: ${errorText}`
        );
      }
    } catch (error) {
      console.error('Failed to execute the fetch request:', error);
    }
  },
};
