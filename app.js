const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
// const fs = require('fs');
const path = require('path');
const config = require('./config/config');
// const https = require('https');
const log = require('color-logs')(true, true, __filename);

const app = express();
const apiSubPath = express();

const cors = require('cors');

const SwaggerParser = require('swagger-parser');
const SwaggerExpress = require('swagger-express-mw');
const SwaggerUi = require('swagger-tools/middleware/swagger-ui');

const { authenticate } = require('./middleware/authenticate').authenticate;
const { authorize } = require('./middleware/authorize').authorize;


// Validate swagger definition
SwaggerParser.validate(config.swaggerFile)
  .then((result) => {
    log.info('Validation OK', result.info);
  })
  .catch((err) => {
    log.info('Swagger Error:', err);
  });

// Initialise swagger definition
SwaggerParser.bundle(config.swaggerFile)
  .then((api) => {
    const swaggerConfig = {
      appRoot: __dirname,
      swagger: api,
      swaggerSecurityHandlers: {
        userSecurity: authenticate,
        roles: authorize,
      },
    };

    // Initialise swagger express middleware
    SwaggerExpress.create(swaggerConfig, (err, swaggerExpress) => {
      if (err) { throw err; }

      app.use(cors({
        origin: '*',
        exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Disposition', 'Content-Error'],
        credentials: true,
      }));
      app.use(cookieParser());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(SwaggerUi(swaggerExpress.runner.swagger));
      app.use(express.static(path.join(__dirname, 'public')));
      app.use(morgan('combined'));

      apiSubPath.use((req, res, next) => {
        res.setHeader('X-Powered-By', 'EOS');
        next();
      });
      apiSubPath.get('/v1/swagger.json', (req, res) => {
        res.json(api);
      });

      swaggerExpress.register(apiSubPath);

      app.use(apiSubPath);
      app.listen(config.env.port, '0.0.0.0', () => {
        log.info(`Server started on ${config.env.hostname}:${config.env.port}`);
      });
    });
  });

process.on('uncaughtException', (err) => {
  log.error(err);
});
