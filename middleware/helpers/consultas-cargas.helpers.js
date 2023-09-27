const fs = require("fs");
const { maxBy, forEach, map, size, isUndefined, includes } = require("lodash");
const {
  EjecutarQuery,
  EscogerInternoUtil,
  InsertarUtil,
  ActualizarUtil,
  InsertarVariosUtil,
  EliminarMultiplesTablasUtil,
  ValorMaximoDeCampoUtil,
  AlterarSequenciaUtil,
  AlterarSequencia2Util,
  EjecutarFuncionSQL,
  AlterarSequenciaMultiplesTablasUtil,
  AlterarSequenciaMultiplesTablasUtil2,
  ObtenerColumnasDeTablaUtil,
} = require("../../utils/consulta.utils");
const { DateTime } = require("luxon");

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
    const { table, codeInst } = TABLE_INFO;

    const ultimaCarga = await obtenerUltimaCarga(params);
    const infoCarga = await EjecutarQuery(ObtenerColumnasDeTablaUtil(table));
    const columnasCarga = map(infoCarga, "column_name");
    // if (isUndefined(ultimaCarga))
    //   throw { myCode: 500, message: "La carga anterior no fue encontrada" };
    const maxCarga = ultimaCarga?.nro_carga || 0;
    const whereCarga = {
      id_rol,
      fecha_operacion,
      nro_carga: maxCarga + 1,
      id_usuario,
      cargado: false,
    };
    if (includes(columnasCarga, "reprocesado"))
      whereCarga["reprocesado"] = false;
    if (includes(columnasCarga, "reproceso") && reproceso === true)
      whereCarga["reproceso"] = reproceso;
    if (includes(columnasCarga, "fecha_entrega"))
      whereCarga["fecha_entrega"] = fecha_entrega;
    if (includes(columnasCarga, "cod_institucion"))
      whereCarga["cod_institucion"] = codeInst;
    if (includes(columnasCarga, "id_periodo"))
      whereCarga["id_periodo"] = tipo_periodo;

    const nuevaCarga = await EjecutarQuery(
      InsertarUtil(table, {
        body: whereCarga,
        returnValue: ["id_carga_archivos, fecha_carga"],
      })
    );

    return nuevaCarga?.[0] || undefined;
  } catch (err) {
    throw err;
  }
}

async function modificarNuevaCargaArchivo(params) {
  const {
    nuevaCarga,
    cargado,
    table,
    id,
    reproceso,
    reprocesado = true,
    id_rol,
    fecha_operacion,
  } = params;
  try {
    const body = { cargado };
    if (
      id === "BOLSA" &&
      nuevaCarga?.cargado === false &&
      nuevaCarga?.reproceso === true &&
      reproceso === true
    )
      body.reprocesado = reprocesado;
    const nuevaCargaActualizada = await EjecutarQuery(
      ActualizarUtil(table, {
        body,
        idKey: "id_carga_archivos",
        idValue: nuevaCarga.id_carga_archivos,
        returnValue: ["*"],
      })
    );

    if (id === "BOLSA" && reproceso === true) {
      const ultimaCargaConReproceso = await EjecutarQuery(
        EscogerInternoUtil(table, {
          select: ["*"],
          where: [
            { key: "id_rol", value: id_rol },
            { key: "reproceso", value: true },
            { key: "reprocesado", value: false },
          ],
        })
      );

      const cargaMenor = minBy(ultimaCargaConReproceso, "fecha_operacion");
      if (isUndefined(cargaMenor))
        throw new Error(
          "No existe una fecha válida, para actualizar el reprocesado en BOLSA"
        );

      let dayOfMonth = cargaMenor.fecha_operacion?.getDate();
      dayOfMonth--;
      cargaMenor.fecha_operacion.setDate(dayOfMonth);

      const ultimaCargaReprocesada = cargaMenor;

      if (
        fecha_operacion !==
        DateTime.fromISO(ultimaCargaReprocesada.fecha_operacion).toFormat(
          "yyyy-MM-dd"
        )
      ) {
        const queryUpdateCargaReprocesado = ActualizarUtil(table, {
          body: { reprocesado: true },
          idKey: "id_carga_archivos",
          idValue: ultimaCargaReprocesada.id_carga_archivos,
        });
        await EjecutarQuery(queryUpdateCargaReprocesado);
      }
    }

    return nuevaCargaActualizada;
  } catch (err) {
    throw err;
  }
}

async function eliminarArchivosCargados(
  tables,
  sequences,
  primaryKeys,
  nuevaCarga
) {
  try {
    const idsSequencesArray = [];
    const { id_carga_archivos } = nuevaCarga;
    const queryDeleteUploadedFiles = EliminarMultiplesTablasUtil(tables, {
      where: [{ key: "id_carga_archivos", value: id_carga_archivos }],
    });
    await EjecutarQuery(queryDeleteUploadedFiles);
    let index = 0;
    for await (const table of tables) {
      const primaryKey = primaryKeys[index];
      const queryMax = ValorMaximoDeCampoUtil(table, { fieldMax: primaryKey });
      const maxIdTable = await EjecutarQuery(queryMax);
      const maxId = maxIdTable?.[0]?.max === null ? 0 : maxIdTable[0].max;
      idsSequencesArray.push(parseInt(maxId) + 1);
      index++;
    }
    const querySequences = AlterarSequenciaMultiplesTablasUtil2(sequences, {
      restartValue: idsSequencesArray,
    });
    await EjecutarQuery(querySequences);
  } catch (err) {
    throw err;
  }
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

async function eliminarInformacionDuplicada(
  table,
  where,
  sequence,
  primaryKey
) {
  await EjecutarQuery(EliminarMultiplesTablasUtil([table], { where }));
  const maxIdTable = await EjecutarQuery(
    ValorMaximoDeCampoUtil(table, { fieldMax: primaryKey })
  );
  const maxId = maxIdTable?.[0]?.max === null ? 0 : maxIdTable[0].max;
  const idRestartValue = parseInt(maxId) + 1;
  await EjecutarQuery(
    AlterarSequencia2Util(sequence, { restartValue: idRestartValue })
  );
}

async function funcionesPensiones(fecha, id_rol) {
  try {
    const params = { body: { fecha, id_rol } };
    const querys = [
      EjecutarFuncionSQL("aps_ins_renta_fija_td", params),
      EjecutarFuncionSQL("aps_ins_renta_fija_cupon_ud", params),
      EjecutarFuncionSQL("aps_ins_otros_activos_to", params),
      EjecutarFuncionSQL("aps_ins_otros_activos_cupon_co", params),
      EjecutarFuncionSQL("aps_ins_renta_variable_tv", params),
    ];
    return await Promise.all(map(querys, (query) => EjecutarQuery(query)))
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log(err);
    let message = "Error al ejecutar las funciones de pensiones";
    if (err?.detail) message = `${err?.detail} en ${err?.where}`;
    throw new Error(message);
  }
}

async function funcionesSeguros(fecha, id_usuario, codInst) {
  try {
    const params = { body: { fecha, id_usuario, codInst } };
    const querys = [
      EjecutarFuncionSQL("aps_ins_renta_fija", params),
      EjecutarFuncionSQL("aps_ins_otros_activos", params),
      EjecutarFuncionSQL("aps_ins_renta_variable", params),
    ];
    const querys2 = [
      EjecutarFuncionSQL("aps_ins_otros_activos_cupon", params),
      EjecutarFuncionSQL("aps_ins_renta_fija_cupon", params),
    ];
    return await Promise.all(map(querys, (query) => EjecutarQuery(query)))
      .then(async (response) => {
        console.log("PRIMEROS QUERYS");
        return await Promise.all(map(querys2, (query) => EjecutarQuery(query)))
          .then((response2) => {
            console.log("SEGUNDOS QUERYS");
            return response2;
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log(err);
    let message = "Error al ejecutar las funciones de seguros";
    if (err?.detail) message = `${err?.detail} en ${err?.where}`;
    throw new Error(message);
  }
}

const obtenerUltimaCarga = async (params) => {
  try {
    const { TABLE_INFO, user, tipo_periodo, fecha_operacion } = params;
    const { id_rol, id_usuario } = user;
    const { id, table } = TABLE_INFO;
    const where = [
      { key: "id_rol", value: id_rol },
      { key: "cargado", value: false },
      { key: "fecha_operacion", value: fecha_operacion },
    ];

    if (id === "SEGUROS" || id === "PENSIONES") {
      where.push({
        key: "id_periodo",
        value: tipo_periodo === "M" ? 155 : 154,
      });
      where.push({ key: "cod_institucion", value: TABLE_INFO.codeInst });
    }

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
  eliminarInformacionDuplicada,
  eliminarArchivosCargados,
  obtenerArchivosSubidos,
  funcionesPensiones,
  funcionesSeguros,
};
