const {
  EjecutarQuery,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");

async function obtenerInformacionInicial(data, user) {
  const { id_usuario, id_rol } = user;
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
        { key: "id_periodicidad", value: data.tipo_periodo },
      ],
      orderby: { field: "codigo" },
    })
  );

  return { ...codigosSegurosPensiones, confArchivos };
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
