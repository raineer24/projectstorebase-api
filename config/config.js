require('dotenv').config();

module.exports = {
  env: {
    port: process.env.PORT || '8081',
    hostname: 'localhost',
  },
  db: {
    hostname: process.env.DB_HOSTNAME || 'madbgrocerx01.cvz1mnpjqgvm.ap-southeast-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'grocerx',
    password: process.env.DB_PASSWORD || 'Mast3rrS10WAR',
    name: process.env.DB_NAME || 'grocerystore',
  },
  swaggerFile: 'api/swagger/swagger.yaml',
  jwtKey: 'pSyv3jJnyERUZlYgeKuHJln9WRx6QsK1V2RYoJPBbsohX3eAl87yTyyqcdEM',
};
