const API_VERSION = "v1";
const IP_SERVER_API_EXTERNA = "https://testsau.aps.gob.bo";
const MAX_INTENTOS_LOGIN = 5;
const CONFIG_PASSWORD = {
  minLength: 8,
  minChars: 1,
  minNumbers: 1,
  minSpecialChars: 1,
};
const CAPTCHA_KEY =
  process.env.CAPTCHA_KEY || "6LfP1nAmAAAAAMuv_hZ_PqJQFh494BZxBk8lCC-u";
const IP_SERVER_API = "localhost";
const IP_SERVER_DB = process.env.DATABASE_HOST || "localhost";
const PORT_DB = process.env.DATABASE_PORT || 5432;
const PORT_SERVER = process.env.PORT || 3977; // 3977 || 5290
const APP_GUID = "8cb2f01b-fa2a-44bb-9928-746530e7d53c";

const PARAMS_CONNECTION = {
  host: IP_SERVER_DB,
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASS || "navau", //apsadmin2022
  database: process.env.DATABASE_NAME || "APS",
  port: PORT_DB,
};

module.exports = {
  API_VERSION,
  IP_SERVER_API,
  IP_SERVER_DB,
  PORT_DB,
  PARAMS_CONNECTION,
  PORT_SERVER,
  IP_SERVER_API_EXTERNA,
  APP_GUID,
  MAX_INTENTOS_LOGIN,
  CONFIG_PASSWORD,
  CAPTCHA_KEY,
};
