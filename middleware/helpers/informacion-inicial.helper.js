const { sortBy, isUndefined, size } = require("lodash");
const {
  EjecutarQuery,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
  formatearQuery,
} = require("../../utils/consulta.utils");

async function obtenerInformacionInicial(data, user) {
  const { id_usuario, id_rol } = user;
  const { tipo_periodo, fecha_operacion, tipo_carga } = data;
  const codigosSegurosPensiones = await obtenerCodigosSegurosPensiones(user);
  let periodicidadBolsa = []; //VALOR POR DEFECTO
  if (tipo_carga === "BOLSA") {
    const valuesFeriado = [fecha_operacion, fecha_operacion];
    const queryFeriado = formatearQuery(
      `SELECT CASE WHEN EXTRACT (DOW FROM TIMESTAMP %L) IN (6,0) OR (SELECT COUNT(*) FROM public."APS_param_feriado" WHERE fecha = %L) > 0 THEN 0 ELSE 1 END;`,
      valuesFeriado
    );
    const workingDay = await EjecutarQuery(queryFeriado);
    if (parseInt(workingDay?.[0].case) === 0)
      periodicidadBolsa.push(154); // DIARIOS
    else periodicidadBolsa.push(219); // DIAS HABILES
  }
  const where = [
    { key: "id_rol", value: id_rol },
    { key: "activo", value: true },
  ];
  where.push({
    key: "id_periodicidad",
    valuesWhereIn:
      size(periodicidadBolsa) > 0 ? periodicidadBolsa : [tipo_periodo],
    whereIn: true,
  });
  const confArchivos = await EjecutarQuery(
    EscogerInternoUtil("APS_param_archivos_pensiones_seguros", {
      select: [
        "id_rol",
        "codigo",
        "nombre",
        "id_periodicidad",
        "archivo_vacio",
      ],
      where,
      orderby: { field: "codigo" },
    })
  );
  let functionNameFormatFiles = { table: null, body: null };
  if (tipo_carga === "SEGUROS" || tipo_carga === "PENSIONES") {
    functionNameFormatFiles.table = "aps_fun_archivos_pensiones_seguros";
    functionNameFormatFiles.body = {
      fecha_operacion,
      id_rol,
      id_usuario,
      tipo_periodo,
    };
  } else if (tipo_carga === "CUSTODIO_SEGUROS") {
    functionNameFormatFiles.table = "aps_fun_archivos_custodio_seguros";
    functionNameFormatFiles.body = { fecha_operacion };
  } else if (tipo_carga === "CUSTODIO_PENSIONES") {
    functionNameFormatFiles.table = "aps_fun_archivos_custodio_pensiones";
    functionNameFormatFiles.body = { fecha_operacion };
  } else if (tipo_carga === "BOLSA") {
    functionNameFormatFiles.table = "aps_fun_archivos_bolsa";
    functionNameFormatFiles.body = {
      fecha_operacion,
      id_rol,
      id_usuario,
      periodicidadBolsa: periodicidadBolsa.join(","),
    };
  }

  const formatoArchivosRequeridos = await EjecutarQuery(
    EjecutarFuncionSQL(functionNameFormatFiles.table, {
      body: functionNameFormatFiles.body,
    })
  );

  return {
    ...codigosSegurosPensiones,
    confArchivos,
    formatoArchivosRequeridos: sortBy(formatoArchivosRequeridos, "archivo"),
  };
}

const obtenerCodigosSegurosPensiones = async (user) => {
  const { id_usuario, id_rol } = user;
  const paramsQuery = {
    select: ["codigo, sigla, id_rol, id_usuario"],
    where: [
      { key: "id_usuario", value: id_usuario },
      { key: "id_rol", value: id_rol },
    ],
  };
  const codigosSeguros = await EjecutarQuery(
    EscogerInternoUtil("aps_view_modalidad_seguros", paramsQuery)
  );
  const codigosPensiones = await EjecutarQuery(
    EscogerInternoUtil("aps_view_modalidad_pensiones", paramsQuery)
  );
  return { codigosSeguros, codigosPensiones };
};

module.exports = {
  obtenerInformacionInicial,
};
