module.exports = {
  env: {
    port: '6001',
    hostname: 'localhost',
  },
  db: {
    hostname: 'madbgrocerx.cvz1mnpjqgvm.ap-southeast-1.rds.amazonaws.com',
    port: 3306,
    username: 'grocerx',
    password: '',
    name: 'grocerystore',
  },
  swaggerFile: 'api/swagger/swagger.yaml',
};
