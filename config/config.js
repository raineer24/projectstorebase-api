require('dotenv').config();

module.exports = {
  env: {
    port: process.env.PORT || '6001',
    hostname: 'localhost',
  },
  mail: {
    host: 'smtp.gmail.com',
    port: 587,
    username: 'info.eos.omg@gmail.com',
    password: '246sgewg',
  },
  db: {
    hostname: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    name: process.env.RDS_DB_NAME,
  },
  swaggerFile: 'api/swagger/swagger.yaml',
  jwtKey: 'pSyv3jJnyERUZlYgeKuHJln9WRx6QsK1V2RYoJPBbsohX3eAl87yTyyqcdEM',
};
