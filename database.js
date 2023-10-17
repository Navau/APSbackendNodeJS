const { Pool } = require("pg");
const { promisify } = require("util");
const { PARAMS_CONNECTION } = require("./config");
const { isMainThread } = require("node:worker_threads");

const pool = new Pool(PARAMS_CONNECTION);
if (isMainThread) {
  pool.connect((err, client) => {
    if (err) {
      console.error(err);
      throw err;
    }
    if (client) client.release();
    console.log("Conexión al pool correcto");
    return;
  });

  promisify(pool.query);

  module.exports = pool;
}
