const { includes, replace } = require("lodash");

function agregarError(newError, arrayErrors) {
  arrayErrors.push({
    id_carga_archivos: newError.id_carga_archivos,
    archivo: newError?.archivo || "",
    tipo_error: newError?.tipo_error || "",
    descripcion: newError?.descripcion || "",
    valor:
      newError?.valor === ""
        ? "VACIO"
        : newError?.hasOwnProperty("valor")
        ? includes(newError?.valor, "'")
          ? replace(newError?.valor, /\'/g, "''")
          : newError?.valor
        : "",
    fila: newError?.hasOwnProperty("fila") ? parseInt(newError.fila) + 1 : 0,
    columna: newError?.hasOwnProperty("columna") ? newError.columna : 0,
  });
}

module.exports = { agregarError };
