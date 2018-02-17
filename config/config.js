require('dotenv').config();

module.exports = {
  env: {
    port: process.env.PORT || '8081',
    hostname: 'localhost',
  },
  mail: {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 465,
    username: 'AKIAJGOLHIDD37QJLHMA',
    password: 'Aq1PVRxdh4FDZnZH6Iu2aNpXyy2TDKNVVlf34fhkVxcB',
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
