const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respUsuarioNoAutorizado,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_emisor_vinculado";

async function ListarCompleto(req, res) {
  const errors = [];

  const queryEmisor = ListarUtil(nameTable);
  const queryPais = ListarUtil("APS_param_pais");
  const queryClasificador = EscogerInternoUtil("APS_param_clasificador_comun", {
    select: ["*"],
    where: [
      {
        key: "id_clasificador_comun_grupo",
        valuesWhereIn: [4, 7],
        whereIn: true,
      },
    ],
  });
  const querySectorEconomico = ListarUtil("APS_param_sector_economico");

  const emisor = await pool
    .query(queryEmisor)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  const pais = await pool
    .query(queryPais)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  const calificadora = await pool
    .query(queryClasificador)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  const sectorEconomico = await pool
    .query(querySectorEconomico)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  forEach([emisor, pais, calificadora, sectorEconomico], (item) => {
    if (item?.err) {
      errors.push({ err: item.err, message: item.err.message });
    }
  });
  if (size(errors) > 0) {
    respErrorServidor500END(res, errors);
    return;
  }
  const resultFinalDataID = map(emisor.result, (item) => {
    const valueEmisor = item;
    const findPais = find(pais.result, (itemFind) => {
      if (itemFind.id_pais === valueEmisor.id_pais) return true;
    });
    const findCalificadora = find(calificadora.result, (itemFind) => {
      if (itemFind.id_clasificador_comun === valueEmisor.id_calificadora)
        return true;
    });
    const findCalificacion = find(calificadora.result, (itemFind) => {
      if (itemFind.id_clasificador_comun === valueEmisor.id_calificacion)
        return true;
    });
    const findSectorEconomico = find(sectorEconomico.result, (itemFind) => {
      if (itemFind.id_sector_economico === valueEmisor.id_sector_economico)
        return true;
    });
    valueEmisor.data_pais = findPais || null;
    valueEmisor.data_calificacion = findCalificacion || null;
    valueEmisor.data_calificadora = findCalificadora || null;
    valueEmisor.data_sector_economico = findSectorEconomico || null;
    return valueEmisor;
  });
  // const resultFinalList = map(emisor.result, (item) => {
  //   const valueEmisor = item;
  //   const findPais = find(pais.result, (itemFind) => {
  //     if (itemFind.id_pais === valueEmisor.id_pais) return true;
  //   });
  //   const findCalificadora = find(calificadora.result, (itemFind) => {
  //     if (itemFind.id_clasificador_comun === valueEmisor.id_calificadora)
  //       return true;
  //   });
  //   const findCalificacion = find(calificadora.result, (itemFind) => {
  //     if (itemFind.id_clasificador_comun === valueEmisor.id_calificacion)
  //       return true;
  //   });
  //   const findSectorEconomico = find(sectorEconomico.result, (itemFind) => {
  //     if (itemFind.id_sector_economico === valueEmisor.id_sector_economico)
  //       return true;
  //   });
  //   valueEmisor.data_pais = findPais || null;
  //   valueEmisor.data_calificacion = findCalificacion || null;
  //   valueEmisor.data_calificadora = findCalificadora || null;
  //   valueEmisor.data_sector_economico = findSectorEconomico || null;
  //   return {
  //     id_emisor: item?.id_emisor,
  //     codigo_rmv: item?.codigo_rmv,
  //     razon_social: item?.razon_social,
  //     id_pais: findPais?.descripcion,
  //     id_calificacion: findCalificacion?.descripcion,
  //     id_calificadora: findCalificadora?.sigla,
  //     id_sector_economico: findSectorEconomico?.descripcion,
  //     activo: item?.activo,
  //     id_usuario: item?.id_usuario,
  //   };
  // });
  respResultadoCorrectoObjeto200(res, resultFinalDataID);
  // respResultadoCorrectoObjeto200(res, resultFinalList);
}

//FUNCION PARA OBTENER TODOS LOS EMISOR VINCULADO DE SEGURIDAD
async function Listar(req, res) {
  const query = ListarUtil(nameTable);
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA OBTENER UN EMISOR VINCULADO, CON BUSQUEDA
async function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA OBTENER UN EMISOR VINCULADO, CON ID DEL EMISOR VINCULADO
async function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = EscogerUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA INSERTAR UN EMISOR VINCULADO
async function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = InsertarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(
          res,
          result.rows,
          "Información guardada correctamente"
        );
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA ACTUALIZAR UN EMISOR VINCULADO
async function Actualizar(req, res) {
  const body = req.body;

  let query = "";

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = ActualizarUtil(nameTable, params);

      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(
              res,
              result,
              "Información actualizada correctamente"
            );
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN EMISOR VINCULADO
async function Deshabilitar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = DeshabilitarUtil(nameTable, params);
      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

module.exports = {
  Listar,
  ListarCompleto,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
};
