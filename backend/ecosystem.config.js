module.exports = {
  apps: [
    {
      name: 'campusarchive-api',
      script: './dist/server.js',
      instances: 1, // Single instance for EC2 Free Tier memory bounds
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M', // Prevents EC2 RAM exhaustion
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
