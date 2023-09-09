const { maxBy, isUndefined } = require("lodash");
const {
  EjecutarQuery,
  EscogerInternoUtil,
  InsertarUtil,
} = require("../../utils/consulta.utils");

async function insertarNuevaCargaArchivo(params) {
  const {
    TABLE_INFO,
    user,
    tipo_periodo,
    reproceso,
    fecha_carga,
    fecha_operacion,
  } = params;
  const { id_rol, id_usuario } = user;
  const { table, code } = TABLE_INFO;

  const ultimaCarga = await obtenerUltimaCarga(params);
  const maxCarga = ultimaCarga?.nro_carga || 0;
  const whereCarga = {
    id_rol,
    fecha_operacion,
    nro_carga: maxCarga + 1,
    id_usuario,
    cargado: false,
  };
  if (ultimaCarga?.reprocesado) whereCarga["reprocesado"] = false;
  if (ultimaCarga?.reproceso) whereCarga["reproceso"] = reproceso;
  if (ultimaCarga?.fecha_entrega) whereCarga["fecha_entrega"] = fecha_entrega;
  if (ultimaCarga?.cod_institucion) whereCarga["cod_institucion"] = code;
  if (ultimaCarga?.id_periodo) whereCarga["id_periodo"] = tipo_periodo;

  const nuevaCarga =
    (await EjecutarQuery(
      InsertarUtil(table, {
        body: whereCarga,
        returnValue: ["id_carga_archivos"],
      })
    )?.[0]) || undefined;

  return nuevaCarga;
}

const obtenerUltimaCarga = async (params) => {
  try {
    const { TABLE_INFO, user, tipo_periodo, fecha_operacion } = params;
    const { id_rol, id_usuario } = user;
    const { id, table } = TABLE_INFO;
    const where = [
      { key: "id_rol", value: id_rol },
      { key: "fecha_operacion", value: fecha_operacion },
      { key: "id_usuario", value: id_usuario },
    ];

    if (id === "SEGUROS_PENSIONES")
      where.push({
        key: "id_periodo",
        value: tipo_periodo === "M" ? 155 : 154,
      });

    const cargas = await EjecutarQuery(
      EscogerInternoUtil(table, {
        select: ["*"],
        where,
      })
    );
    return maxBy(cargas, "nro_carga");
    // return {
    //   infoMaxNroCarga: maxBy(cargas, "nro_carga"),
    //   maxNroCarga: maxBy(cargas, "nro_carga")?.nro_carga || 0,
    // };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  insertarNuevaCargaArchivo,
};
