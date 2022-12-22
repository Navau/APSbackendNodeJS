const { map } = require("lodash");
const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EjecutarFuncionSQL,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoVacio404END,
  respResultadoIncorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_limite";

async function ValorMaximo(req, res) {
  const { body } = req;
  const whereFinal = [];
  map(body, (item, index) => {
    whereFinal.push({
      key: index,
      value: item,
    });
  });
  const query = ValorMaximoDeCampoUtil(nameTable, {
    fieldMax: "fecha",
    where: whereFinal,
  });

  const maxFecha = await pool
    .query(query)
    .then((result) => {
      if (!result.rows?.[0].max) {
        return { ok: false, value: result.rows[0].max };
      } else {
        return { ok: true, value: result.rows[0].max };
      }
    })
    .catch((err) => {
      return { ok: null, err };
    });

  if (maxFecha?.err) {
    respErrorServidor500END(res, maxFecha.err);
    return null;
  }
  if (maxFecha.ok === false) {
    respResultadoVacio404END(res);
    return null;
  }

  respResultadoCorrectoObjeto200(res, maxFecha.value);
}

async function UltimoRegistro(req, res) {
  function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join("-") +
      " " +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(":") +
      "." +
      [padTo2Digits(date.getMilliseconds())].join()
    );
  }
  const { id_moneda } = req.body;
  const query = ValorMaximoDeCampoUtil(nameTable, {
    fieldMax: "fecha",
    where: [
      {
        key: "id_moneda",
        value: id_moneda,
      },
    ],
  });

  const maxFecha = await pool
    .query(query)
    .then((result) => {
      if (!result.rows?.[0].max) {
        return { ok: false, value: result.rows[0].max };
      } else {
        return { ok: true, value: result.rows[0].max };
      }
    })
    .catch((err) => {
      return { ok: null, err };
    });

  if (maxFecha?.err) {
    respErrorServidor500END(res, maxFecha.err);
    return null;
  }
  if (maxFecha.ok === false) {
    respResultadoVacio404END(
      res,
      "No se encontró ninguna fecha para esta moneda"
    );
    return null;
  }

  const queryLastInfo = ObtenerUltimoRegistro(nameTable, {
    where: [
      {
        key: "fecha",
        value: formatDate(maxFecha.value),
      },
      {
        key: "id_moneda",
        value: id_moneda,
      },
    ],
    orderby: {
      field: "id_tipo_cambio",
    },
  });

  const lastInfo = await pool
    .query(queryLastInfo)
    .then((result) => {
      if (result.rows.length === 0) {
        respResultadoVacio404END(
          res,
          "No se encontró ninguna fecha para esta moneda"
        );
        return null;
      } else {
        return result.rows[0];
      }
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500END(res, maxFecha.err);
      return null;
    });

  if (lastInfo === null) return null;

  respResultadoCorrectoObjeto200(res, lastInfo);
}

async function LimitesSeguros(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = EjecutarFuncionSQL("aps_limites_seguros", params);

    pool
      .query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          respResultadoCorrectoObjeto200(res, result.rows);
        } else {
          respResultadoIncorrectoObjeto200(res, null, result.rows);
        }
      })
      .catch((err) => {
        console.log(err);
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA OBTENER TODOS LOS TIPO CAMBIO DE SEGURIDAD
async function Listar(req, res) {
  let query = ListarUtil(nameTable);
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

//FUNCION PARA OBTENER UN TIPO CAMBIO, CON BUSQUEDA
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

//FUNCION PARA OBTENER UN TIPO CAMBIO, CON ID DEL TIPO CAMBIO
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

//FUNCION PARA INSERTAR UN TIPO CAMBIO
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

//FUNCION PARA ACTUALIZAR UN TIPO CAMBIO
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

//FUNCION PARA DESHABILITAR UN TIPO CAMBIO
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
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
  ValorMaximo,
  UltimoRegistro,
  LimitesSeguros,
};
