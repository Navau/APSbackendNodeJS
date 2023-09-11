const {
  EjecutarQuery,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
} = require("../../utils/consulta.utils");

async function obtenerInformacionInicial(data, user) {
  const { id_usuario, id_rol } = user;
  const { tipo_periodo, fecha_operacion, tipo_carga } = data;
  const codigosSegurosPensiones = await obtenerCodigosSegurosPensiones(user);
  const confArchivos = await EjecutarQuery(
    EscogerInternoUtil("APS_param_archivos_pensiones_seguros", {
      select: [
        "id_rol",
        "codigo",
        "nombre",
        "id_periodicidad",
        "archivo_vacio",
      ],
      where: [
        { key: "id_rol", value: id_rol },
        { key: "activo", value: true },
        { key: "id_periodicidad", value: tipo_periodo },
      ],
      orderby: { field: "codigo" },
    })
  );
  let functionNameFormatFiles = { table: null, body: null };
  if (tipo_carga === "SEGUROS_PENSIONES") {
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
    functionNameFormatFiles.body = { fecha_operacion, id_rol, id_usuario };
  }

  const formatoArchivosRequeridos = await EjecutarQuery(
    EjecutarFuncionSQL(functionNameFormatFiles.table, {
      body: functionNameFormatFiles.body,
    })
  );

  return {
    ...codigosSegurosPensiones,
    confArchivos,
    formatoArchivosRequeridos,
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
