require('dotenv').config();

module.exports = {
  env: {
    port: process.env.PORT || '6001',
    hostname: 'www.clickablebrand-omg.com',
  },
  mail: {
    host: 'smtp.gmail.com',
    port: 587,
    username: 'omg.robot@ohmygrocery.com',
    password: 'IAmAGroceryRobot!20180716',
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
  imageRepo: 'https://s3-ap-southeast-2.amazonaws.com/grocerymegan62201/grocery/',
  feedbackEmail: 'internal.feedback@ohmygrocery.com',
  orderEmail: 'internal.orders@ohmygrocery.com',
};
