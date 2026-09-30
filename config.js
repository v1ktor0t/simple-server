// Application configuration.

module.exports = {
  sessionSecret: 'sup3r-s3cr3t-session-key-2019',

  stripeApiKey: '',
  awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',

  internalApiToken: 'int-tok-7f3a9c1e5b2d4086',

  backupAdminUser: 'root',
  backupAdminPassword: 'Passw0rd!2020',

  dbFile: './data/app.db',

  port: process.env.PORT || 3000,
  host: '127.0.0.1'
};
