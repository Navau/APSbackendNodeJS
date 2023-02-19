const {
  isUndefined,
  split,
  indexOf,
  forEach,
  size,
  trim,
  includes,
  join,
  lastIndexOf,
  replace,
  set,
  forEachRight,
} = require("lodash");

function respErrorServidor500(res, err, msg) {
  console.log(err);
  const errMessage = err?.message ? err?.message : "";
  res.status(500).send({
    resultado: 0,
    datos: null,
    mensaje: msg ? msg + errMessage : "Error del servidor. ERROR:" + errMessage,
    err,
  });
}

function respErrorServidor500END(res, err, msg, datos = null) {
  console.log(err);
  if (err?.code === "23505") {
    const detail = err?.detail;
    if (!isUndefined(detail)) {
      const arrayDetail = split(detail, "=");
      const fieldsAux = arrayDetail[0];
      const valuesAux = arrayDetail[1];
      const fields = fieldsAux.substring(
        indexOf(fieldsAux, "(") + 1,
        indexOf(fieldsAux, ")")
      );
      const values = valuesAux.substring(
        indexOf(valuesAux, "(") + 1,
        indexOf(valuesAux, ")")
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
      respResultadoIncorrectoObjeto200(res, err, [], messageFinal);
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
          mensaje: msg
            ? msg + errMessage
            : "Error del servidor. ERROR:" + errMessage,
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
          mensaje: msg ? msg + errMessage : errMessage,
          err: err.message,
        })
        .end();
    }
  }
}

function respErrorMulter500(res, err, msg) {
  console.log(err);
  const errMessage = err?.message ? err?.message : "";
  res
    .status(500)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg
        ? msg + errMessage
        : "Se ha producido un error de Multer al cargar el archivo. ERROR:" +
          errMessage,
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
      mensaje: msg
        ? msg + errMessage
        : "Error desconocido al cargar el archivo. ERROR:" + errMessage,
      err,
    })
    .end();
}

function respResultadoVacio404(res, msg) {
  res.status(404).send({
    resultado: 0,
    datos: null,
    mensaje: msg
      ? msg
      : "No se logró realizar correctamente la petición, debido a que la información no existe",
  });
}

function respResultadoVacio404END(res, msg) {
  res
    .status(404)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg
        ? msg
        : "No se logró realizar correctamente la petición, debido a que la información no existe",
    })
    .end();
}

function respResultadoVacioObject200(res, data, msg) {
  res
    .status(200)
    .send({
      resultado: 1,
      datos: data,
      mensaje: msg ? msg : "La petición fue realizada correctamente",
    })
    .end();
}

function respResultadoCorrecto200(res, result, msg) {
  res
    .status(200)
    .send({
      resultado: 1,
      datos: result.rows,
      mensaje: msg ? msg : "La petición fue realizada correctamente",
    })
    .end();
}

function respResultadoIncorrectoObjeto200(res, err, data, msg) {
  res
    .status(200)
    .send({
      resultado: 0,
      datos: data,
      mensaje: msg ? msg : "La petición no fue realizada correctamente",
      mensaje_error: err?.message,
      err,
    })
    .end();
}

function respResultadoCorrectoObjeto200(res, data, msg) {
  res
    .status(200)
    .send({
      resultado: 1,
      datos: data,
      mensaje: msg ? msg : "La petición fue realizada correctamente",
    })
    .end();
}

function respDatosNoRecibidos200END(res, msg) {
  res
    .status(200)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg ? msg : "No se envio ningún dato o entrada para la petición",
    })
    .end();
}

function respUsuarioNoAutorizado(res, msg) {
  res
    .status(200)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg ? msg : "Usuario no autorizado",
    })
    .end();
}

function respDatosNoRecibidos400(res, msg) {
  res.status(400).send({
    resultado: 0,
    datos: null,
    mensaje: msg ? msg : "No se envio ningún dato o entrada para la petición",
  });
}

function respDatosNoRecibidos400END(res, msg) {
  res
    .status(400)
    .send({
      resultado: 0,
      datos: null,
      mensaje: msg ? msg : "No se envio ningún dato o entrada para la petición",
    })
    .end();
}

function respArchivoErroneo415(res, err, msg) {
  res.status(415).send({
    resultado: 0,
    datos: null,
    mensaje: msg
      ? msg
      : "El tipo de archivo que se ha recibido no cumple con el formato esperado",
    errores: err,
  });
}

function respArchivoErroneo200(res, err, data, msg) {
  res.status(200).send({
    resultado: 0,
    datos: data,
    mensaje: msg
      ? msg
      : "El tipo de archivo que se ha recibido no cumple con el formato esperado",
    errores: err,
  });
}

function respIDNoRecibido400(res, msg) {
  res.status(400).send({
    resultado: 0,
    datos: null,
    mensaje: msg ? msg : "No se especificó el ID",
  });
}

function respDescargarArchivos200(res, file, data, msg) {
  res.status(200).download(file, data, (err) => {
    console.log("ERROR", err);
    console.log("ARCHIVOS", data);
  });
}

module.exports = {
  respErrorServidor500,
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
  respUsuarioNoAutorizado,
  respDatosNoRecibidos200END,
};
