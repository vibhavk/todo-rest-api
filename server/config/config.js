var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  var config = require('./config.json');
  var envConfig = config[env]; //if env === test we will grab test property from config object and similarily for development
  
  Object.keys(envConfig).forEach((key)=>{
    process.env[key] = envConfig[key];
  });

} 