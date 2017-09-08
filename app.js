"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var config = require('./config/config');
var https = require('https');

var app = express();
var apiSubPath = express();

var cors = require('cors');

var SwaggerExpress = require('swagger-express-mw');

var SwaggerParser = require('swagger-parser');
var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');

var authenticate = require('./middleware/authenticate').authenticate;
var authorize = require('./middleware/authorize').authorize;


// Validate swagger definition
SwaggerParser.validate(config.swaggerFile)
  .then((result) => {
    console.log('.... Validation OK', result.info);
  })
  .catch((err) => {
    console.log('Swagger Error:', err);
  });

// Initialise swagger definition
SwaggerParser.bundle(config.swaggerFile)
  .then((api) => {
    var swaggerConfig = {
      appRoot: __dirname,
      swagger: api,
      swaggerSecurityHandlers: {
        userSecurity: authenticate,
        roles: authorize
      }
    };

    // Initialise swagger express middleware
    SwaggerExpress.create(swaggerConfig, (err, swaggerExpress) => {
      if (err) { throw  err; }

      app.use(cors({
        origin: "*",
        exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Disposition', 'Content-Error'],
        credentials: true
      }));
      app.use(cookieParser());
      app.use(bodyParser.urlencoded({ extended: true}));
      app.use(bodyParser.json());
      app.use(SwaggerUi(swaggerExpress.runner.swagger));
      app.use(express.static(path.join(__dirname, 'public')));

      apiSubPath.use((req, res, next) => {
        res.setHeader('X-Powered-By', 'Chimera');
        next();
      });
      apiSubPath.get('/v1/swagger.json', (req, res) => {
        res.json(api);
      });

      swaggerExpress.register(apiSubPath);

      app.use(apiSubPath);
      app.listen(config.appEnv.port, '0.0.0.0', () => {
        console.log('++++ Server started on ' + config.appEnv.hostname + ':' + config.appEnv.port);
      });

    });

  });

process.on('uncaughtException', function (err) {
  console.log(err);
});
