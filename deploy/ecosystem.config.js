module.exports = {
  apps: [
    {
      name: 'digo-backend',
      cwd: '/home/ec2-user/digo/backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
      },
    },
    {
      name: 'digo-frontend',
      cwd: '/home/ec2-user/digo/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
}
