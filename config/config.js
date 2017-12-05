require('dotenv').config();

module.exports = {
  env: {
    port: '8081',
    hostname: 'localhost',
  },
  db: {
    hostname: process.env.DB_HOSTNAME || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'grocerx',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'grocerystore',
  },
  swaggerFile: 'api/swagger/swagger.yaml',
  jwtKey: 'pSyv3jJnyERUZlYgeKuHJln9WRx6QsK1V2RYoJPBbsohX3eAl87yTyyqcdEM',
};
