const {
  EjecutarQuery,
  ObtenerColumnasDeTablaUtil,
} = require("../../utils/consulta.utils");

async function obtenerInformacionDeArchivo(fileCode) {}

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

function insertarCabecerasArchivos(infoColumnasArchivos, readedFiles) {
  try {
    console.log({ infoColumnasArchivos, readedFiles });
  } catch (err) {
    throw err;
  }
}

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
  obtenerInformacionDeArchivo,
  obtenerInformacionColumnasArchivosBD,
  insertarCabecerasArchivos,
};
