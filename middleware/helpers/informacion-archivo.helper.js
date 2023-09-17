const { size, forEach, map, find, set, filter } = require("lodash");
const {
  EjecutarQuery,
  ObtenerColumnasDeTablaUtil,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");

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
  try {
    const optionsValidationsFiles = {};
    const querysFiles = [];
    const keysFiles = {};
    const executedFilesQueries = {};
    forEach(validatedContentFormatFiles, (fileContent, fileNameAndCode) => {
      const fileName = fileNameAndCode.split("_separador_")[0];
      const fileCode = fileNameAndCode.split("_separador_")[1];
      const fileValidations = CONF_FILE_VALUE_VALIDATIONS(fileCode);
      forEach(fileValidations, (validation) => {
        const { globalFileValidations } = validation;
        if (globalFileValidations?.queries) {
          const { queries } = globalFileValidations;
          const preparedQueries = queries();
          keysFiles[fileCode] = preparedQueries.keys;
          executedFilesQueries[fileCode] = {};
          querysFiles.push(...preparedQueries.querys);
          delete globalFileValidations.queries;
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
          // console.log(fileCode, executedQuerys);
          forEach(executedQuerys, (executedQuery, columnKeyQuery) => {
            const validations = filter(validationsFile, (validation) =>
              columnKeyQuery.includes(validation.columnName)
            );
            forEach(validations, (validation) => {
              validation.paramsBD = {
                ...validation?.paramsBD,
                [`${columnKeyQuery}_data_db`]: executedQuery,
              };
            });
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
  console.log(typeFile);
  //! IMPORTANTE: Para que una consulta se acople a una columna de validacion, se debee colocar el mismo nombre de la columna de validacion en el objeto TYPES_QUERY_FILES, por otro lado si es que se quiere aumentar otra consulta a esa misma columna de validacion, se debe colocar el mismo nombre de la columna de validacion seguido de "_VALOR", por ejemplo: "calificacion, calificacion_vacio"
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
              valuesWhereIn: [136],
              whereIn: true,
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
              key: "id_clasificador_comun",
              valuesWhereIn: [106],
              whereIn: true,
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
    TD: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            { key: "id_tipo_mercado", value: 200 },
            { key: "id_tipo_renta", value: 135 },
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
          where: [{ key: "id_clasificador_comun_grupo", value: 6 }],
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
    TO: {
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
            { key: "id_pais", value: 8, operator: "<>" },
            { key: "codigo_rmv", value: "TGN", operatorSQL: "OR" },
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
    TV: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              valuesWhereIn: [136],
              whereIn: true,
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
              key: "id_clasificador_comun",
              valuesWhereIn: [9],
              whereIn: true,
            },
          ],
        },
      },
    },
    UD: {
      tipo_instrumento: {
        table: "APS_param_tipo_instrumento",
        queryOptions: {
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_mercado",
              value: 200,
            },
            {
              key: "id_tipo_renta",
              value: 135,
            },
          ],
        },
      },
    },
    CO: {
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
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionIgual"],
        messages: {
          DATA_TYPE: "El campo no cumple el formato establecido",
        },
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        functions: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{1,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9\-]{5,30}$/,
        functions: [],
      },
      {
        columnName: "tasa_promedio",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: ["marcacion"],
      },
    ],
    L: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionIgual"],
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,7}$/,
        functions: [],
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: ["tipoValoracion"],
      },
    ],
    N: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionIgual"],
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        functions: [],
      },
      {
        columnName: "fecha_marcacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    P: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionIgual"],
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9]{9,30}$/,
        functions: [],
      },
      {
        columnName: "ult_fecha_disponible",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "tasa",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "precio_bid",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
    ],
    411: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { correlativo: [] },
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_operacion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["lugar_negociacion"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion", "operacionValida"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,8}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "cantidad_valores" },
          "*",
          { column: "precio_negociacion" },
        ],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    412: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { correlativo: [] },
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_operacion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["lugar_negociacion"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        functions: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion", "operacionValida"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        mathOperation: [
          { column: "cantidad_valores" },
          "*",
          { column: "precio_negociacion" },
        ],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    413: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_operacion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "cartera_origen",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        functions: ["cartera"],
      },
      {
        columnName: "cartera_destino",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        functions: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    441: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [["tipo_instrumento", "serie"]],
          formatDateFields: {
            fecha_vencimiento: "yyyy-MM-dd",
            fecha_emision: "yyyy-MM-dd",
          },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoAmortizacion"],
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["tipoInteres"],
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["tipoTasa"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaEmision"],
      },
      {
        columnName: "plazo_emision",
        pattern: [/^(0|[1-9][0-9]{1,4})$/, /^(0|[1-9][0-9]{0,2})$/],
        functions: ["plazoEmisionTiposDeDatos"],
        mathOperation: [
          { column: "fecha_vencimiento", isDate: true },
          "-",
          { column: "fecha_emision", isDate: true, operateResultBy: "days" },
        ],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: ["plazoCupon"],
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: ["prepago"],
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: ["subordinado"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,4}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodio"],
      },
    ],
    442: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [["tipo_instrumento", "serie"]],
          validateFieldWithOperationDate: [],
          formatDateFields: {
            fecha_vencimiento: "yyyy-MM-dd",
            fecha_emision: "yyyy-MM-dd",
          },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
      },
      {
        columnName: "pais",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["pais"],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: ["moneda"],
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,9}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        mathOperation: [
          { column: "fecha_vencimiento", isDate: true },
          "-",
          { column: "fecha_emision", isDate: true, operateResultBy: "days" },
        ],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: ["plazoCupon"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-\+]{1,3}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        functions: ["calificadora"],
      },
    ],
    443: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [["tipo_instrumento", "serie"]],
          validateFieldWithOperationDate: [],
          formatDateFields: {
            fecha_emision: "yyyy-MM-dd",
          },
          mayBeEmptyFields: [
            "serie",
            "calificacion",
            "calificadora",
            "custodio",
          ],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "tipo_accion",
        pattern: /^[A-Za-z0-2]{1,1}$/,
        functions: ["tipoAccion"],
      },
      {
        columnName: "serie_emision",
        pattern: /^[A-Za-z0-9]{1,1}$/,
        functions: ["serieEmision"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        functions: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{2,9}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_unitario",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        functions: ["calificacionConInstrumento"],
        extraFunctionsParameters: {
          tiposInstrumentos: ["CFC", "ACC"],
        },
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["calificadoraConCalificacion"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodioConInstrumento"],
        extraFunctionsParameters: {
          tiposInstrumentos: ["ACC"],
        },
      },
    ],
    444: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { nro_cupon: ["serie"] },
          uniqueCombinationPerFile: [],
          validateFieldWithOperationDate: [],
          replaceFieldValue: { fecha_pago: "yyyy-MM-dd" },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{0,3})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          "(",
          { column: "saldo_capital" },
          "*",
          { column: "plazo_cupon" },
          "*",
          { column: "tasa_interes" },
          ")",
          "/",
          { number: 36000 },
        ],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [{ column: "interes" }, "+", { column: "amortizacion" }],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_capital", operRow: -1 },
          "-",
          { column: "amortizacion" },
        ],
      },
    ],
    445: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { nro_cupon: ["serie"] },
          uniqueCombinationPerFile: [],
          validateFieldWithOperationDate: [],
          replaceFieldValue: { fecha_pago: "yyyy-MM-dd" },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_fecha_vencimiento",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          "(",
          { column: "saldo_capital" },
          "*",
          { column: "plazo_cupon" },
          "*",
          { column: "tasa_interes" },
          ")",
          "/",
          { number: 36000 },
        ],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [{ column: "interes" }, "+", { column: "amortizacion" }],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_capital", operRow: -1 },
          "-",
          { column: "amortizacion" },
        ],
      },
    ],
    451: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoCuenta"],
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["entidadFinanciera"],
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{8,20}$/,
        functions: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    481: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [
            [
              "tipo_instrumento",
              "serie",
              "tasa_relevante",
              "custodio",
              "fecha_adquisicion",
              "tipo_valoracion",
            ],
          ],
          formatDateFields: {
            fecha_adquisicion: "yyyy-MM-dd",
            fecha_ultimo_hecho: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["calificacion", "calificadora", "custodio"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        functions: [],
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        functions: ["tasaRelevanteConInstrumento"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoValorConInstrumento"],
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoEconomicoConInstrumento"],
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "cantidad" },
          "*",
          { column: "precio_equivalente" },
        ],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["calificacionConInstrumento"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["calificadoraConInstrumento"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["custodio"],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenorAlArchivo"],
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        functions: ["tipoValoracionConsultaMultiple"],
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaUltimoHechoConInstrumento"],
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion"],
      },
    ],
    482: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [
            [
              "tipo_instrumento",
              "serie",
              "tasa_relevante",
              "custodio",
              "fecha_adquisicion",
              "tipo_valoracion",
            ],
          ],
          formatDateFields: {
            fecha_adquisicion: "yyyy-MM-dd",
            fecha_ultimo_hecho: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["calificacion", "calificadora", "custodio"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        functions: [],
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        functions: ["tasaRelevanteConInstrumento"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoValorConInstrumento"],
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoEconomicoConInstrumento"],
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "cantidad" },
          "*",
          { column: "precio_equivalente" },
        ],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["calificacionConInstrumento"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["calificadoraConInstrumento"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["custodio"],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenorAlArchivo"],
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        functions: ["tipoValoracionConsultaMultiple"],
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaUltimoHechoConInstrumento"],
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion"],
      },
    ],
    483: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_adquisicion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["serie"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z0-9\-\ ]{3,20}$/,
        functions: [],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        functions: [],
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z0-9\.\- ]{5,50}$/,
        functions: [],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenorAlArchivo"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [{ column: "cantidad" }, "*", { column: "precio" }],
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "total_bs" },
          "-",
          { column: "prevision_inversiones_bs" },
        ],
      },
    ],
    484: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [
            [
              "tipo_activo",
              "serie",
              "precio_mo",
              "custodio",
              "fecha_adquisicion",
            ],
          ],
          formatDateFields: {
            fecha_adquisicion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["custodio"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaRendimientoConInstrumento"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["custodio"],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenorAlArchivo"],
      },
    ],
    485: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [
            [
              "tipo_activo",
              "serie",
              "precio_mo",
              "custodio",
              "fecha_adquisicion",
            ],
          ],
          formatDateFields: {
            fecha_adquisicion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["custodio"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaRendimientoConInstrumento"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        functions: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["custodio"],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenorAlArchivo"],
      },
    ],
    486: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["entidadEmisora"],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionIgual"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [{ column: "cantidad" }, "*", { column: "precio" }],
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "total_bs" },
          "-",
          { column: "prevision_inversiones_bs" },
        ],
      },
    ],
    461: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoCuenta"],
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["entidadFinanciera"],
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{5,20}$/,
        functions: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    471: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [
            ["tipo_activo", "detalle_1", "detalle_2", "cuenta_contable"],
          ],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoActivo"],
      },
      {
        columnName: "detalle_1",
        pattern: /^[A-Za-z0-9]{3,25}$/,
        functions: [],
      },
      {
        columnName: "detalle_2",
        pattern: /^[A-Za-z0-9À-ÿ\u00f1\u00d1\.\- ]{5,25}$/,
        functions: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
      },
    ],
    491: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_compra: "yyyy-MM-dd",
            fecha_rev_tec: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["fecha_rev_tec", "observaciones"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "codigo_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        functions: [],
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["ciudad"],
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "superficie",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9\.\-]{5,25}$/,
        functions: [],
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9\/\-]{5,15}$/,
        functions: [],
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "incremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "decremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "fecha_rev_tec",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_anterior" },
          "+",
          { column: "incremento_rev_tec" },
          "+",
          { column: "decremento_rev_tec" },
          "+",
          { column: "altas_bajas" },
          "+",
          { column: "actualizacion" },
        ],
      },
      {
        columnName: "saldo_anterior_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "bajas_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "actualizacion_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "saldo_final_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_anterior_dep_acum" },
          "+",
          { column: "bajas_dep_acum" },
          "+",
          { column: "actualizacion_dep_acum" },
          "+",
          { column: "depreciacion_periodo" },
        ],
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["saldoFinalMenosSaldoFinalDep"],
        mathOperation: [
          { column: "saldo_final" },
          "-",
          { column: "saldo_final_dep_acum" },
        ],
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["totalVidaUtil"],
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["vidaUtilRestante"],
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        functions: [],
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "tipo_bien_inmueble",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoBienInmueble"],
      },
    ],
    492: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_compra: "yyyy-MM-dd",
            fecha_rev_tec: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["fecha_rev_tec", "observaciones"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "codigo_contable",
        pattern: /^[0-9]{12,12}$/,
        functions: [],
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        functions: [],
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["ciudad"],
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "superficie",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9\.\-]{5,25}$/,
        functions: [],
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9\/\-]{5,15}$/,
        functions: [],
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "incremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "decremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "fecha_rev_tec",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_anterior" },
          "+",
          { column: "incremento_rev_tec" },
          "+",
          { column: "decremento_rev_tec" },
          "+",
          { column: "altas_bajas" },
          "+",
          { column: "actualizacion" },
        ],
      },
      {
        columnName: "saldo_anterior_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "bajas_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "actualizacion_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["menorIgualACero"],
      },
      {
        columnName: "saldo_final_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_anterior_dep_acum" },
          "+",
          { column: "bajas_dep_acum" },
          "+",
          { column: "actualizacion_dep_acum" },
          "+",
          { column: "depreciacion_periodo" },
        ],
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_final" },
          "-",
          { column: "saldo_final_dep_acum" },
        ],
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["totalVidaUtil"],
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        functions: ["vidaUtilRestante"],
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        functions: [],
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "tipo_bien_inmueble",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoBienInmueble"],
      },
    ],
    494: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {},
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{10,100}$/,
        functions: [],
      },
      {
        columnName: "saldo_final_mes_anterior_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "movimiento_mes_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_final_mes_actual_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_final_mes_anterior_bs" },
          "+",
          { column: "movimiento_mes_bs" },
        ],
      },
      {
        columnName: "total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    496: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_compra: "yyyy-MM-dd",
          },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{20,150}$/,
        functions: [],
      },
      {
        columnName: "ubicacion",
        pattern: /^[\s\S]{20,150}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenor"],
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "incremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "decremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "altas_bajas_bienes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_final",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "altas_bajas_depreciacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_final_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "depreciacion_periodo" },
          "+",
          { column: "altas_bajas_depreciacion" },
        ],
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "valor_neto_usd",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACero"],
      },
    ],
    497: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_prestamo: "yyyy-MM-dd",
            fecha_inicio: "yyyy-MM-dd",
            fecha_finalizacion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "nombre_rentista",
        pattern: /^[\s\S]{10,50}$/,
        functions: [],
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenor"],
      },
      {
        columnName: "nro_documento_prestamo",
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        functions: [],
      },
      {
        columnName: "fecha_inicio",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenor"],
      },
      {
        columnName: "fecha_finalizacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenor"],
      },
      {
        columnName: "plazo_prestamo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_interes_mensual",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "frecuencia_pago",
        pattern: /^[A-Za-z0-9\-]{3,7}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cantidad_cuotas",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cuota_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_total_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "cantidad_cuotas" },
          "*",
          { column: "cuota_bs" },
        ],
      },
      {
        columnName: "amortizacion_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_actual_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "intereses_percibidos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    498: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_inicio_prestamo: "yyyy-MM-dd",
            fecha_finalizacion_prestamo: "yyyy-MM-dd",
            fecha_prestamo: "yyyy-MM-dd",
          },
          mayBeEmptyFields: [],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "nro_poliza",
        pattern: /^[A-Za-z0-9\-]{5,10}$/,
        functions: [],
      },
      {
        columnName: "fecha_inicio_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenor"],
      },
      {
        columnName: "fecha_finalizacion_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenor"],
      },
      {
        columnName: "asegurado",
        pattern: /^[\s\S]{10,50}$/,
        functions: [],
      },
      {
        columnName: "plan_seguro",
        pattern: /^[\s\S]{10,18}$/,
        functions: [],
      },
      {
        columnName: "monto_total_asegurado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "valor_rescate_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: ["fechaOperacionMenor"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo",
        pattern: /^[\s\S]{2,8}$/,
        functions: [],
      },
      {
        columnName: "importe_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "altas_bajas_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "amortizacion_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "saldo_actual",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "sucursal",
        pattern: /^[\s\S]{5,10}$/,
        functions: [],
      },
    ],
    DM: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { correlativo: [] },
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_operacion: "yyyy-MM-dd",
          },
          mayBeEmptyFields: ["lugar_negociacion"],
          queries: () => resultQueries(),
        },
      },

      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipo_operacion", "operacionValida"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
        mathOperation: [
          { column: "cantidad_valores" },
          "*",
          { column: "precio_negociacion" },
        ],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    DR: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        functions: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        functions: ["tipoOperacion"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        functions: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadValoresMultiplicadoPrecioNegociacion"],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    UA: [
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "precio_cupon_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
      },
      {
        columnName: "precio_cupon_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
      },
    ],
    UE: [
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        functions: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "precio_cupon_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
      },
      {
        columnName: "precio_cupon_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
      },
    ],
    TD: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [["tipo_instrumento", "serie"]],
          formatDateFields: {
            fecha_vencimiento: "yyyy-MM-dd",
            fecha_emision: "yyyy-MM-dd",
          },
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoAmortizacion"],
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["tipoInteres"],
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["tipoTasa"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        functions: [],
        mathOperation: [
          { column: "fecha_vencimiento", isDate: true },
          "-",
          { column: "fecha_emision", isDate: true, operateResultBy: "days" },
        ],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: ["plazoCupon"],
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: ["prepago"],
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        functions: ["subordinado"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodio"],
      },
    ],
    DU: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "codigo_custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoCustodia"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
    ],
    UD: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { nro_cupon: ["serie"] },
          uniqueCombinationPerFile: [],
          formatDateFields: { fecha_pago: "yyyy-MM-dd" },
          mayBeEmptyFields: ["serie", "calificacion", "calificadora"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{0,4})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          "(",
          { column: "saldo_capital" },
          "*",
          { column: "plazo_cupon" },
          "*",
          { column: "tasa_interes" },
          ")",
          "/",
          { number: 36000 },
        ],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [{ column: "interes" }, "+", { column: "amortizacion" }],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_capital", operRow: -1 },
          "-",
          { column: "amortizacion" },
        ],
      },
    ],
    TO: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_vencimiento: "yyyy-MM-dd",
            fecha_emision: "yyyy-MM-dd",
          },
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
      },
      {
        columnName: "pais",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["pais"],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{2,2}$/,
        functions: ["moneda"],
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        functions: [],
        mathOperation: [
          { column: "fecha_vencimiento", isDate: true },
          "-",
          { column: "fecha_emision", isDate: true, operateResultBy: "days" },
        ],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        functions: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        functions: ["plazoCupon"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        functions: ["calificadora"],
      },
    ],
    CO: [
      {
        globalFileValidations: {
          fieldsUniqueBy: { nro_cupon: ["serie"] },
          uniqueCombinationPerFile: [],
          formatDateFields: {
            fecha_pago: "yyyy-MM-dd",
          },
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        functions: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        unique: true,
        functions: ["mayorACero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_fecha_vencimiento",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        mathOperation: [
          "(",
          { column: "saldo_capital" },
          "*",
          { column: "plazo_cupon" },
          "*",
          { column: "tasa_interes" },
          ")",
          "/",
          { number: 36000 },
        ],
        functions: [],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [{ column: "interes" }, "+", { column: "amortizacion" }],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: [],
        mathOperation: [
          { column: "saldo_capital", operRow: -1 },
          "-",
          { column: "amortizacion" },
        ],
      },
    ],
    TV: [
      {
        globalFileValidations: {
          fieldsUniqueBy: {},
          uniqueCombinationPerFile: [],
          formatDateFields: { fecha_emision: "yyyy-MM-dd" },
          mayBeEmptyFields: ["serie", "calificacion", "calificadora"],
          queries: () => resultQueries(),
        },
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        functions: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "tipo_accion",
        pattern: /^[A-Za-z0-2]{1,1}$/,
        functions: ["tipoAccion"],
      },
      {
        columnName: "serie_emision",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: [],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        functions: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_unitario",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        functions: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodio"],
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
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoValorConInstrumento"],
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        functions: ["plazoEconomicoConInstrumento"],
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecioEquivalente"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        mayBeEmpty: true,
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        functions: ["calificacionConInstrumento"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        functions: ["calificadoraConInstrumento"],
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
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        functions: ["tasaUltimoHechoConInstrumento"],
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoOperacion"],
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
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
        singleGroup: true,
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["cantidadMultiplicadoPrecioMO"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        functions: ["moneda"],
      },
      {
        columnName: "total_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        functions: ["calificadora"],
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
      },
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{4,80}$/,
        functions: ["codigoCuentaDescripcion"],
      },
      {
        columnName: "saldo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "saldo_cuotas",
        pattern: /^(^-?(0|[1-9][0-9]{0,11}))(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
    ],
    FE: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,9}$/,
        functions: ["codigoCuenta"],
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
    ],
    VC: [
      {
        columnName: "codigo_item",
        pattern: /^[A-Za-z0-9\-\.]{1,11}$/,
        functions: [],
      },
      {
        columnName: "saldo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "cuotas",
        pattern: /^(^-?(0|[1-9][0-9]{0,11}))(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
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
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "valor_cuota",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,4})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    DE: [
      {
        columnName: "codigo",
        pattern: /^[A-Za-z0-9\.]{4,5}$/,
        functions: [],
      },
      {
        columnName: "concepto",
        pattern: /^[\s\S]{5,80}$/,
        functions: [],
      },
      {
        columnName: "cuenta_a_p",
        pattern: /^[A-Za-z0-9]{5,5}$/,
        functions: [],
      },
      {
        columnName: "cuenta_p_a",
        pattern: /^[A-Za-z0-9]{5,5}$/,
        functions: [],
      },
      {
        columnName: "nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "monto",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
    ],
    FC: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,9}$/,
        functions: ["codigoCuenta"],
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
    ],
    LQ: [
      {
        columnName: "codigo_fondo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoFondo"],
      },
      {
        columnName: "tipo_cuenta_liquidez",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoCuentaLiquidez"],
      },
      {
        columnName: "codigo_banco",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoBanco"],
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{10,20}$/,
        functions: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[A-Za-z]{8,8}$/,
        functions: ["cuentaContable"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["moneda"],
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "rango_inferior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "rango_superior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
    ],
    TR: [
      {
        columnName: "codigo",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["codigoAFP"],
      },
      {
        columnName: "nombre",
        pattern: /^[\s\S]{3,3}$/,
        functions: ["nombreAFP"],
      },
      {
        columnName: "r_nro_cuentas",
        pattern: /^(^-?(0|[1-9][0-9]{0,3}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "r_monto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "r_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "r_rezagos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "r_rezagos_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "e_nro_cuentas",
        pattern: /^(^-?(0|[1-9][0-9]{0,3}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "e_monto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "e_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "e_rezagos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "e_rezagos_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "total_recibidos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_enviados_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "diferencia_neta_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        functions: ["totalRecibidosBs-totalEnviadosBs"],
      },
    ],
    CC: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        functions: [],
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(^-?(0|[1-9][0-9]{0,1}))(\.\d{8,8}){1,1}$/,
        functions: ["mayorIgualACero"],
      },
      {
        columnName: "precio_nominal_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_mercado_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "precio_mercado_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        functions: ["mayorACero"],
      },
      {
        columnName: "total_mercado_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        functions: ["precioMercadoMOMultiplicadoCantidadValores"],
      },
      {
        columnName: "custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        functions: ["custodio"],
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
