require('dotenv').config();

module.exports = {
  env: {
    port: process.env.PORT || '8081',
    hostname: 'localhost',
  },
  mail: {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 465,
    username: 'AKIAJZ6UKFL2FPMX57PQ',
    password: '8+VcMds0KFMO4wQ5Qxz5pI5sH8LwBhha7aZKCXjA',
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
