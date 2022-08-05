const API_VERSION = "v1";
const IP_SERVER_API = "localhost";
// const IP_SERVER_DB = process.env.DATABASE_HOST || "localhost";
// const PORT_DB = process.env.DATABASE_PORT || 5432;
const IP_SERVER_DB = "ec2-3-213-228-206.compute-1.amazonaws.com";
const PORT_DB = 5432;
const PORT_SERVER = process.env.PORT || 3977; // 3977 || 5290

const PARAMS_CONNECTION = {
  host: IP_SERVER_DB,
  user: "rewigxozynxeay",
  password: "aa054e1374553ba1281e80300756848e783d5d80063b889d3ac343e4d46a28ee", //apsadmin2022
  database: "d3pm9pla4b346b",
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
