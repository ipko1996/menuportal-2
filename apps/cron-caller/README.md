# Cloudflare Workers - Scheduled Worker

Welcome to your first Cloudflare Workers scheduled worker! This project demonstrates how to create and deploy scheduled tasks that run automatically in the cloud.

## What is a Scheduled Worker?

A scheduled worker is a Cloudflare Worker that runs on a predefined schedule using cron expressions. It's perfect for background tasks, data processing, cleanup jobs, and other automated operations.

## Getting Started

### Development

1. **Start the development server:**

   ```bash
   wrangler dev --local
   ```

2. **Test the scheduled event locally:**

   ```bash
   curl "http://localhost:8787/cdn-cgi/handler/scheduled"
   ```

3. **Check the console output** to see what your worker has logged.

### Configuration

Update the cron trigger in your `wrangler.toml` file to set when your worker should run:

```toml
[triggers]
crons = ["0 */6 * * *"]  # Example: every 6 hours
```

For more cron configuration options, visit the [Cloudflare Workers configuration documentation](https://developers.cloudflare.com/workers/wrangler/configuration/#triggers).

### Deployment

Deploy your worker to Cloudflare's global network:

```bash
wrangler deploy --name my-worker
```

## Resources

- [Cloudflare Workers Scheduled Events Documentation](https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers Examples](https://developers.cloudflare.com/workers/examples/)

## Next Steps

- Customize your scheduled worker's functionality
- Set up monitoring and logging
- Configure environment variables if needed
- Add error handling and retry logic
- Consider using Durable Objects for stateful operations

Happy coding with Cloudflare Workers! 🚀
