const fs = require("fs");
const { maxBy, forEach, map, size, isUndefined } = require("lodash");
const {
  EjecutarQuery,
  EscogerInternoUtil,
  InsertarUtil,
  ActualizarUtil,
  InsertarVariosUtil,
} = require("../../utils/consulta.utils");

async function insertarNuevaCargaArchivo(params) {
  try {
    const {
      TABLE_INFO,
      user,
      tipo_periodo,
      reproceso,
      fecha_entrega,
      fecha_operacion,
    } = params;
    const { id_rol, id_usuario } = user;
    const { table, code } = TABLE_INFO;

    const ultimaCarga = await obtenerUltimaCarga(params);
    if (isUndefined(ultimaCarga))
      throw { myCode: 500, message: "La carga anterior no fue encontrada" };
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
    // console.log({ ultimaCarga, whereCarga, params });

    const nuevaCarga = await EjecutarQuery(
      InsertarUtil(table, {
        body: whereCarga,
        returnValue: ["id_carga_archivos"],
      })
    );

    return nuevaCarga?.[0] || undefined;
  } catch (err) {
    throw err;
  }
}

async function modificarNuevaCargaArchivo(params) {
  const { nuevaCarga, table, cargado } = params;

  return await EjecutarQuery(
    ActualizarUtil(table, {
      body: { cargado },
      idKey: "id_carga_archivos",
      idValue: nuevaCarga.id_carga_archivos,
      returnValue: ["*"],
    })
  );
}

async function obtenerArchivosSubidos(formattedFiles) {
  return map(formattedFiles, (file) => {
    const filePath = `./uploads/tmp/${file.nombre}`;
    const fileContent = fs.readFileSync(filePath, "utf8");
    return {
      fileCode: file.codigo,
      fileContent,
      fileName: file.nombre,
      fileIsEmpty: file.archivo_vacio,
      filePath,
    };
  });
}

const obtenerUltimaCarga = async (params) => {
  try {
    const { TABLE_INFO, user, tipo_periodo } = params;
    const { id_rol, id_usuario } = user;
    const { id, table } = TABLE_INFO;
    const where = [
      { key: "id_rol", value: id_rol },
      { key: "cod_institucion", value: TABLE_INFO.code },
      { key: "id_usuario", value: id_usuario },
      { key: "cargado", value: true },
    ];

    if (id === "SEGUROS" || id === "PENSIONES")
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
  } catch (err) {
    throw err;
  }
};

module.exports = {
  insertarNuevaCargaArchivo,
  modificarNuevaCargaArchivo,
  obtenerArchivosSubidos,
};
