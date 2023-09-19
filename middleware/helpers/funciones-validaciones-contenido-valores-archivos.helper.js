const {
  isUndefined,
  find,
  isNumber,
  filter,
  map,
  forEach,
  size,
  isObject,
  includes,
  isNull,
  reduce,
  some,
  isEqual,
  groupBy,
  pickBy,
  intersection,
  intersectionBy,
  intersectionWith,
  uniqBy,
  flatMap,
  pick,
  differenceBy,
  difference,
  isEmpty,
  trim,
} = require("lodash");
const { DateTime } = require("luxon");
const math = require("mathjs");

const operateDates = (operations) => {
  try {
    let result = null;
    let operator = null;
    let resultFinal = null;
    let posInit = 0;
    let posEnd = 0;

    forEach(operations, (element, index) => {
      if (element?.date) {
        const { date, operateResultBy } = element;
        if (result === null) {
          result = date;
          posInit = index;
        } else {
          if (operator === "+") result = result + date;
          else if (operator === "-") result = result - date;
          else if (operator === "*") result = result * date;
          else if (operator === "/") result = result / date;
        }
        if (operateResultBy === "days") {
          posEnd = index;
          resultFinal = Math.abs(result) / (1000 * 3600 * 24);
        }
      } else if (["+", "-", "*", "/"].includes(element)) {
        operator = element;
      }
    });
    return { resultFinal, posInit, posEnd };
  } catch (err) {
    throw err;
  }
};

const searchValueInArray = (array, value) => {
  const searchResult = find(array, (element) => {
    const property = Object.keys(element)[0];
    return element[property] === value;
    // return some(properties, (property) => element[property] === value);
  });
  return !isUndefined(searchResult);
};

const fixedByPattern = (value, pattern, columnIndex) => {
  const indexPattern = new RegExp(pattern).toString().indexOf(".");
  const textPattern = new RegExp(pattern).toString();
  let fixed = undefined;
  let newResult = value;
  if (columnIndex === "interes") {
    newResult = parseFloat(newResult.toFixed(8)).toFixed(2);
  } else {
    if (textPattern.slice(indexPattern, indexPattern + 4) === ".\\d{") {
      fixed = parseInt(textPattern.slice(indexPattern + 6, indexPattern + 7));
      if (isNumber(fixed) && fixed > 0) newResult = newResult.toFixed(fixed);
    } else if (size(textPattern) >= 23 && size(textPattern) < 30) {
      fixed = 2;
      if (isNumber(fixed) && fixed > 0) newResult = newResult.toFixed(fixed);
    }
  }
  return newResult;
};

const defaultValidationContentValues = (params, message) => {
  try {
    if (isUndefined(params?.paramsBD)) throw "Consultas de campo no definidas";
    const {
      paramsBD,
      value,
      messages,
      mayBeEmptyFields,
      columnIndex,
      functionName,
    } = params;
    const key = functionName;
    if (isEmpty(value) && includes(mayBeEmptyFields, columnIndex)) return true;
    if (!searchValueInArray(paramsBD[`${key}DataDB`], value))
      return (
        messages?.ERROR_MESSAGE_DB ||
        message ||
        "El campo no corresponde a ningún registro válido"
      );
    return true;
  } catch (err) {
    return `Error de servidor. ${err}`;
  }
};

const funcionesValidacionesContenidoValores = {
  bolsa: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados por el RMV"
    );
  },
  tipoMarcacion: (params) => {
    const { value, row } = params;
    const { monto_negociado, monto_minimo } = row;
    const tipoMarcacion = value;
    const montoNegociado = parseFloat(monto_negociado);
    const montoMinimo = parseFloat(monto_minimo);
    if (!isNumber(montoNegociado) || !isNumber(montoMinimo))
      return `El campo monto_negociado o monto_minimo no son números validos`;
    if (montoNegociado !== 0 && montoNegociado >= montoMinimo) {
      if (!includes(["AC, NA"], tipoMarcacion))
        return `El campo monto_negociado es mayor o igual a monto_minimo por lo tanto el valor de tipo_marcacion debe ser [AC, NA]`;
    }
    if (monto_negociado !== 0 && monto_negociado < monto_minimo) {
      if (!includes(["NM"], tipoMarcacion))
        return `El campo monto_negociado es menor a monto_minimo por lo tanto el valor de tipo_marcacion debe ser [NM]`;
    }

    return true;
  },
  tipoValoracion: (params) => {
    return defaultValidationContentValues(
      params,
      "El contenido del archivo no coincide con alguna sigla de Tipo de Valoración"
    );
  },
  tipoActivo: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados"
    );
  },
  tipoOperacion: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados por el RMV"
    );
  },
  tipoInstrumento: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados por el RMV"
    );
  },
  lugarNegociacion: (params) => {
    try {
      if (isUndefined(params?.paramsBD))
        throw "Consultas de campo no definidas";
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const { lugarNegociacionDataDB, lugarNegociacionVacioDataDB } = paramsBD;
      const lugarNegociacionValue = value;
      const tipoOperacion = row.tipo_operacion;
      const lugarNegociacionMap = map(lugarNegociacionDataDB, "codigo_rmv");
      const tiposOperacionesMap = map(
        lugarNegociacionVacioDataDB,
        "codigo_rmv"
      );
      if (includes(tiposOperacionesMap, tipoOperacion)) {
        if (
          isEmpty(lugarNegociacionValue) &&
          includes(mayBeEmptyFields, "lugar_negociacion")
        )
          return true;
        else
          return `El lugar de negociacion debe ser vacio debido a que el tipo de operación es ${tipoOperacion}`;
      } else {
        if (!includes(lugarNegociacionMap, lugarNegociacionValue))
          return `El lugar de negociación no es válido debido a que el tipo de operación es ${tipoOperacion}`;
      }
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  cartera: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const { cartera_destino } = row;
      const carteraOrigenValue = value;
      const carterDestino = cartera_destino;

      const ALLOWED_VALUES_1 = {
        cartera_origen: ["481", "482", "483"],
        cartera_destino: ["481", "482", "483"],
      };
      const ALLOWED_VALUES_2 = {
        cartera_origen: ["484", "485", "486"],
        cartera_destino: ["484", "485", "486"],
      };

      if (carteraOrigenValue === carterDestino)
        return `El campo cartera_origen no puede ser igual al campo cartera_destino`;

      const carteraOrigenAllowedValues1 =
        ALLOWED_VALUES_1.cartera_origen.indexOf(carteraOrigenValue);
      const carteraOrigenAllowedValues2 =
        ALLOWED_VALUES_2.cartera_origen.indexOf(carteraOrigenValue);
      const carteraDestinoAllowedValues1 =
        ALLOWED_VALUES_1.cartera_origen.indexOf(carterDestino);
      const carteraDestinoAllowedValues2 =
        ALLOWED_VALUES_2.cartera_origen.indexOf(carterDestino);
      if (carteraOrigenAllowedValues1 !== -1) {
        if (carteraDestinoAllowedValues1 === -1) {
          return `El campo cartera_destino no se encuentra entre los valores permitidos: [${ALLOWED_VALUES_1.cartera_destino.join(
            ", "
          )}]`;
        }
      } else if (carteraOrigenAllowedValues2 !== -1) {
        if (carteraDestinoAllowedValues2 === -1) {
          return `El campo cartera_destino no se encuentra entre los valores permitidos: [${ALLOWED_VALUES_2.cartera_destino.join(
            ", "
          )}]`;
        }
      } else {
        return `El campo cartera_origen no se encuentra entre los valores permitidos: [${ALLOWED_VALUES_1.cartera_origen.join(
          ", "
        )}], [${ALLOWED_VALUES_2.cartera_origen.join(", ")}]`;
      }
      return true;
    } catch (err) {
      throw err;
    }
  },
  tipoCuenta: (params) => {
    return defaultValidationContentValues(
      params,
      "El contenido del archivo no coincide con alguna sigla de tipo de cuenta"
    );
  },
  entidadFinanciera: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguna entidad financiera activa"
    );
  },
  tasaRelevanteConTipoInstrumento: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const tasaRelevante = value;
      const { tipo_instrumento } = row;
      const {
        tasaRelevanteConTipoInstrumentoDataBD,
        tasaRelevanteConTipoInstrumentoDiferenteDataBD,
      } = paramsBD;
      const instrumentosMap = map(
        tasaRelevanteConTipoInstrumentoDataBD,
        "sigla"
      );
      const instrumentosDiferentesMap = map(
        tasaRelevanteConTipoInstrumentoDiferenteDataBD,
        "sigla"
      );
      if (includes(instrumentosMap, tipo_instrumento)) {
        if (parseFloat(tasaRelevante) > 0)
          return `El valor de tasa_relevante debe ser 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      } else if (includes(instrumentosDiferentesMap, tipo_instrumento)) {
        if (parseFloat(tasaRelevante) < 0)
          return `El valor de tasa_relevante debe mayor o igual a 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      }
    } catch (err) {
      throw err;
    }
  },
  plazoValorConTipoInstrumento: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const plazoValor = value;
      const { tipo_instrumento } = row;
      const {
        plazoValorConTipoInstrumentoDataBD,
        plazoValorConTipoInstrumentoDiferenteDataBD,
      } = paramsBD;
      const instrumentosMap = map(plazoValorConTipoInstrumentoDataBD, "sigla");
      const instrumentosDiferentesMap = map(
        plazoValorConTipoInstrumentoDiferenteDataBD,
        "sigla"
      );
      if (includes(instrumentosMap, tipo_instrumento)) {
        if (parseFloat(plazoValor) !== 0)
          return `El valor de plazo_valor debe ser 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      } else if (includes(instrumentosDiferentesMap, tipo_instrumento)) {
        if (parseFloat(plazoValor) < 0)
          return `El valor de plazo_valor debe mayor o igual a 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      }
    } catch (err) {
      throw err;
    }
  },
  plazoEconomicoConTipoInstrumento: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const plazoEconomico = value;
      const { tipo_instrumento } = row;
      const {
        plazoEconomicoConTipoInstrumentoDataBD,
        plazoEconomicoConTipoInstrumentoDiferenteDataBD,
      } = paramsBD;
      const instrumentosMap = map(
        plazoEconomicoConTipoInstrumentoDataBD,
        "sigla"
      );
      const instrumentosDiferentesMap = map(
        plazoEconomicoConTipoInstrumentoDiferenteDataBD,
        "sigla"
      );
      if (includes(instrumentosMap, tipo_instrumento)) {
        if (parseFloat(plazoEconomico) !== 0)
          return `El valor de plazo_economico debe ser 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      } else if (includes(instrumentosDiferentesMap, tipo_instrumento)) {
        if (parseFloat(plazoEconomico) < 0)
          return `El valor de plazo_economico debe mayor o igual a 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      }
    } catch (err) {
      throw err;
    }
  },
  tasaUltimoHechoConTipoInstrumento: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const tasaUltimoHecho = value;
      const { tipo_instrumento } = row;
      const {
        tasaUltimoHechoConTipoInstrumentoDataBD,
        tasaUltimoHechoConTipoInstrumentoDiferenteDataBD,
      } = paramsBD;
      const instrumentosMap = map(
        tasaUltimoHechoConTipoInstrumentoDataBD,
        "sigla"
      );
      const instrumentosDiferentesMap = map(
        tasaUltimoHechoConTipoInstrumentoDiferenteDataBD,
        "sigla"
      );
      if (includes(instrumentosMap, tipo_instrumento)) {
        if (parseFloat(tasaUltimoHecho) > 0)
          return `El valor de tasa_ultimo_hecho debe ser 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      } else if (includes(instrumentosDiferentesMap, tipo_instrumento)) {
        if (parseFloat(tasaUltimoHecho) < 0)
          return `El valor de tasa_ultimo_hecho debe mayor o igual a 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      }
    } catch (err) {
      throw err;
    }
  },
  tasaRendimientoConInstrumento: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const tasaRendmiento = value;
      const { tipo_instrumento } = row;
      const {
        tasaRendimientoConTipoInstrumento139DataBD,
        tasaRendimientoConTipoInstrumento138DataBD,
      } = paramsBD;
      const instrumentos139Map = map(
        tasaRendimientoConTipoInstrumento139DataBD,
        "sigla"
      );
      const instrumentos138Map = map(
        tasaRendimientoConTipoInstrumento138DataBD,
        "sigla"
      );
      if (includes(instrumentos139Map, tipo_instrumento)) {
        if (parseFloat(tasaRendmiento) > 0)
          return `El valor de tasa_rendimiento debe ser 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      } else if (includes(instrumentos138Map, tipo_instrumento)) {
        if (parseFloat(tasaRendmiento) < 0)
          return `El valor de tasa_rendimiento debe mayor o igual a 0, debido a que el tipo_instrumento es ${tipo_instrumento}`;
      }
    } catch (err) {
      throw err;
    }
  },
  entidadEmisora: (params) => {
    return defaultValidationContentValues(
      params,
      "El contenido del archivo no coincide con alguna entidad emisora"
    );
  },
  totalVidaUtil: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const totalVidaUtilValue = value;
      const { tipo_bien_inmueble } = row;
      const { totalVidaUtilDataBD, totalVidaUtilDiferenteDataBD } = paramsBD;
      const totalVidaUtilMap = map(totalVidaUtilDataBD, "sigla");
      const totalVidaUtilDiferenteMap = map(
        totalVidaUtilDiferenteDataBD,
        "sigla"
      );
      if (includes(totalVidaUtilMap, tipo_bien_inmueble)) {
        if (
          parseFloat(totalVidaUtilValue) >= 0 &&
          parseFloat(totalVidaUtilValue) <= 480
        )
          return `El valor de total_vida_util debe estar entre 0 y 480, debido a que el tipo_bien_inmueble es ${tipo_bien_inmueble}`;
      } else if (includes(totalVidaUtilDiferenteMap, tipo_bien_inmueble)) {
        if (parseFloat(totalVidaUtilValue) < 0)
          return `El valor de total_vida_util debe mayor o igual a 0, debido a que el tipo_bien_inmueble es ${tipo_bien_inmueble}`;
      }
    } catch (err) {
      throw err;
    }
  },
  vidaUtilRestante: (params) => {
    try {
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const vidaUtilRestanteValue = value;
      const { tipo_bien_inmueble } = row;
      const {
        vidaUtilRestanteValueDataBD,
        vidaUtilRestanteValueDiferenteDataBD,
      } = paramsBD;
      const totalVidaUtilMap = map(vidaUtilRestanteValueDataBD, "sigla");
      const totalVidaUtilDiferenteMap = map(
        vidaUtilRestanteValueDiferenteDataBD,
        "sigla"
      );
      if (includes(totalVidaUtilMap, tipo_bien_inmueble)) {
        if (
          parseFloat(vidaUtilRestanteValue) >= 0 &&
          parseFloat(vidaUtilRestanteValue) <= 480
        )
          return `El valor de vida_util_restante debe estar entre 0 y 480, debido a que el tipo_bien_inmueble es ${tipo_bien_inmueble}`;
      } else if (includes(totalVidaUtilDiferenteMap, tipo_bien_inmueble)) {
        if (parseFloat(vidaUtilRestanteValue) < 0)
          return `El valor de vida_util_restante debe mayor o igual a 0, debido a que el tipo_bien_inmueble es ${tipo_bien_inmueble}`;
      }
    } catch (err) {
      throw err;
    }
  },
  tipoBienInmueble: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados"
    );
  },
  moneda: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados por el RMV"
    );
  },
  tipoAmortizacion: (params) => {
    // console.log(params?.paramsBD, params.row, params.functionName);
    return defaultValidationContentValues(
      params,
      "El contenido del archivo no coincide con algún tipo de amortizacion"
    );
  },
  tipoInteres: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ningún Tipo de Interés definido"
    );
  },
  tipoTasa: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ningún Tipo de Tasa definido"
    );
  },
  tasaEmision: (params) => {
    const { value, row } = params;
    const { tipo_interes } = row;
    const tasaEmision = value;
    try {
      if (tipo_interes !== "R" && tipo_interes !== "D")
        return "El Tipo de Interes debe ser 'R' o 'D'";
      if (tipo_interes === "R" && Number(tasaEmision) <= 0)
        return "La Tasa Emisión debe ser mayor a '0', debido a que Tipo Interes es 'R'";
      if (tipo_interes === "D" && Number(tasaEmision) > 0)
        return "La Tasa Emision debe ser '0', debido a que Tipo Interes es 'D'";
      return true;
    } catch (err) {
      throw err;
    }
  },
  nroPago: (params) => {
    try {
      const { value, row, pattern, fileCode } = params;
      const { plazo_cupon, plazo_emision } = row;
      const plazoCupon = parseFloat(plazo_cupon);
      const plazoEmision = parseFloat(plazo_emision);
      const nroPago = parseFloat(value);
      if (!isNumber(plazoCupon) || !isNumber(plazoEmision)) {
        return `El campo plazo_cupon o plazo_emision no son números válidos`;
      }
      if (parseFloat(plazo_cupon) > 0) {
        // if (fileCode === "441" || fileCode === "442") {
        if (parseFloat(plazoCupon) > 0) return true;
        else
          return "El campo plazo_cupon es mayor a 0 por lo tanto el valor de nro_pago debe ser mayor a 0";
        // } else {
        //   const resultOperation = math.evaluate(
        //     `${plazo_emision}/${plazo_cupon}`
        //   );
        //   const resultFixed = fixedByPattern(resultOperation, pattern);
        //   if (!math.deepEqual(resultFixed, value)) {
        //     return `El campo plazo_cupon es mayor a 0 por lo tanto el valor de nro_pago debe ser mayor a 0`;
        //     // return `El campo plazo_cupon es mayor a 0 por lo tanto el valor de nro_pago debe ser igual a (plazo_emision (${plazoEmision})/plazo_cupon (${plazoCupon})) = ${resultFixed})`;
        //   }
        // }
      } else if (parseFloat(plazo_cupon) === 0) {
        if (nroPago !== 0)
          return "El campo plazo_cupon es igual a 0 por lo tanto el valor de nro_pago debe ser igual a 0";
      }
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  plazoCupon: (params) => {
    const { value, row } = params;
    const { nro_pago } = row;
    const plazoCupon = parseFloat(value);
    const nroPago = parseFloat(nro_pago);
    if (!isNumber(plazoCupon) || !isNumber(nroPago))
      return `El campo plazo_cupon (${plazoCupon}) o nro_pago (${nroPago}) no son números válidos`;

    if (nroPago > 0) {
      if (plazoCupon <= 0)
        return `El campo nro_pago es mayor a 0 por lo tanto plazo_cupon debe ser mayor a 0`;
    } else if (nroPago === 0) {
      if (plazoCupon !== 0)
        return `El campo nro_pago es igual a 1 por lo tanto plazo_cupon debe ser igual a 0`;
    }
    return true;
  },
  prepago: (params) => {
    return defaultValidationContentValues(params);
  },
  subordinado: (params) => {
    return defaultValidationContentValues(params);
  },
  calificacion: (params) => {
    return defaultValidationContentValues(
      params,
      "La calificación no se encuentra en ninguna calificación válida"
    );
  },
  calificadora: (params) => {
    return defaultValidationContentValues(
      params,
      "La calificadora no se encuentra en ninguna calificadora válida"
    );
  },
  custodio: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguna sigla de Custodio definida"
    );
  },
  pais: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados por el RMV"
    );
  },
  emisor: (params) => {
    return defaultValidationContentValues(
      params,
      "Solicitar el Registro de Emisor a la APS (Autorización RMV)"
    );
  },
  tipoAccion: (params) => {
    return defaultValidationContentValues(
      params,
      "El contenido del archivo no coincide con alguna sigla de Tipo de Acción"
    );
  },
  calificacionConTipoInstrumento: (params) => {
    try {
      if (isUndefined(params?.paramsBD))
        throw "Consultas de campo no definidas";
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const {
        calificacionDataDB,
        calificacionVacioDataDB,
        calificacionConTipoInstrumento,
      } = paramsBD;
      const { tiposInstrumentos } = extraFunctionsParameters;
      const calificacion = value;
      const tipoInstrumento = row.tipo_instrumento;
      const calificacionesMap = map(calificacionDataDB, "descripcion");
      const calificacionesVacioMap = map(
        calificacionVacioDataDB,
        "descripcion"
      );
      const calificacionConTipoInstrumentoMap = map(
        calificacionConTipoInstrumento,
        "sigla"
      );
      if (size(calificacionConTipoInstrumentoMap) > 0) {
        if (includes(calificacionConTipoInstrumentoMap, tipoInstrumento)) {
          if (
            isEmpty(calificacion) &&
            includes(mayBeEmptyFields, "calificacion")
          )
            return true;
          if (!includes(calificacionesVacioMap, calificacion))
            return `La calificación no se encuentra en ninguna calificación válida (tipo instrumento ${tipoInstrumento})`;
        } else {
          if (!includes(calificacionDataDB, calificacion))
            return `La calificación no se encuentra en ninguna calificación válida`;
        }
      } else {
        if (!includes(tiposInstrumentos, tipoInstrumento))
          return `El Tipo de Instrumento esperado es ${tiposInstrumentos?.join(
            " o "
          )}`;
        if (
          tipoInstrumento === "CFC" &&
          !includes(calificacionesMap, calificacion)
        )
          return `La calificación no se encuentra en ninguna calificación válida (tipo instrumento ${tipoInstrumento})`;
        if (tipoInstrumento === "ACC") {
          if (
            isEmpty(calificacion) &&
            includes(mayBeEmptyFields, "calificacion")
          )
            return true;
          if (!includes(calificacionesVacioMap, calificacion))
            return `La calificación no se encuentra en ninguna calificación válida (tipo instrumento ${tipoInstrumento})`;
        }
      }

      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  calificadoraConCalificacion: (params) => {
    try {
      if (isUndefined(params?.paramsBD))
        throw "Consultas de campo no definidas";
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const { calificadoraDataDB } = paramsBD;
      const calificadora = value;
      const calificacion = row.calificacion;
      const calificadoraMap = map(calificadoraDataDB, "sigla");
      if (isEmpty(calificacion)) {
        if (isEmpty(calificadora) && includes(mayBeEmptyFields, "calificadora"))
          return true;
        else
          return `La calificadora no debe tener contenido debido a que la calificación no tiene contenido`;
      } else {
        if (!includes(calificadoraMap, calificadora))
          return `La calificadora no se encuentra en ninguna calificadora válida`;
      }
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  calificadoraConTipoInstrumento: (params) => {
    try {
      if (isUndefined(params?.paramsBD))
        throw "Consultas de campo no definidas";
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const { calificadoraDataDB, calificadoraConTipoInstrumentoDataDB } =
        paramsBD;
      const calificadora = value;
      const tipoInstrumento = row.tipo_instrumento;
      const calificadoraMap = map(calificadoraDataDB, "sigla");
      const calificadoraConTipoInstrumentoMap = map(
        calificadoraConTipoInstrumentoDataDB,
        "sigla"
      );
      if (includes(calificadoraConTipoInstrumentoMap, tipoInstrumento)) {
        if (isEmpty(calificadora) && includes(mayBeEmptyFields, "calificacion"))
          return true;
      } else {
        if (!includes(calificadoraMap, calificadora))
          return `La calificación no se encuentra en ninguna calificación válida`;
      }

      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  tipoValoracionConsultaMultiple: (params) => {
    try {
      if (isUndefined(params?.paramsBD))
        throw "Consultas de campo no definidas";
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const {
        instrumento135DataDB,
        instrumento1DataDB,
        instrumento25DataDB,
        tipoValoracion22DataDB,
        tipoValoracion31DataDB,
        tipoValoracion210DataDB,
      } = paramsBD;
      const tipoValoracion = value;
      const tipoInstrumento = row.tipo_instrumento;
      const instrumento135Map = map(instrumento135DataDB, "sigla");
      const instrumento1Map = map(instrumento1DataDB, "sigla");
      const instrumento25Map = map(instrumento25DataDB, "sigla");
      const tipoValoracion22Map = map(tipoValoracion22DataDB, "sigla");
      const tipoValoracion31Map = map(tipoValoracion31DataDB, "sigla");
      const tipoValoracion210Map = map(tipoValoracion210DataDB, "sigla");
      if (includes(instrumento135Map, tipoInstrumento)) {
        if (!includes(tipoValoracion22Map, tipoValoracion))
          return "El tipo_valoracion no coincide con ninguna sigla válida";
      } else if (includes(instrumento1Map, tipoInstrumento)) {
        if (!includes(tipoValoracion31Map, tipoValoracion))
          return "El tipo_valoracion no coincide con ninguna sigla válida";
      } else if (includes(instrumento25Map, tipoInstrumento)) {
        if (!includes(tipoValoracion210Map, tipoValoracion))
          return "El tipo_valoracion no coincide con ninguna sigla válida";
      } else
        return "El tipo_instrumento no se encuentra en ninguna sigla válida para poder validar el tipo_valoracion";

      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  tasaUltimoHechoConTipoInstrumento: (params) => {
    return true;
  },
  custodioConTipoInstrumento: (params) => {
    try {
      if (isUndefined(params?.paramsBD))
        throw "Consultas de campo no definidas";
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const { custodioDataDB } = paramsBD;
      const { tiposInstrumentos } = extraFunctionsParameters;
      const custodio = value;
      const tipoInstrumento = row.tipo_instrumento;
      const custodioMap = map(custodioDataDB, "sigla");
      if (includes(tiposInstrumentos, tipoInstrumento)) {
        if (isEmpty(custodio) && includes(mayBeEmptyFields, "custodio"))
          return true;
        else {
          if (!includes(custodioMap, custodio))
            return `El custodio no es válido debido a que el tipo de instrumento es ${tiposInstrumentos?.join()}`;
        }
      } else {
        if (!includes(custodioMap, custodio))
          return `El campo no corresponde a ninguna sigla de Custodio definida (instrumento: '${tipoInstrumento}')`;
      }
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  serieEmision: (params) => {
    const { value, row } = params;
    const { tipo_instrumento } = row;
    const serieEmisionValues1 = ["U", "A"];
    const serieEmisionValues2 = ["1", "A", "B"];
    if (tipo_instrumento === "ACC" && !includes(serieEmisionValues1, value))
      return "La Serie de Emision debe ser 'U' o 'A', debido a que Tipo Instrumento es 'ACC'";
    if (tipo_instrumento === "CFC" && !includes(serieEmisionValues2, value))
      return "La Serie de Emision debe ser '1', 'A' o 'B', debido a que Tipo Instrumento es 'CFC'";
    return true;
  },
  operacionValida: (params) => {
    try {
      if (isUndefined(params?.paramsBD))
        throw "Consultas de campo no definidas";
      const {
        paramsBD,
        value,
        messages,
        extraFunctionsParameters,
        row,
        mayBeEmptyFields,
      } = params;
      const { operacionValidaDataDB } = paramsBD;
      const { lugar_negociacion, tipo_operacion, tipo_instrumento } = row;
      const validation = `${lugar_negociacion}${tipo_operacion}${tipo_instrumento}`;
      if (!includes(operacionValidaDataDB, validation))
        return `lugar_negociacion+tipo_operacion+tipo_instrumento (${validation}) no se encuentra en una operación válida`;
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  plazoEmisionTiposDeDatos: (params) => {
    try {
      const { value, pattern, row } = params;
      const pattern1 = pattern[0];
      const pattern2 = pattern[1];
      const { serie } = row;
      const lastValue = serie?.[size(serie) - 1];
      if (lastValue === "Q") return pattern2.test(value);
      else return pattern1.test(value);
    } catch (err) {
      throw err;
    }
  },
  mayorACero: (params) => {
    try {
      const { value } = params;
      const newValue = parseFloat(value);
      if (!isNumber(newValue)) return "No es un número válido";
      if (value <= 0) return "El valor debe ser mayor a 0";
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  mayorIgualACero: (params) => {
    try {
      const { value } = params;
      const newValue = parseFloat(value);
      if (!isNumber(newValue)) return "No es un número válido";
      if (value < 0) return "El valor debe ser mayor o igual a 0";
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  operacionMatematica: (params) => {
    const {
      value,
      mathOperation,
      fileContent,
      row,
      rowIndex,
      pattern,
      fileCode,
      columnIndex,
    } = params;
    const OPERATION_OPTIONS = {
      operationWithValues: [],
      messageFields: [],
    };
    const { nro_cupon } = row;
    if (
      includes(["444", "445", "UD", "CO"], fileCode) &&
      parseFloat(nro_cupon) === 1 &&
      includes(["saldo_capital", "interes"], columnIndex)
    )
      return true;
    if (
      includes(["444"], fileCode) &&
      parseFloat(nro_cupon) === 1 &&
      includes(["plazo_cupon"], columnIndex)
    )
      return true;
    try {
      OPERATION_OPTIONS.operationWithValues = map(
        mathOperation,
        (operation, indexOperation) => {
          let valueAux = operation;
          if (isObject(operation)) {
            const { column, number, isDate, operRow } = operation;
            if (!isUndefined(column)) {
              const columnValue = row[column];
              if (isDate) {
                const dateAux = !isUndefined(operRow)
                  ? fileContent?.[rowIndex + operRow]?.[column]
                  : columnValue;
                valueAux = {
                  date: new Date(
                    DateTime.fromISO(dateAux).toFormat("yyyy-MM-dd")
                  ).getTime(),
                };
                if (operation?.operateResultBy)
                  valueAux.operateResultBy = operation.operateResultBy;
                OPERATION_OPTIONS.messageFields.push(
                  `${column} (${isUndefined(dateAux) ? 0 : dateAux})`
                );
              } else if (!isUndefined(operRow)) {
                valueAux = trim(fileContent?.[rowIndex + operRow]?.[column]);
                if (isEmpty(valueAux)) {
                  if (
                    mathOperation[indexOperation + 1] === "*" ||
                    mathOperation[indexOperation + 1] === "/"
                  ) {
                    valueAux = 1;
                  } else {
                    valueAux = 0;
                  }
                }
                OPERATION_OPTIONS.messageFields.push(
                  `${column}(${valueAux})(fila ${rowIndex + operRow})`
                );
              } else {
                valueAux = columnValue || 0;
                OPERATION_OPTIONS.messageFields.push(`${column}(${valueAux})`);
              }
            } else {
              valueAux = number;
              OPERATION_OPTIONS.messageFields.push(`${number}(${valueAux})`);
            }
          } else {
            OPERATION_OPTIONS.messageFields.push(operation);
          }
          return valueAux;
        }
      );
      const datesResult = operateDates(OPERATION_OPTIONS.operationWithValues);
      const { resultFinal, posInit, posEnd } = datesResult;
      if (!isNull(resultFinal)) {
        if (size(OPERATION_OPTIONS.operationWithValues) === posEnd + 1)
          OPERATION_OPTIONS.operationWithValues = [resultFinal];
        else
          OPERATION_OPTIONS.operationWithValues.splice(
            posInit,
            posEnd,
            resultFinal
          );
      }

      const resultOperation = math.evaluate(
        OPERATION_OPTIONS.operationWithValues.join("")
      );
      const newResult = fixedByPattern(resultOperation, pattern, columnIndex);
      if (!math.deepEqual(newResult, value))
        return `El resultado de la operación (${OPERATION_OPTIONS.messageFields.join(
          " "
        )}=${newResult}) no es igual a ${value}`;
      return true;
    } catch (err) {
      const messages = OPERATION_OPTIONS.messageFields.join("");
      const operation = OPERATION_OPTIONS.operationWithValues.join("");
      return `Error en ${messages} - ${operation}. ${err}`;
    }
  },
  combinacionUnicaPorArchivo: (params) => {
    const {
      uniqueCombinationPerFile,
      fileContent,
      fileCode,
      nuevaCarga,
      fileName,
    } = params;
    // Inicializar un objeto para agrupar combinaciones únicas
    const groupedCombinations = {};

    // Recorrer el contenido del archivo
    forEach(fileContent, (row, rowIndex) => {
      forEach(row, (value, columnIndex) => {
        // Recorrer las combinaciones únicas del archivo
        forEach(uniqueCombinationPerFile, (combinations, combinationIndex) => {
          // Verificar si la columna actual está en la combinación
          if (includes(combinations, columnIndex)) {
            // Crear una clave única para la combinación y fila
            const key = `${rowIndex}+${combinationIndex}`;

            // Agregar el valor a la combinación agrupada
            groupedCombinations[key] = {
              ...groupedCombinations[key],
              [columnIndex]: { value, rowIndex },
            };
          }
        });
      });
    });

    // Inicializar un objeto para almacenar grupos agrupados
    const groupedObject = {};

    // Recorrer las combinaciones agrupadas
    for (const key in groupedCombinations) {
      const properties = Object.keys(groupedCombinations[key]);
      const propertyKey = properties.join("+");
      groupedObject[propertyKey] = groupedObject[propertyKey] || {};
      groupedObject[propertyKey][key] = groupedCombinations[key];
    }

    // Inicializar un objeto para almacenar objetos únicos y duplicados
    const uniqueObjects = {};
    const duplicates = {};

    // Recorrer los grupos agrupados
    forEach(groupedObject, (group, key) => {
      forEach(group, (valuesGroup) => {
        // Inicializar un objeto para almacenar objetos únicos
        uniqueObjects[key] = uniqueObjects[key] || {};

        // Crear una clave única basada en los índices de fila
        const rowIndexes = [...new Set(map(valuesGroup, "rowIndex"))];
        uniqueObjects[key][rowIndexes.join("+")] = map(
          valuesGroup,
          "value"
        ).join("");
      });

      // Inicializar un objeto para almacenar índices duplicados
      const duplicateIndices = {};

      // Recorrer objetos únicos y buscar duplicados
      forEach(uniqueObjects[key], (value, index) => {
        if (!duplicateIndices[value]) {
          duplicateIndices[value] = [index];
        } else {
          duplicateIndices[value].push(index);
        }
      });

      // Filtrar duplicados y almacenarlos
      duplicates[key] = pickBy(
        duplicateIndices,
        (indices) => indices.length > 1
      );
    });

    if (size(duplicates) > 0) {
      //TODO: fileCode === "481" ||fileCode === "482" ||fileCode === "DC"? "Un valor seriado con idénticas características, no puede estar desagrupado en varios registros"
      const errors = [];
      forEach(duplicates, (values, key) => {
        forEach(values, (rows, value) => {
          forEach(rows, (row) => {
            errors.push({
              id_carga_archivos: nuevaCarga.id_carga_archivos,
              archivo: fileName,
              tipo_error: "VALOR INCORRECTO",
              descripcion: `La combinación de los campos '${key}' debe ser único`,
              valor: value,
              fila: row,
              columna: key,
            });
          });
        });
      });
      return errors;
    }
    return true;
  },
  unicoPor: (params) => {
    try {
      const { fieldsUniqueBy, fileContent, nuevaCarga, fileName } = params;
      const data = map(fileContent, (row, index) => ({
        ...row,
        index,
      }));
      const errors = [];
      forEach(fieldsUniqueBy, (validatesBy, field) => {
        const iteratee = (item) =>
          map(validatesBy, (prop) => item[prop]).join("_");
        const groups = groupBy(data, iteratee);
        const repeatedGroups = filter(groups, (group) => size(group) > 1);
        forEach(repeatedGroups, (repeatedGroup) => {
          const groupsByField = groupBy(repeatedGroup, field);
          const repeatedsByField = filter(
            groupsByField,
            (group) => size(group) > 1
          );
          if (size(repeatedsByField) > 0) {
            forEach(repeatedsByField, (repeateds) => {
              forEach(repeateds, (repeatedRow) => {
                const message = !isEmpty(validatesBy?.[0])
                  ? `El campo debe ser único por '${validatesBy.join(", ")}'`
                  : `El campo debe ser único'`;

                errors.push({
                  id_carga_archivos: nuevaCarga.id_carga_archivos,
                  archivo: fileName,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: message,
                  valor: repeatedRow[field],
                  fila: repeatedRow.index,
                  columna: field,
                });
              });
            });
          }
        });
      });
      return size(errors) > 0 ? errors : true;
    } catch (err) {
      throw err;
    }
  },
  fechaOperacionIgual: (params) => {
    try {
      const { value, fecha_operacion } = params;
      const newValue = DateTime.fromISO(value);
      const newFechaOperacion = DateTime.fromISO(fecha_operacion);
      if (!newValue.equals(newFechaOperacion))
        return "La fecha debe ser igual a la fecha de operación del nombre de archivo";
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  fechaOperacionMenor: (params) => {
    try {
      const { value, fecha_operacion } = params;
      const newValue = DateTime.fromISO(value);
      const newFechaOperacion = DateTime.fromISO(fecha_operacion);
      if (newValue > newFechaOperacion)
        return "La fecha debe ser menor a la fecha de operación del nombre de archivo";
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  validacionesEntreArchivos: (params) => {
    const {
      value,
      row,
      rowIndex,
      columnIndex,
      columnCounter,
      matchDataType,
      nuevaCarga,
      informacionEntreArchivos,
      fileName,
      fileCode,
      fileContent,
    } = params;

    const errors = [];
    try {
      const {
        tipo_tasa,
        tasa_emision,
        tipo_instrumento,
        serie,
        tipo_operacion,
      } = row;
      if (
        fileCode === "441" ||
        fileCode === "442" ||
        fileCode === "TD" ||
        fileCode === "TO"
      ) {
        if (columnIndex === "nro_pago" && matchDataType === true) {
          if (parseFloat(value) > 1) {
            const TASA_OPTIONS = {};
            if (fileCode === "441" || fileCode === "TD") {
              TASA_OPTIONS.tipo_tasa = tipo_tasa === "F" ? tipo_tasa : null;
              TASA_OPTIONS.tasa_emision =
                tipo_tasa === "F" ? tasa_emision : null;
            } else if (fileCode === "442" || fileCode === "TO") {
              TASA_OPTIONS.tasa_emision = tasa_emision;
            }
            const instrumentoSerie = `${tipo_instrumento}${serie}`;
            informacionEntreArchivos.push({
              fileNameFrom: fileName,
              fileCodeFrom: fileCode,
              value: {
                instrumentoSerie,
                [columnIndex]: value,
                TASA_OPTIONS,
              },
              rowInfoIndex: rowIndex,
              columnInfo: columnIndex,
            });
          }
        }
      }
      if (
        fileCode === "411" ||
        fileCode === "412" ||
        fileCode === "DM" ||
        fileCode === "DR"
      ) {
        if (columnIndex === "serie") {
          if (tipo_operacion === "COP") {
            const instrumentoSerie = `${tipo_instrumento}${serie}`;
            informacionEntreArchivos.push({
              fileNameFrom: fileName,
              fileCodeFrom: fileCode,
              value: { instrumentoSerie },
              rowInfoIndex: rowIndex,
              columnInfo: columnIndex,
            });
          }
        }
      }

      if (
        fileCode === "441" ||
        fileCode === "443" ||
        fileCode === "CR" ||
        fileCode === "CV"
      ) {
        const instrumentoSerie = `${tipo_instrumento}${serie}`;
        forEach(informacionEntreArchivos, (info) => {
          const { fileCodeFrom, value, rowInfoIndex, columnInfo } = info;
          if (
            instrumentoSerie !== value?.instrumentoSerie &&
            ((fileCodeFrom === "411" && fileCode === "441") ||
              (fileCodeFrom === "413" && fileCode === "443") ||
              (fileCodeFrom === "DM" && fileCode === "CR") ||
              (fileCodeFrom === "DR" && fileCode === "CV"))
          ) {
            errors.push({
              id_carga_archivos: nuevaCarga.id_carga_archivos,
              archivo: `${fileName}`,
              tipo_error: `VALOR INCORRECTO DE ${fileCodeFrom} A ${fileCode}`,
              descripcion: `El tipo_instrumento+serie del archivo '${fileCodeFrom} (fila ${rowInfoIndex})' no debe ser igual a el tipo_instrumento+serie del archivo '${fileCode} (fila ${rowIndex})', debido a que el tipo_operacion en el archivo ${fileCodeFrom} es igual a "COP".`,
              valor: `${fileCode}: ${value.instrumentoSerie} - ${fileCodeFrom}: ${instrumentoSerie}`,
              columna: columnInfo,
              fila: rowIndex,
            });
          }
        });
      }

      if (
        (fileCode === "444" ||
          fileCode === "445" ||
          fileCode === "UD" ||
          fileCode === "CO") &&
        rowIndex === size(fileContent) - 1 &&
        columnCounter === size(row) - 1
      ) {
        forEach(informacionEntreArchivos, (info) => {
          const { fileCodeFrom, value, rowInfoIndex, columnInfo } = info;
          if (
            (fileCodeFrom === "441" && fileCode === "444") ||
            (fileCodeFrom === "442" && fileCode === "445") ||
            (fileCodeFrom === "TD" && fileCode === "UD") ||
            (fileCodeFrom === "TO" && fileCode === "CO")
          ) {
            if (columnInfo === "nro_pago") {
              const { nro_pago, TASA_OPTIONS, instrumentoSerie } = value;
              const { tipo_tasa, tasa_emision } = TASA_OPTIONS;
              const nroPagoInfo = nro_pago;
              const instrumentoSerieInfo = instrumentoSerie;
              const tipoTasaInfo = tipo_tasa;
              const tasaEmisionInfo = tasa_emision;
              let counterInstrumentoSerie = 0;

              forEach(fileContent, (contentRow, contentRowIndex) => {
                const instrumentoSerie = `${
                  fileCode === "444"
                    ? contentRow.tipo_instrumento
                    : contentRow.tipo_activo
                }${contentRow.serie}`;
                if (instrumentoSerieInfo === instrumentoSerie) {
                  if (tasaEmisionInfo !== null) {
                    if (
                      Number(tasaEmisionInfo) !==
                      Number(contentRow.tasa_interes)
                    ) {
                      errors.push({
                        id_carga_archivos: nuevaCarga.id_carga_archivos,
                        archivo: fileName,
                        tipo_error: `VALOR INCORRECTO DE ${fileCodeFrom} A ${fileCode}`,
                        descripcion: `La tasa_interes del archivo '${fileCode} (fila: ${contentRowIndex})' debe ser igual a la tasa_emision del archivo '${fileCodeFrom} (fila ${rowInfoIndex})' por tipoinstrumento+serie (${instrumentoSerie})`,
                        valor: `tipoinstrumento+serie: ${instrumentoSerie}, tasa_interes (${fileCode}): ${contentRow.tasa_interes} - tasa_emision (${fileCodeFrom}): ${tasaEmisionInfo}`,
                        columna: "tasa_interes",
                        fila: contentRowIndex,
                      });
                    }
                  }
                  counterInstrumentoSerie++;
                }
              });

              if (parseInt(counterInstrumentoSerie) !== parseInt(nroPagoInfo)) {
                errors.push({
                  id_carga_archivos: nuevaCarga.id_carga_archivos,
                  archivo: fileName,
                  tipo_error: `VALOR INCORRECTO DE ${fileCodeFrom} A ${fileCode}`,
                  descripcion: `El Archivo ${fileCodeFrom} tiene el valor de '${nroPagoInfo}' en '${columnInfo}', por lo que el archivo ${fileCode} debe tener '${nroPagoInfo}' y no '${counterInstrumentoSerie}' registros con el mismo instrumento+serie`,
                  valor: `instrumento+serie (${fileCodeFrom}): ${instrumentoSerieInfo} - nro_pago (${fileCodeFrom}): ${nroPagoInfo}, cantidad de registros por instrumento+serie (${fileCode}): ${counterInstrumentoSerie}`,
                  columna: `${fileCodeFrom}: ${columnInfo}`,
                  fila: rowInfoIndex,
                });
              }
            }
          }
        });
      }
    } catch (err) {
      errors.push({
        id_carga_archivos: nuevaCarga.id_carga_archivos,
        archivo: "",
        tipo_error: "ERROR DE SERVIDOR",
        descripcion: `Error de servidor al formatear los archivos. ${
          err?.message ? err.message : err
        }`,
      });
    }

    return size(errors) > 0 ? errors : true;
  },
};

module.exports = {
  funcionesValidacionesContenidoValores,
};
