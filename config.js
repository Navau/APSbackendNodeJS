const API_VERSION = "v1";
const IP_SERVER_API = "localhost";
// const IP_SERVER_DB = "localhost";
// const PORT_DB = process.env.DATABASE_PORT || 5432;
const IP_SERVER_DB = "ec2-54-208-104-27.compute-1.amazonaws.com";
const PORT_DB = 5432;
const PORT_SERVER = process.env.PORT || 3977; // 3977 || 5290

const PARAMS_CONNECTION = {
  host: IP_SERVER_DB,
  user: "ykhduorprqqmpc",
  password: "5b12f443b747ce6f316951a669a769f2a63aa0cf7af8767342718f5754d5803e", //apsadmin2022
  database: "d6oj32u04ihb07",
  port: PORT_DB,
  ssl: { rejectUnauthorized: false },
};

// const PARAMS_CONNECTION = {
//   host: IP_SERVER_DB,
//   user: process.env.DATABASE_USER || "postgres",
//   password: process.env.DATABASE_PASS || "navau", //apsadmin2022
//   database: process.env.DATABASE_NAME || "APS",
//   port: PORT_DB,
// };

module.exports = {
  API_VERSION,
  IP_SERVER_API,
  IP_SERVER_DB,
  PORT_DB,
  PARAMS_CONNECTION,
  PORT_SERVER,
};
