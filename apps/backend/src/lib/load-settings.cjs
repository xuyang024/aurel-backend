// Boot-time helper: prints the store_settings row (secrets included) as JSON so
// medusa-config can configure the Stripe/notification modules from DB values.
// Runs as a short-lived child process from medusa-config via execSync.
// Fail-safe: on ANY error (no DB, table missing pre-migration) prints "{}".
const { Client } = require("pg");

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    process.stdout.write("{}");
    return;
  }
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const { rows } = await client.query(
      `select stripe_secret_key, stripe_webhook_secret, sendgrid_api_key,
              email_from, sendgrid_order_template, sendgrid_welcome_template,
              s3_bucket, s3_region, s3_endpoint, s3_file_url,
              s3_access_key_id, s3_secret_access_key
         from store_settings
        limit 1`
    );
    process.stdout.write(JSON.stringify(rows[0] || {}));
  } catch {
    process.stdout.write("{}");
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
})();
