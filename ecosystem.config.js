module.exports = {
  apps: [
    {
      name: 'iam-service',
      script: 'dist/apps/iam/main.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        SERVICE_NAME: 'iam'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        SERVICE_NAME: 'iam'
      },
      log_file: './logs/iam-combined.log',
      out_file: './logs/iam-out.log',
      error_file: './logs/iam-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'bpm-service',
      script: 'dist/apps/bpm/main.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        SERVICE_NAME: 'bpm'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        SERVICE_NAME: 'bpm'
      },
      log_file: './logs/bpm-combined.log',
      out_file: './logs/bpm-out.log',
      error_file: './logs/bpm-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'lgm-service',
      script: 'dist/apps/lgm/main.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        SERVICE_NAME: 'lgm'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
        SERVICE_NAME: 'lgm'
      },
      log_file: './logs/lgm-combined.log',
      out_file: './logs/lgm-out.log',
      error_file: './logs/lgm-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'nsm-service',
      script: 'dist/apps/nsm/main.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3004,
        SERVICE_NAME: 'nsm'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3004,
        SERVICE_NAME: 'nsm'
      },
      log_file: './logs/nsm-combined.log',
      out_file: './logs/nsm-out.log',
      error_file: './logs/nsm-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:X-OR-Cloud/nestjs-monorepo-sample.git',
      path: '/var/www/nestjs-monorepo',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:X-OR-Cloud/nestjs-monorepo-sample.git',
      path: '/var/www/nestjs-monorepo-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};
