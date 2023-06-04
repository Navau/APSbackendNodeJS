const { forEach, isUndefined, findKey, trim } = require("lodash");
const {
  ObtenerColumnasDeTablaUtil,
  EjecutarQuery,
} = require("./consulta.utils");
const Yup = require("yup");
const { setLocale } = require("yup");

setLocale({
  mixed: {
    required: "El campo ${path} es requerido",
  },
  string: {
    max: "El campo ${path} no puede tener más de ${max} caracteres",
  },
});

const messagesTypeData = (columnName, typeData) => {
  const DATA_TYPES = {
    "character varying": `El valor de '${columnName}' debe ser texto`,
    integer: `El valor de '${columnName}' debe ser un número entero`,
    "timestamp without time zone": `El valor de '${columnName}' debe ser una fecha y hora`,
    ARRAY: (innerType) =>
      `El valor de '${columnName}' debe ser una matriz de tipo ${innerType}`,
    character: `El valor de '${columnName}' debe ser un carácter`,
    varchar: `El valor de '${columnName}' debe ser texto`,
    text: `El valor de '${columnName}' debe ser texto`,
    citext: `El valor de '${columnName}' debe ser texto`,
    smallint: `El valor de '${columnName}' debe ser un número entero`,
    int: `El valor de '${columnName}' debe ser un número entero`,
    bigint: `El valor de '${columnName}' debe ser un número entero`,
    numeric: `El valor de '${columnName}' debe ser un número`,
    real: `El valor de '${columnName}' debe ser un número`,
    double: `El valor de '${columnName}' debe ser un número`,
    decimal: `El valor de '${columnName}' debe ser un número`,
    boolean: `El valor de '${columnName}' debe ser un valor booleano`,
    date: `El valor de '${columnName}' debe ser una fecha`,
    time: `El valor de '${columnName}' debe ser una hora`,
    timestamp: `El valor de '${columnName}' debe ser una fecha y hora`,
    timestamptz: `El valor de '${columnName}' debe ser una fecha y hora`,
    interval: `El valor de '${columnName}' debe ser un intervalo de tiempo`,
    json: `El valor de '${columnName}' debe ser un objeto JSON`,
    jsonb: `El valor de '${columnName}' debe ser un objeto JSON`,
    uuid: `El valor de '${columnName}' debe ser un UUID válido`,
    inet: `El valor de '${columnName}' debe ser una dirección IP válida`,
    macaddr: `El valor de '${columnName}' debe ser una dirección MAC válida`,
    tsvector: `El valor de '${columnName}' debe ser un vector de búsqueda de texto`,
    tsquery: `El valor de '${columnName}' debe ser una consulta de búsqueda de texto`,
    xml: `El valor de '${columnName}' debe ser XML`,
    point: `El valor de '${columnName}' debe ser un punto`,
    line: `El valor de '${columnName}' debe ser una línea`,
    lseg: `El valor de '${columnName}' debe ser un segmento de línea`,
    box: `El valor de '${columnName}' debe ser un rectángulo`,
    path: `El valor de '${columnName}' debe ser un camino`,
    polygon: `El valor de '${columnName}' debe ser un polígono`,
    circle: `El valor de '${columnName}' debe ser un círculo`,
    cidr: `El valor de '${columnName}' debe ser una dirección CIDR válida`,
    macaddr8: `El valor de '${columnName}' debe ser una dirección MAC de 8 octetos válida`,
    bit: `El valor de '${columnName}' debe ser un valor de bits`,
    varbit: `El valor de '${columnName}' debe ser un valor de bits`,
    money: `El valor de '${columnName}' debe ser un valor monetario`,
    money: `El valor de '${columnName}' debe ser un valor monetario`,
    oid: `El valor de '${columnName}' debe ser un identificador de objeto (OID)`,
    refcursor: `El valor de '${columnName}' debe ser un cursor de referencia`,
    regprocedure: `El valor de '${columnName}' debe ser un procedimiento registrado`,
    regoper: `El valor de '${columnName}' debe ser un operador registrado`,
    regoperator: `El valor de '${columnName}' debe ser un operador registrado`,
    regclass: `El valor de '${columnName}' debe ser una clase registrada`,
    regtype: `El valor de '${columnName}' debe ser un tipo registrado`,
    uuid: `El valor de '${columnName}' debe ser un UUID válido`,
    pg_lsn: `El valor de '${columnName}' debe ser un número de secuencia de registro de PostgreSQL`,
    pg_snapshot: `El valor de '${columnName}' debe ser una instantánea de PostgreSQL`,
    pg_type: `El valor de '${columnName}' debe ser un tipo de datos de PostgreSQL`,
  };

  return DATA_TYPES?.[typeData] || undefined;
};

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
      const columnNameData = findKey(
        data,
        (itemData, indexData) => indexData === columnName
      );
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
          return Yup.number().integer(intMessage).typeError(intMessage);
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
          .test("es nulo", nullMessage, (value) => value === null);
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
        if (action === "Escoger" || action === "Buscar") {
          //VALIDACION PARA CAMBIAR LOS MENSAJES SI EL VALOR NO ES ACEPTABLE
          if (
            columnNameData !== undefined &&
            (value === null ||
              value === undefined ||
              Number.isNaN(value) ||
              !Number.isFinite(value) ||
              typeof value === "function" ||
              typeof value === "symbol")
          )
            validationSchema = validationSchema.required(
              messagesTypeData(columnName, dataType) || defaultMessage
            );
        } else {
          if (isNullable) validationSchema = validationSchema.nullable();
          if (!isNullable && columnDefault === null && action === "Insertar") {
            validationSchema = validationSchema.required(requiredMessage);
            validationSchema = isUndefined(value)
              ? validationSchema.typeError(requiredMessage)
              : validationSchema;
          }
        }
      }

      if (
        columnName === "password" &&
        (action === "Insertar" || action === "Actualizar")
      ) {
        const passwordValidation = (
          schema = Yup,
          minLength,
          minChars,
          minNumbers,
          minSpecialChars
        ) => {
          return schema
            .min(
              minLength,
              `El campo contraseña debe tener al menos ${minLength} caracteres de longitud`
            )
            .test(
              "tiene letras",
              `El campo contraseña debe tener al menos ${minChars} ${
                minChars > 1 ? "letras" : "letra"
              }`,
              (value) => {
                const regex = new RegExp(`^(.*?[A-Za-z]){${minChars}}.*$`);
                return regex.test(value);
              }
            )
            .test(
              "tiene numeros",
              `El campo contraseña debe tener al menos ${minNumbers} ${
                minChars > 1 ? "números" : "número"
              }`,
              (value) => {
                const regex = new RegExp(`^(.*?[0-9]){${minNumbers}}.*$`);
                return regex.test(value);
              }
            )
            .test(
              "tiene caracteres especiales",
              `El campo contraseña debe tener al menos ${minSpecialChars} ${
                minChars > 1 ? "caracteres especiales" : "caracter especial"
              }`,
              (value) => {
                const regex = new RegExp(
                  `^(.*?[!@#$%^&*()_+\\-=[\\]{};':"\\|,.<>\\/?]){${minSpecialChars}}.*$`
                );
                return regex.test(value);
              }
            )
            .trim() // Elimina espacios en blanco al inicio y al final
            .test(
              "tiene espacios en blanco",
              "El campo contraseña no debe tener espacios en blanco",
              (value) => {
                if (isUndefined(value)) return true;
                const noSpaces = value.replace(/\s/g, "");
                return noSpaces === value;
              }
            );
        };
        validationSchema = passwordValidation(validationSchema, 8, 1, 1, 1);
      } else if (
        columnName === "usuario" &&
        (action === "Insertar" || action === "Actualizar")
      ) {
        validationSchema = validationSchema
          .trim() // Elimina espacios en blanco al inicio y al final
          .test(
            "tiene espacios en blanco",
            "El campo usuario no debe tener espacios en blanco",
            (value) => {
              if (isUndefined(value)) return true;
              const noSpaces = value.replace(/\s/g, "");
              return noSpaces === value;
            }
          );
      } else if (columnName === "gmail" || columnName === "email") {
        validationSchema = validationSchema.email(defaultMessage);
      }

      schema[columnName] = validationSchema;
    });

    const yupSchema = Yup.object().shape(schema);

    const options = {
      abortEarly: false,
      stripUnknown: true,
      messages: { nullable: "El valor de '${path}' no puede ser nulo" },
    };
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
    throw err;
  }
}

module.exports = {
  ValidarDatosValidacion,
};
