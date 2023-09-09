const yup = require("yup");
const {
  EjecutarQuery,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");
const {
  isUndefined,
  isArray,
  isString,
  map,
  size,
  filter,
  find,
} = require("lodash");

async function validarEntradasCargaArchivos(data) {
  const schema = yup.object().shape({
    fecha_operacion: yup
      .date()
      .typeError("La fecha_operación debe ser una fecha válida")
      .required("La fecha_operación es requerida"),
    tipo_periodo: yup
      .number()
      .typeError("El tipo_periodo debe ser un número válido")
      .oneOf(
        [154, 155, 219],
        "El tipo_período es inválido (valores esperados: [154, 155, 219])"
      )
      .optional(),
    fecha_entrega: yup
      .date("La fecha_entrega no es válida")
      .typeError("La fecha_entrega no es válida")
      .optional(),
    files: yup
      .array()
      .typeError("Los archivos deben ser un array de archivos válidos")
      .required("Los archivos son requeridos"),
    tipo_carga: yup
      .string()
      .typeError("El tipo_carga debe ser una cadena de texto")
      .oneOf(
        ["SEGUROS_PENSIONES", "CUSTODIO", "BOLSA"],
        "El tipo_carga es inválido (valores esperados: ['SEGUROS_PENSIONES', 'CUSTODIO', 'BOLSA'])"
      )
      .required("El tipo_carga es requerido"),
    reproceso: yup
      .boolean()
      .oneOf(
        [true, false],
        "El reproceso debe ser explícitamente un valor booleano"
      )
      .typeError("El reproceso debe ser explícitamente un valor booleano")
      .optional(),
  });

  return await validateSchema(schema, data);
}

async function validacionArchivosAvanzada(
  files,
  fechaOperacion,
  codigosSeguros,
  codigosPensiones,
  confArchivos
) {
  if (!isArray(files))
    return "Los archivos deben ser un array de archivos válidos";
  const fechaOperacionFormateada = fechaOperacion.split("-").join("");
  const fileNames = map(files, "originalname");
  console.log({ confArchivos, codigosPensiones, codigosSeguros });

  if (size(fileNames) !== size(confArchivos))
    return `La cantidad de archivos de entrada ('${size(
      files
    )}') no es igual a la cantidad de archivos esperada ('${size(
      confArchivos
    )}', archivos esperados: ${map(confArchivos, "codigo")})`;

  const validaFechaOperacion = filter(fileNames, (fileName) => {
    const splitFileName = fileName.split(fechaOperacionFormateada);
    if (size(splitFileName) === 1) return true;
  });

  if (size(validaFechaOperacion) > 0)
    return `Los archivos (${validaFechaOperacion.join(
      ", "
    )}) no contienen la fecha de operación correcta`;

  const validaFormatoArchivo = filter(confArchivos, (confArchivo) => {
    const fileFind = find(fileNames, (fileName) => {
      const fileNameExtension = fileName.split(".").pop();
      return fileNameExtension === confArchivo.codigo;
    });
    console.log({ fileFind });
  });

  return true;
}

async function validateSchema(schema, data) {
  return await schema
    .validate(data, { abortEarly: false, stripUnknown: true })
    .catch((validationError) => {
      return validationError;
    });
}

module.exports = {
  validarEntradasCargaArchivos,
};
