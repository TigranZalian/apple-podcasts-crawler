/*
  PM2 config script
*/
module.exports = {
  apps: [
    {
      name: 'apple-podcasts-crawler',
      script: 'node dist/main',
      max_restarts: 10
    },
  ],
}
