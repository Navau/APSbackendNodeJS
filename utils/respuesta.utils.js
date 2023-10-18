const {
  isUndefined,
  split,
  forEach,
  size,
  trim,
  includes,
  join,
  replace,
  set,
  forEachRight,
  isArray,
  map,
  isEmpty,
} = require("lodash");

const { nombreSeccionTabla } = require("./formatearDatos");

const msgFinal = (msg, msgDefault) => {
  if (isArray(msg)) return size(msg) > 0 ? msg : [msgDefault];
  else return [msg ? msg : msgDefault];
};

const msgFinalError = (msg, msgDefault, errMessage) => {
  if (isArray(msg))
    return size(msg) > 0
      ? map(msg, (item) => item + errMessage)
      : [msgDefault + errMessage];
  else return [(msg ? msg : msgDefault) + errMessage];
};

function respErrorServidor500END(res, err, msg, datos = null) {
  console.log(err);
  if (err?.code === "23505") {
    const detail = err?.detail;
    const arrayDetail = split(detail, "=");
    const fieldsAux = arrayDetail[0];
    const valuesAux = arrayDetail[1];
    const fields = fieldsAux.substring(
      fieldsAux.indexOf("(") + 1,
      fieldsAux.indexOf(")")
    );
    const values = valuesAux.substring(
      valuesAux.indexOf("(") + 1,
      valuesAux.indexOf(")")
    );
    const fieldsSplit = split(fields, ",");
    const valuesSplit = split(values, ",");
    const fieldsWithValuesArray = [];
    forEach(fieldsSplit, (field, index) => {
      const value = valuesSplit[index];
      fieldsWithValuesArray.push(`${trim(field)} = ${trim(value)}`);
    });
    const fieldsWithValuesString = join(fieldsWithValuesArray, ", ");

    const messageFinal = `${
      size(fieldsWithValuesArray) > 1 ? "Los valores" : "El valor"
    } (${fieldsWithValuesString}) ya se ${
      size(fieldsWithValuesArray) > 1
        ? "encuentran registrados"
        : "encuentra registrado"
    }`;
    respResultadoIncorrectoObjeto200(res, err, [], messageFinal);
  } else if (isArray(err)) {
    const messagesFinal = [];
    forEach(err, (item) => {
      if (item?.err?.code === "23505") {
        const detail = item?.err?.detail;
        const arrayDetail = split(detail, "=");
        const fieldsAux = arrayDetail[0];
        const valuesAux = arrayDetail[1];
        const fields = fieldsAux.substring(
          fieldsAux.indexOf("(") + 1,
          fieldsAux.indexOf(")")
        );
        const values = valuesAux.substring(
          valuesAux.indexOf("(") + 1,
          valuesAux.indexOf(")")
        );
        const fieldsSplit = split(fields, ",");
        const valuesSplit = split(values, ",");
        const fieldsWithValuesArray = [];
        forEach(fieldsSplit, (field, index) => {
          const value = valuesSplit[index];
          if (!includes(field, "id_"))
            fieldsWithValuesArray.push(`${trim(field)} = ${trim(value)}`);
        });
        const fieldsWithValuesString = join(fieldsWithValuesArray, ", ");

        const messageFinal = `${
          size(fieldsWithValuesArray) > 1 ? "Los valores" : "El valor"
        } (${fieldsWithValuesString}) ya se ${
          size(fieldsWithValuesArray) > 1
            ? "encuentran registrados"
            : "encuentra registrado"
        }`;
        messagesFinal.push(messageFinal);
      }
    });
    if (size(messagesFinal) > 0)
      respResultadoIncorrectoObjeto200(res, err, [], messagesFinal);
    else {
      const errMessage = err?.message ? err?.message : "";
      res
        .status(500)
        .send({
          resultado: 0,
          datos,
          mensaje: msgFinalError(msg, "Error del servidor. ", errMessage),
          err,
        })
        .end();
    }
  } else {
    const data = err?.response?.data;

    if (isUndefined(data)) {
      const errMessage = err?.message ? err?.message : "";
      res
        .status(500)
        .send({
          resultado: 0,
          datos,
          mensaje: msgFinalError(msg, "Error del servidor. ", errMessage),
          err,
        })
        .end();
    } else {
      const errMessage = data?.message ? data.message : "";
      res
        .status(500)
        .send({
          resultado: 0,
          datos,
          mensaje: msgFinalError(msg, "", errMessage),
          err: err.message,
        })
        .end();
    }
  }
}

function respErrorMulter500(res, err, msg) {
  const errMessage = err?.message ? err?.message : "";
  const limitSizeMessage =
    err.code === "LIMIT_FILE_SIZE"
      ? "Uno de los archivos excede el tamaño permitido (20MB). "
      : "";
  res
    .status(500)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msgFinalError(
        msg,
        isEmpty(limitSizeMessage)
          ? "Se ha producido un error de Multer al cargar el archivo. ERROR:"
          : limitSizeMessage,
        errMessage
      ),
      err,
    })
    .end();
}

function respErrorExtensionError403(res, err, msg) {
  console.log(err);
  const errMessage = err?.message ? err?.message : "";
  res
    .status(413)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msgFinalError(
        msg,
        "Error desconocido al cargar el archivo. ERROR:",
        errMessage
      ),
      err,
    })
    .end();
}

function respResultadoVacio404(res, msg) {
  res.status(404).send({
    resultado: 0,
    datos: null,
    mensaje: msgFinal(
      msg,
      "No se logró realizar correctamente la petición, debido a que la información no existe"
    ),
  });
}

function respResultadoVacio404END(res, msg) {
  res
    .status(404)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msgFinal(msg, "Información inexistente"),
    })
    .end();
}

function respResultadoDinamicoEND(res, code, result, data, msg) {
  res
    .status(code)
    .send({
      resultado: result,
      datos: data,
      mensaje: msgFinal(msg, "La petición tuvo algún error"),
    })
    .end();
}

function respResultadoVacioObject200(res, data, msg) {
  res
    .status(200)
    .send({
      resultado: 1,
      datos: data,
      mensaje: msgFinal(msg, "La petición fue realizada correctamente"),
    })
    .end();
}

function respResultadoCorrecto200(res, result, msg) {
  res
    .status(200)
    .send({
      resultado: 1,
      datos: result.rows,
      mensaje: msgFinal(msg, "La petición fue realizada correctamente"),
    })
    .end();
}

function respResultadoIncorrectoObjeto200(res, err, data, msg) {
  res
    .status(200)
    .send({
      resultado: 0,
      datos: data,
      mensaje: msgFinal(msg, "La petición no fue realizada correctamente"),
      mensaje_error: err?.message,
      err,
    })
    .end();
}

function respDemasiadasSolicitudes429(res, msg) {
  res
    .status(429)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msgFinal(msg, "Se realizaron muchas peticiones"),
    })
    .end();
}

function respResultadoCorrectoObjeto200(res, data, msg) {
  const sizeData = !isUndefined(data?.sizeData) ? data.sizeData : undefined;
  res
    .status(200)
    .send({
      resultado: 1,
      datos: isUndefined(sizeData) ? data : [...data.result],
      sizeData,
      mensaje: msgFinal(msg, "La petición fue realizada correctamente"),
    })
    .end();
}

function respLoginResultadoCorrectoObjeto200(res, data, results, msg) {
  res
    .status(200)
    .send({
      resultado: 1,
      datos: data,
      resultados: results,
      mensaje: msgFinal(msg, "La petición fue realizada correctamente"),
    })
    .end();
}

function respDatosNoRecibidos200END(res, msg) {
  res
    .status(200)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msgFinal(
        msg,
        "No se envio ningún dato o entrada para la petición"
      ),
    })
    .end();
}

function respUsuarioNoAutorizado200END(res, msg, action, table) {
  const messageActionAux = table
    ? `Usuario no autorizado para '${action} ${nombreSeccionTabla(table)}'`
    : `Usuario no autorizado para '${action}'`;
  const messageAux = action ? messageActionAux : "Usuario no autorizado";
  res
    .status(200)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msgFinal(msg, messageAux),
      permiso_validacion: true,
    })
    .end();
}

function respDatosNoRecibidos400(res, msg) {
  res.status(400).send({
    resultado: 0,
    datos: null,
    mensaje: msgFinal(
      msg,
      "No se envio ningún dato o entrada para la petición"
    ),
  });
}

function respDatosNoRecibidos400END(res, msg) {
  res
    .status(400)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msgFinal(
        msg,
        "No se envio ningún dato o entrada para la petición"
      ),
    })
    .end();
}

function respArchivoErroneo415(res, err, msg) {
  res.status(415).send({
    resultado: 0,
    datos: null,
    mensaje: msgFinal(
      msg,
      "El tipo de archivo que se ha recibido no cumple con el formato esperado"
    ),
    errores: err,
  });
}

function respArchivoErroneo200(res, err, data, msg) {
  res.status(200).send({
    resultado: 0,
    datos: data,
    mensaje: msgFinal(
      msg,
      "El tipo de archivo que se ha recibido no cumple con el formato esperado"
    ),
    errores: err,
    sizeData: size(err),
  });
}

function respIDNoRecibido400(res, msg) {
  res.status(400).send({
    resultado: 0,
    datos: null,
    mensaje: msgFinal(msg, "No se especificó el ID"),
  });
}

function respDescargarArchivos200(res, file, data, msg) {
  res.status(200).download(file, data, (err) => {
    console.log("ERROR", err);
    console.log("ARCHIVOS", data);
  });
}

module.exports = {
  respErrorMulter500,
  respErrorExtensionError403,
  respDatosNoRecibidos400,
  respArchivoErroneo415,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respResultadoVacio404END,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respArchivoErroneo200,
  respResultadoVacioObject200,
  respResultadoIncorrectoObjeto200,
  respDescargarArchivos200,
  respUsuarioNoAutorizado200END,
  respDatosNoRecibidos200END,
  respLoginResultadoCorrectoObjeto200,
  respDemasiadasSolicitudes429,
  respResultadoDinamicoEND,
  respDatosNoRecibidos400END,
};
