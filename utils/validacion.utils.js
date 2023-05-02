const { forEach, isUndefined } = require("lodash");
const {
  ObtenerColumnasDeTablaUtil,
  EjecutarQuery,
} = require("./consulta.utils");
const Yup = require("yup");

const mainValidationSchema = (paramsV) => {
  const {
    dataType,
    validationSchema,
    textValidation,
    integerValidation,
    numericValidation,
    booleanValidation,
    datetimeValidation,
  } = paramsV;
  const dataTypes = {
    "character varying": textValidation(validationSchema),
    integer: integerValidation(validationSchema),
    "timestamp without time zone": datetimeValidation(validationSchema),
    ARRAY: (innerType) =>
      Yup.array().of(innerType).typeError("Ingrese una matriz válida"),
    character: textValidation(validationSchema),
    varchar: textValidation(validationSchema),
    text: textValidation(validationSchema),
    citext: textValidation(validationSchema),
    smallint: numericValidation(validationSchema),
    int: integerValidation(validationSchema),
    bigint: integerValidation(validationSchema),
    numeric: numericValidation(validationSchema),
    real: numericValidation(validationSchema),
    double: numericValidation(validationSchema),
    decimal: numericValidation(validationSchema),
    boolean: booleanValidation(validationSchema),
    date: datetimeValidation(validationSchema),
    time: datetimeValidation(validationSchema),
    timestamp: datetimeValidation(validationSchema),
    timestamptz: datetimeValidation(validationSchema),
    interval: datetimeValidation(validationSchema),
    json: Yup.object(),
    jsonb: Yup.object(),
    uuid: Yup.string().uuid().typeError("Ingrese un UUID válido"),
    inet: Yup.string().matches(/^(\d{1,3}\.){3}\d{1,3}$/),
    macaddr: Yup.string().matches(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/),
    tsvector: Yup.string(),
    tsquery: Yup.string(),
    xml: Yup.string(),
    point: Yup.string(),
    line: Yup.string(),
    lseg: Yup.string(),
    box: Yup.string(),
    path: Yup.string(),
    polygon: Yup.string(),
    circle: Yup.string(),
    cidr: Yup.string().matches(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/),
    macaddr8: Yup.string().matches(/^([0-9a-fA-F]{2}:){7}[0-9a-fA-F]{2}$/),
    bit: Yup.string(),
    varbit: Yup.string(),
    money: numericValidation(validationSchema),
    oid: numericValidation(validationSchema),
    refcursor: Yup.string(),
    regprocedure: Yup.string(),
    regoper: Yup.string(),
    regoperator: Yup.string(),
    regclass: Yup.string(),
    regtype: Yup.string(),
    uuid: Yup.string().uuid(),
    pg_lsn: Yup.string(),
    pg_snapshot: Yup.string(),
    pg_type: Yup.string(),
  };

  return dataTypes[dataType] || Yup;
};

async function ValidarDatosValidacion(params) {
  try {
    const { nameTable, data, action } = params;
    const columnas = await EjecutarQuery(ObtenerColumnasDeTablaUtil(nameTable));
    const schema = {};

    forEach(columnas, (item) => {
      const columnName = item.column_name;
      const dataType = item.data_type;
      const maxLength = item.character_maximum_length;
      const precision = item.numeric_precision;
      const scale = item.numeric_scale;
      const isNullable = item.is_nullable === "YES";
      const columnDefault = item.column_default;
      const ordinal_position = item.ordinal_position;
      const value = data[columnName];
      const defaultMessage = `El valor de '${columnName}: ${value}' no es válido`;
      const requiredMessage = `El valor de '${columnName}' es obligatorio`;
      const nullMessage = `El valor de '${columnName}' debe ser nulo`;
      const idMessage = `El valor de '${columnName}' debe ser un número`;

      let validationSchema = Yup;
      const paramsV = {
        dataType,
        validationSchema,
        textValidation: (validationSchema) => {
          validationSchema = validationSchema.string();

          if (maxLength) {
            validationSchema = validationSchema.max(maxLength);
          }
          validationSchema = validationSchema.typeError(defaultMessage);
          return validationSchema;
        },
        integerValidation: (validationSchema) =>
          (validationSchema = validationSchema.number().integer()),
        numericValidation: (validationSchema) => {
          validationSchema = validationSchema.number();
          if (precision && scale) {
            validationSchema = validationSchema
              .max(Number("9".repeat(precision - scale)) / Math.pow(10, scale))
              .min(
                -Number("9".repeat(precision - scale)) / Math.pow(10, scale)
              );
          }
          validationSchema = validationSchema.typeError(defaultMessage);
          return validationSchema;
        },
        booleanValidation: (validationSchema) =>
          validationSchema.boolean().typeError(defaultMessage),
        datetimeValidation: (validationSchema) =>
          validationSchema.date().typeError(defaultMessage),
      };

      if (ordinal_position === 1 && action === "Insertar") {
        validationSchema = validationSchema
          .mixed()
          .nullable()
          .test("is-null", nullMessage, (value) => value === null);
      } else if (ordinal_position === 1 && action === "Actualizar") {
        validationSchema = validationSchema
          .number()
          .required(requiredMessage)
          .typeError(idMessage);
      } else if (ordinal_position === 1 && action === "Eliminar") {
        validationSchema = validationSchema
          .number()
          .required(requiredMessage)
          .typeError(idMessage);
      } else {
        validationSchema = mainValidationSchema(paramsV);
        if (!isNullable && columnDefault === null && action === "Insertar") {
          validationSchema = validationSchema.required();
          validationSchema = isUndefined(value)
            ? validationSchema.typeError(requiredMessage)
            : validationSchema;
        }
      }

      schema[columnName] = validationSchema;
    });

    const yupSchema = Yup.object().shape(schema);

    const options = { abortEarly: false };
    return yupSchema
      .validate(data, options)
      .then((result) => {
        return { ok: true, result };
      })
      .catch((err) => {
        return { ok: false, errors: err.errors };
      });
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  ValidarDatosValidacion,
};
