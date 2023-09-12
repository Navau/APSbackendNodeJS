const { size, forEach, map, find, set } = require("lodash");
const {
  EjecutarQuery,
  ObtenerColumnasDeTablaUtil,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");
const {
  tipoInstrumento,
  tipoInstrumento2,
  moneda,
  mayorACero,
  tipoAmortizacion,
  tipoInteres,
  operacionMatematica,
  plazoEmisionTiposDeDatos,
  nroPago,
  plazoCupon,
  subordinado,
  calificacion,
  calificadora,
  custodio,
  emisor,
  tipoAccion,
  tipoTasa,
  mayorIgualACero,
  prepago,
  pais,
  tasaEmision,
  serieEmision,
} = require("./funciones-validaciones-contenido-valores-archivos.helper");

async function obtenerInformacionColumnasArchivosBD(confArchivos) {
  try {
    const result = {};
    for await (const confArchivo of confArchivos) {
      const table = CONF_FILE_BY_CODE[confArchivo.codigo].table;
      const obtenerInfoColumnas = await EjecutarQuery(
        ObtenerColumnasDeTablaUtil(table)
      );
      result[confArchivo.codigo] = obtenerInfoColumnas;
    }
    return result;
  } catch (err) {
    throw err;
  }
}

async function obtenerValidacionesArchivos(validatedContentFormatFiles) {
  const optionsValidationsFiles = {};
  const querysFiles = [];
  const keysFiles = {};
  const executedFilesQueries = {};
  try {
    forEach(validatedContentFormatFiles, (fileContent, fileCode) => {
      const fileValidations = CONF_FILE_VALUE_VALIDATIONS(fileCode);
      forEach(fileValidations, (validation) => {
        const { globalFileValidations } = validation;
        if (globalFileValidations?.queries) {
          const { queries } = globalFileValidations;
          const preparedQueries = queries();
          keysFiles[fileCode] = preparedQueries.keys;
          executedFilesQueries[fileCode] = {};
          querysFiles.push(...preparedQueries.querys);
        }
      });
      optionsValidationsFiles[fileCode] = fileValidations;
    });
    return await Promise.all(
      map(querysFiles, (queryFile) => EjecutarQuery(queryFile))
    )
      .then((response) => {
        let counter = 0;
        forEach(keysFiles, (keys, fileCode) => {
          forEach(keys, (key) => {
            executedFilesQueries[fileCode][key] = response[counter];
            counter++;
          });
        });
        forEach(executedFilesQueries, (executedQuerys, fileCode) => {
          const validationsFile = optionsValidationsFiles[fileCode];
          forEach(executedQuerys, (executedQuery, column) => {
            const validationFile = find(
              validationsFile,
              (validation) => validation.columnName === column
            );
            if (size(validationFile.functions) > 0) {
              const newFunctions = map(
                validationFile.functions,
                (functionName) => {
                  return functionName.bind(null, executedQuery);
                }
              );
              validationFile.functions = newFunctions;
            }
          });
        });
        return optionsValidationsFiles;
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  }
}

const CONF_FILE_QUERIES_DATABASE = (typeFile) => {
  const TYPES_QUERY_FILES = {
    441: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              valuesWhereIn: [135],
              whereIn: true,
            },
          ],
        },
      },
      emisor: {
        table: "APS_param_emisor",
        queryOptions: {
          select: ["codigo_rmv"],
          where: [{ key: "id_pais", value: 8 }],
        },
      },
      moneda: {
        table: "APS_param_moneda",
        queryOptions: {
          select: ["sigla"],
          where: [
            { key: "id_moneda", valuesWhereIn: [1, 2, 3, 4], whereIn: true },
          ],
        },
      },
      tipo_amortizacion: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [{ key: "id_clasificador_comun_grupo", value: 25 }],
        },
      },
      tipo_interes: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [{ key: "id_clasificador_comun_grupo", value: 23 }],
        },
      },
      tipo_tasa: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [{ key: "id_clasificador_comun_grupo", value: 16 }],
        },
      },
      prepago: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun",
              valuesWhereIn: [162, 164],
              whereIn: true,
            },
          ],
        },
      },
      subordinado: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 21,
            },
          ],
        },
      },
      calificacion: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 6,
            },
          ],
        },
      },
      calificadora: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              valuesWhereIn: [7],
              whereIn: true,
            },
          ],
        },
      },
      custodio: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              valuesWhereIn: [9],
              whereIn: true,
            },
          ],
        },
      },
    },
    442: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              valuesWhereIn: [138],
              whereIn: true,
            },
          ],
        },
      },
      pais: {
        table: "APS_param_pais",
        queryOptions: {
          select: ["codigo"],
        },
      },
      emisor: {
        table: "APS_param_emisor",
        queryOptions: {
          select: ["codigo_rmv"],
          where: [
            {
              key: "id_pais",
              value: 8,
              operator: "<>",
            },
            {
              key: "codigo_rmv",
              value: "TGN",
              operatorSQL: "OR",
            },
          ],
        },
      },
      moneda: {
        table: "APS_param_moneda",
        queryOptions: {
          select: ["codigo_otros_activos"],
          where: [
            {
              key: "id_moneda",
              valuesWhereIn: [1, 3],
              whereIn: true,
            },
          ],
        },
      },
      calificacion: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 35,
            },
          ],
        },
      },
      calificadora: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              valuesWhereIn: [8],
              whereIn: true,
            },
          ],
        },
      },
    },
    443: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              values_where_in: [136],
              where_in: true,
            },
            {
              key: "activo",
              value: true,
            },
          ],
        },
      },
      tipo_accion: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 28,
            },
          ],
        },
      },
      emisor: {
        table: "APS_param_emisor",
        queryOptions: {
          select: ["codigo_rmv"],
        },
      },
      moneda: {
        table: "APS_param_moneda",
        queryOptions: {
          select: ["sigla"],
        },
      },
      calificacion: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 6,
            },
          ],
        },
      },
      calificacion_vacio: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 5,
            },
          ],
        },
      },
      calificadora: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              values_where_in: [7],
              where_in: true,
            },
          ],
        },
      },
      custodio: {
        table: "APS_param_clasificador_comun",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun",
              values_where_in: [106],
              where_in: true,
            },
          ],
        },
      },
    },
    444: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              valuesWhereIn: [135],
              whereIn: true,
            },
          ],
        },
      },
    },
    445: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              valuesWhereIn: [138],
              whereIn: true,
            },
          ],
        },
      },
    },
  };
  try {
    return TYPES_QUERY_FILES[typeFile];
  } catch (err) {
    throw err;
  }
};

const CONF_FILE_VALUE_VALIDATIONS = (typeFile) => {
  const defaultErrorDataTypeMessage =
    "El campo no cumple las especificaciones de Tipo de Dato";
  const resultQueries = () => {
    const confFileQueries = CONF_FILE_QUERIES_DATABASE(typeFile);
    const keys = Object.keys(confFileQueries);
    return {
      keys,
      querys: map(confFileQueries, (query) => {
        return EscogerInternoUtil(query.table, query.queryOptions);
      }),
    };
  };
  const TYPE_FILES = {
    K: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        typeError: "format",
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{1,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9\-]{5,30}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_promedio",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: ["marcacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    L: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,7}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: ["tipoValoracion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    N: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_marcacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    P: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9]{9,30}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "ult_fecha_disponible",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_bid",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    411: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        mayBeEmpty: true,
        functions: ["lugarNegociacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        functions: ["tipoOperacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,8}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadValoresMultiplicadoPrecioNegociacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    412: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        functions: ["lugarNegociacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        functions: ["tipoOperacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadValoresMultiplicadoPrecioNegociacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    413: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cartera_origen",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        functions: ["cartera"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cartera_destino",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    441: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [["tipo_instrumento", "serie"]],
          validateFieldWithOperationDate: [],
          formatDateFields: {
            fecha_vencimiento: ["yyyy-MM-dd"],
            fecha_emision: ["yyyy-MM-dd"],
          },
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [
          (params) => tipoInstrumento(params),
          (params) => tipoInstrumento2(params),
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => emisor(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => moneda(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => tipoAmortizacion(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: [(params) => tipoInteres(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: [(params) => tipoTasa(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: [(params) => tasaEmision(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_emision",
        pattern: [/^(0|[1-9][0-9]{1,4})$/, /^(0|[1-9][0-9]{0,2})$/],
        functions: [
          // "operacionfechaVencimientoMenosFechaEmision",
          (params) => operacionMatematica(params),
          (params) => plazoEmisionTiposDeDatos(params),
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: [(params) => nroPago(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: [(params) => plazoCupon(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: [(params) => prepago(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: [(params) => subordinado(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,4}$/,
        functions: [(params) => calificacion(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => calificadora(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => custodio(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    442: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [["tipo_instrumento", "serie"]],
          validateFieldWithOperationDate: [],
          formatDateFields: {
            fecha_vencimiento: ["yyyy-MM-dd"],
            fecha_emision: ["yyyy-MM-dd"],
          },
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [
          (params) => tipoInstrumento(params),
          (params) => tipoInstrumento2(params),
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "pais",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => pais(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => emisor(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: [(params) => moneda(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,9}))$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        functions: [
          // "fechaVencimientoMenosFechaEmision",
          (params) => operacionMatematica(params),
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: [(params) => nroPago(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: [(params) => plazoCupon(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-\+]{1,3}$/,
        functions: [(params) => calificacion(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        functions: [(params) => calificadora(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    443: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [["tipo_instrumento", "serie"]],
          validateFieldWithOperationDate: [],
          formatDateFields: {
            fecha_emision: ["yyyy-MM-dd"],
          },
          mayBeEmptyFields: [
            "serie",
            "calificacion",
            "calificadora",
            "custodio",
          ],
        },
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => tipoInstrumento(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_accion",
        pattern: /^[A-Za-z0-2]{1,1}$/,
        functions: [(params) => tipoAccion(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie_emision",
        pattern: /^[A-Za-z0-9]{1,1}$/,
        functions: [(params) => serieEmision(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => emisor(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => moneda(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{2,9}))$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_unitario",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        functions: [
          (params) => calificacion(params),
          // "calificacionConInstrumentoEstatico",
        ],
        // tiposInstrumentos: ["CFC", "ACC"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: [
          (params) => calificadora(params),
          // "calificadoraConCalificacion",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [
          (params) => custodio(params),
          // "custodioConInstrumento"
        ],
        // tiposInstrumentos: ["ACC"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    444: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { nro_cupon: ["serie"] },
          uniqueCombinationPerFile: [],
          validateFieldWithOperationDate: [],
          replaceFieldValue: { fecha_pago: ["yyyy-MM-dd"] },
          mayBeEmptyFields: [],
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => tipoInstrumento(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{0,3})$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          (params) => operacionMatematica(params),
          // "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorIgualACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          (params) => operacionMatematica(params),
          // "interesMasAmortizacion",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          (params) => operacionMatematica(params),
          // "saldoCapitalMenosAmortizacionCuponAnterior",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    445: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          validateFieldWithOperationDate: [],
          replaceFieldValue: { fecha_pago: ["yyyy-MM-dd"] },
          mayBeEmptyFields: [],
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: [(params) => tipoInstrumento(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_fecha_vencimiento",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: [(params) => mayorACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [(params) => mayorIgualACero(params)],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          (params) => operacionMatematica(params),
          // "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          (params) => operacionMatematica(params),
          // "interesMasAmortizacion",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          (params) => operacionMatematica(params),
          // "saldoCapitalMenosAmortizacionCuponAnterior",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    451: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoCuenta"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["entidadFinanciera"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{8,20}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        // functions: ["montoFinalConTipoDeCambio"], // VALIDACION PARA TIPO DE CAMBIO
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    481: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        singleGroup: true,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        functions: ["tasaRelevanteConInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoValorConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoEconomicoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecioEquivalente"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        mayBeEmpty: true,
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["calificacionConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["calificadoraConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        functions: ["tipoValoracionConsultaMultiple"],
        singleGroup: true,
        endSingleGroup: true,
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaUltimoHechoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    482: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        singleGroup: true,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        functions: ["tasaRelevanteConInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoValorConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoEconomicoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecioEquivalente"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        mayBeEmpty: true,
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["calificacionConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["calificadoraConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        functions: ["tipoValoracionConsultaMultiple"],
        singleGroup: true,
        endSingleGroup: true,
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaUltimoHechoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    483: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z0-9\-\ ]{3,20}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        mayBeEmpty: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z0-9\.\- ]{5,50}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenorAlArchivo"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecio"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["totalBsMenosPrevisionesInversionesBs"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    484: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
        singleGroup: true,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaRendimientoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        singleGroup: true,
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["calificadora"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
        endSingleGroup: true,
      },
    ],
    485: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
        singleGroup: true,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaRendimientoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        singleGroup: true,
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        functions: ["calificadora"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
        endSingleGroup: true,
      },
    ],
    486: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["entidadEmisora"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecio"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["totalBsMenosPrevisionesInversionesBs"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    461: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoCuenta"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["entidadFinanciera"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{5,20}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        // functions: ["montoFinalConTipoDeCambio"], // VALIDACION PARA TIPO DE CAMBIO
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    471: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        singleGroup: true,
        functions: ["tipoActivo"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "detalle_1",
        pattern: /^[A-Za-z0-9]{3,25}$/,
        singleGroup: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "detalle_2",
        pattern: /^[A-Za-z0-9À-ÿ\u00f1\u00d1\.\- ]{5,25}$/,
        singleGroup: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        singleGroup: true,
        endSingleGroup: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    491: [
      {
        columnName: "codigo_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["ciudad"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "superficie",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9\.\-]{5,25}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9\/\-]{5,15}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "incremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "decremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_rev_tec",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        mayBeEmpty: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [
          "saldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_anterior_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "bajas_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "actualizacion_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [
          "saldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["saldoFinalMenosSaldoFinalDep"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["totalVidaUtil"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["vidaUtilRestante"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        mayBeEmpty: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_bien_inmueble",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoBienInmueble"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    492: [
      {
        columnName: "codigo_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["ciudad"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "superficie",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9\.\-]{5,25}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9\/\-]{5,15}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "incremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "decremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_rev_tec",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        mayBeEmpty: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [
          "saldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_anterior_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "bajas_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "actualizacion_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [
          "saldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["saldoFinalMenosSaldoFinalDep"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["totalVidaUtil"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["vidaUtilRestante"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        mayBeEmpty: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_bien_inmueble",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoBienInmueble"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    494: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{10,100}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final_mes_anterior_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "movimiento_mes_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final_mes_actual_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["saldoFinalMesAnteriorBsMasMovimientoMesBs"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    496: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{20,150}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "ubicacion",
        pattern: /^[\s\S]{20,150}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "incremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "decremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "altas_bajas_bienes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "altas_bajas_depreciacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_final_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["depreciacionPeriodoMasAltasBajasDepreciacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_neto_usd",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    497: [
      {
        columnName: "nombre_rentista",
        pattern: /^[\s\S]{10,50}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: ["fechaOperacionMenor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_documento_prestamo",
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_inicio",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: ["fechaOperacionMenor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_finalizacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: ["fechaOperacionMenor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_prestamo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_interes_mensual",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "frecuencia_pago",
        pattern: /^[A-Za-z0-9\-]{3,7}$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_cuotas",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuota_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadCuotasMultiplicadoCuotaBs"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "amortizacion_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_actual_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "intereses_percibidos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    498: [
      {
        columnName: "nro_poliza",
        pattern: /^[A-Za-z0-9\-]{5,10}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_inicio_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: ["fechaOperacionMenor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_finalizacion_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: ["fechaOperacionMenor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "asegurado",
        pattern: /^[\s\S]{10,50}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plan_seguro",
        pattern: /^[\s\S]{10,18}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_asegurado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_rescate_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: ["fechaOperacionMenor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo",
        pattern: /^[\s\S]{2,8}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "importe_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "altas_bajas_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "amortizacion_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_actual",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "sucursal",
        pattern: /^[\s\S]{5,10}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    DM: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        mayBeEmpty: true,
        functions: ["lugarNegociacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        functions: ["tipo_operacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          "mayorACeroDecimal",
          "cantidadValoresMultiplicadoPrecioNegociacion",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    DR: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        functions: ["lugarNegociacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        functions: ["tipoOperacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadValoresMultiplicadoPrecioNegociacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    UA: [
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_cupon_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_cupon_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    UE: [
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_cupon_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_cupon_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    TD: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoAmortizacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["tipoInteres"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["tipoTasa"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        functions: ["fechaVencimientoMenosFechaEmision"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["nroPago"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: ["plazoCupon"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: ["prepago"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: ["subordinado"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["calificadora"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodio"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    DU: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "codigo_custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoCustodia"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    UD: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        singleGroup: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        // unique: true,
        singleGroup: true,
        endSingleGroup: true,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{0,4})$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["interesMasAmortizacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["saldoCapitalMenosAmortizacionCuponAnterior"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    TO: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "pais",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["pais"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        functions: ["fechaVencimientoMenosFechaEmision"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["nroPago"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: ["plazoCupon"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        functions: ["calificadora"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    CO: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        unique: true,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_fecha_vencimiento",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        notValidate: true,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["interesMasAmortizacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["saldoCapitalMenosAmortizacionCuponAnterior"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    TV: [
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_accion",
        pattern: /^[A-Za-z0-2]{1,1}$/,
        functions: ["tipoAccion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie_emision",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        mayBeEmpty: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_unitario",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        functions: ["calificacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["calificadora"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodio"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    DC: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        singleGroup: true,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        functions: ["tasaRelevanteConInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoValorConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoEconomicoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecioEquivalente"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        mayBeEmpty: true,
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["calificacionConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["calificadoraConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        functions: ["tipoValoracionConsultaMultiple"],
        singleGroup: true,
        endSingleGroup: true,
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaUltimoHechoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    DO: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        singleGroup: true,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(^-?(0|[1-9][0-9]{0,2}))(\.\d{8,8}){1,1}$/,
        functions: ["tasaRendimientoConInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        singleGroup: true,
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecioMO"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificadora"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        functions: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
        endSingleGroup: true,
      },
    ],
    BG: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,13}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{4,80}$/,
        functions: ["codigoCuentaDescripcion"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_cuotas",
        pattern: /^(^-?(0|[1-9][0-9]{0,11}))(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    FE: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,9}$/,
        functions: ["codigoCuenta"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    VC: [
      {
        columnName: "codigo_item",
        pattern: /^[A-Za-z0-9\-\.]{1,11}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuotas",
        pattern: /^(^-?(0|[1-9][0-9]{0,11}))(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    CD: [
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        date: true,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "valor_cuota",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,4})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    DE: [
      {
        columnName: "codigo",
        pattern: /^[A-Za-z0-9\.]{4,5}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "concepto",
        pattern: /^[\s\S]{5,80}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuenta_a_p",
        pattern: /^[A-Za-z0-9]{5,5}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuenta_p_a",
        pattern: /^[A-Za-z0-9]{5,5}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "monto",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    FC: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,9}$/,
        functions: ["codigoCuenta"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    LQ: [
      {
        columnName: "codigo_fondo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoFondo"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tipo_cuenta_liquidez",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoCuentaLiquidez"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "codigo_banco",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoBanco"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{10,20}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[A-Za-z]{8,8}$/,
        functions: ["cuentaContable"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "rango_inferior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "rango_superior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    TR: [
      {
        columnName: "codigo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoAFP"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "nombre",
        pattern: /^[\s\S]{3,3}$/,
        functions: ["nombreAFP"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "r_nro_cuentas",
        pattern: /^(^-?(0|[1-9][0-9]{0,3}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "r_monto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "r_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "r_rezagos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "r_rezagos_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "e_nro_cuentas",
        pattern: /^(^-?(0|[1-9][0-9]{0,3}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "e_monto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "e_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "e_rezagos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "e_rezagos_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_recibidos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_enviados_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "diferencia_neta_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["totalRecibidosBs-totalEnviadosBs"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
    CC: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(^-?(0|[1-9][0-9]{0,1}))(\.\d{8,8}){1,1}$/,
        functions: ["mayorIgualACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_mercado_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "precio_mercado_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACeroDecimal"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACeroEntero"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "total_mercado_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["precioMercadoMOMultiplicadoCantidadValores"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
      {
        columnName: "custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodio"],
        messages: {
          DEFAULT_ERROR_DATA_TYPE_MESSAGE: defaultErrorDataTypeMessage,
          MESSAGE_ERROR_DB: "",
        },
      },
    ],
  };
  try {
    return TYPE_FILES[typeFile];
  } catch (err) {
    throw err;
  }
};

const CONF_FILE_BY_CODE = {
  K: {
    table: "APS_oper_archivo_k",
  },
  L: {
    table: "APS_oper_archivo_l",
  },
  N: {
    table: "APS_oper_archivo_n",
  },
  P: {
    table: "APS_oper_archivo_p",
  },
  411: {
    table: "APS_seguro_archivo_411",
  },
  412: {
    table: "APS_seguro_archivo_412",
  },
  413: {
    table: "APS_seguro_archivo_413",
  },
  441: {
    table: "APS_seguro_archivo_441",
  },
  442: {
    table: "APS_seguro_archivo_442",
  },
  443: {
    table: "APS_seguro_archivo_443",
  },
  444: {
    table: "APS_seguro_archivo_444",
  },
  445: {
    table: "APS_seguro_archivo_445",
  },
  451: {
    table: "APS_seguro_archivo_451",
  },
  481: {
    table: "APS_seguro_archivo_481",
  },
  482: {
    table: "APS_seguro_archivo_482",
  },
  483: {
    table: "APS_seguro_archivo_483",
  },
  484: {
    table: "APS_seguro_archivo_484",
  },
  485: {
    table: "APS_seguro_archivo_485",
  },
  486: {
    table: "APS_seguro_archivo_486",
  },
  461: {
    table: "APS_seguro_archivo_461",
  },
  471: {
    table: "APS_seguro_archivo_471",
  },
  491: {
    table: "APS_seguro_archivo_491",
  },
  492: {
    table: "APS_seguro_archivo_492",
  },
  494: {
    table: "APS_seguro_archivo_494",
  },
  496: {
    table: "APS_seguro_archivo_496",
  },
  497: {
    table: "APS_seguro_archivo_497",
  },
  498: {
    table: "APS_seguro_archivo_498",
  },
  DM: {
    table: "APS_pensiones_archivo_DM",
  },
  DR: {
    table: "APS_pensiones_archivo_DR",
  },
  UA: {
    table: "APS_pensiones_archivo_UA",
  },
  UE: {
    table: "APS_pensiones_archivo_UE",
  },
  TD: {
    table: "APS_pensiones_archivo_TD",
  },
  DU: {
    table: "APS_pensiones_archivo_DU",
  },
  UD: {
    table: "APS_pensiones_archivo_UD",
  },
  TO: {
    table: "APS_pensiones_archivo_TO",
  },
  CO: {
    table: "APS_pensiones_archivo_CO",
  },
  TV: {
    table: "APS_pensiones_archivo_TV",
  },
  DC: {
    table: "APS_pensiones_archivo_DC",
  },
  DO: {
    table: "APS_pensiones_archivo_DO",
  },
  BG: {
    table: "APS_pensiones_archivo_BG",
  },
  FE: {
    table: "APS_pensiones_archivo_FE",
  },
  VC: {
    table: "APS_pensiones_archivo_VC",
  },
  CD: {
    table: "APS_pensiones_archivo_CD",
  },
  DE: {
    table: "APS_pensiones_archivo_DE",
  },
  FC: {
    table: "APS_pensiones_archivo_FC",
  },
  LQ: {
    table: "APS_pensiones_archivo_LQ",
  },
  TR: {
    table: "APS_pensiones_archivo_TR",
  },
  CC: {
    table: "APS_oper_archivo_Custodio",
  },
};

module.exports = {
  obtenerInformacionColumnasArchivosBD,
  obtenerValidacionesArchivos,
  CONF_FILE_VALUE_VALIDATIONS,
  CONF_FILE_QUERIES_DATABASE,
};
