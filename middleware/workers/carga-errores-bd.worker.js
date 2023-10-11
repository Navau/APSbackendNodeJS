const { Pool } = require("pg");
const { parentPort, workerData } = require("worker_threads");
const { PARAMS_CONNECTION } = require("../../config");
const { InsertarVariosUtil } = require("../../utils/consulta.utils");
const { size } = require("lodash");
const { type } = workerData;

const { errorsFiles, data } = workerData;
const { TABLE_INFO, nuevaCarga } = data;
const { tableErrors } = TABLE_INFO;
const insertarErroresBD = () => {
  const query = InsertarVariosUtil(tableErrors, {
    body: errorsFiles,
    idKey: "id_carga_archivos",
    idValue: nuevaCarga.id_carga_archivos,
    returnValue: ["*"],
  });
  const pool = new Pool(PARAMS_CONNECTION);
  pool.query(query, (err, res) => {
    console.log(err);
    if (err) throw err;
  });
  return true;
};

if (type === "validarFormatoContenidoDeArchivos" && size(errorsFiles) > 0) {
  parentPort.postMessage(insertarErroresBD());
}
if (type === "formatearArchivos" && size(errorsFiles) > 0) {
  parentPort.postMessage(insertarErroresBD());
}
if (type === "validarValoresContenidoDeArchivos" && size(errorsFiles) > 0) {
  parentPort.postMessage(insertarErroresBD());
}
