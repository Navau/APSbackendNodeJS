const { forEach, range, size, map } = require("lodash");
const { parentPort, workerData } = require("worker_threads");

function formatearArchivo() {
  const {
    files,
    fechaOperacionFormateada,
    fecha_operacion,
    tipo_periodo,
    fecha_entrega,
    tipo_carga,
    reproceso,
    id_rol,
    id_usuario,
  } = workerData;

  return { files };
}
parentPort.postMessage(formatearArchivo());
