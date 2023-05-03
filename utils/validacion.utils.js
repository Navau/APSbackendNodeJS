const {
  forEach,
  isUndefined,
  map,
  values,
  keys,
  isInteger,
} = require("lodash");
const {
  ObtenerColumnasDeTablaUtil,
  EjecutarQuery,
} = require("./consulta.utils");
const Yup = require("yup");

const mainValidationSchema = (paramsV) => {
  const {
    dataType,
    textValidation,
    integerValidation,
    numericValidation,
    booleanValidation,
    datetimeValidation,
  } = paramsV;
  const dataTypes = {
    "character varying": textValidation(),
    integer: integerValidation(),
    "timestamp without time zone": datetimeValidation(),
    ARRAY: (innerType) =>
      Yup.array().of(innerType).typeError("Ingrese una matriz válida"),
    character: textValidation(),
    varchar: textValidation(),
    text: textValidation(),
    citext: textValidation(),
    smallint: numericValidation(),
    int: integerValidation(),
    bigint: integerValidation(),
    numeric: numericValidation(),
    real: numericValidation(),
    double: numericValidation(),
    decimal: numericValidation(),
    boolean: booleanValidation(),
    date: datetimeValidation(),
    time: datetimeValidation(),
    timestamp: datetimeValidation(),
    timestamptz: datetimeValidation(),
    interval: datetimeValidation(),
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
    money: numericValidation(),
    oid: numericValidation(),
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
      const ordinalPosition = item.ordinal_position;
      const value = data[columnName];
      const defaultMessage = `El valor de '${columnName}' no es válido`;
      const requiredMessage = `El valor de '${columnName}' es obligatorio`;
      const nullMessage = `El valor de '${columnName}' debe ser nulo`;
      const idMessage = `El valor de '${columnName}' debe ser un número`;
      const textMessage = `El valor de '${columnName}' debe ser un texto`;
      const intMessage = `El valor de '${columnName}' debe ser un número entero`;
      const decimalMessage = `El valor de '${columnName}' no cumple con el formato decimal (${precision}, ${scale})`;

      let validationSchema = Yup;
      const paramsV = {
        dataType,
        textValidation: () => {
          let schemaAux = Yup.string();
          if (maxLength) {
            schemaAux = schemaAux.max(maxLength);
          }
          schemaAux = schemaAux.test(
            "Es texto",
            textMessage,
            (val, options) => {
              const { originalValue } = options;
              if (val !== undefined) {
                return typeof originalValue === "string";
              }
              return true;
            }
          );
          schemaAux = schemaAux.typeError(defaultMessage);
          return schemaAux;
        },
        integerValidation: () => {
          return Yup.number().integer().typeError(intMessage);
        },
        numericValidation: () => {
          let schemaAux = Yup.number();
          if (precision && scale) {
            schemaAux = schemaAux.test(
              "Es decimal",
              decimalMessage,
              (val, options) => {
                const { originalValue } = options;
                if (val !== undefined) {
                  const intAux = "(0|[1-9][0-9]{0," + (precision - 1) + "})";
                  const decimalAux = "(\\.\\d{1," + scale + "})";
                  let textExpReg = `^${intAux}`;
                  textExpReg =
                    originalValue % 1 ? textExpReg + decimalAux : textExpReg;
                  textExpReg += "{1,1}$";
                  const ExpReg = new RegExp(textExpReg);
                  return ExpReg.test(val);
                }
                return true;
              }
            );
          }
          schemaAux = schemaAux.typeError(defaultMessage);
          return schemaAux;
        },
        booleanValidation: () => {
          return Yup.boolean().typeError(defaultMessage);
        },
        datetimeValidation: () => {
          return Yup.date().typeError(defaultMessage);
        },
      };
      if (ordinalPosition === 1 && action === "Insertar") {
        validationSchema = validationSchema
          .mixed()
          .nullable()
          .test("is-null", nullMessage, (value) => value === null);
      } else if (ordinalPosition === 1 && action === "Actualizar") {
        validationSchema = validationSchema
          .number()
          .required(requiredMessage)
          .typeError(idMessage);
      } else if (ordinalPosition === 1 && action === "Eliminar") {
        validationSchema = validationSchema
          .number()
          .required(requiredMessage)
          .typeError(idMessage);
      } else {
        validationSchema = mainValidationSchema(paramsV);
        if (!isNullable && columnDefault === null && action === "Insertar") {
          validationSchema = validationSchema.required(requiredMessage);
          // validationSchema = isUndefined(value)
          //   ? validationSchema.typeError(requiredMessage)
          //   : validationSchema;
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
        const errors = err.errors;
        return {
          ok: false,
          errors,
        };
      });
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  ValidarDatosValidacion,
};
