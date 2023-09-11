const yup = require("yup");

async function validacionesEntradasCargaArchivos(data) {
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
        [
          "SEGUROS_PENSIONES",
          "CUSTODIO_SEGUROS",
          "CUSTODIO_PENSIONES",
          "BOLSA",
        ],
        "El tipo_carga es inválido (valores esperados: ['SEGUROS_PENSIONES', 'CUSTODIO_SEGUROS', 'CUSTODIO_PENSIONES', 'BOLSA'])"
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

async function validateSchema(schema, data) {
  return await schema
    .validate(data, { abortEarly: false, stripUnknown: true })
    .catch((validationError) => {
      return validationError;
    });
}

module.exports = {
  validacionesEntradasCargaArchivos,
};
