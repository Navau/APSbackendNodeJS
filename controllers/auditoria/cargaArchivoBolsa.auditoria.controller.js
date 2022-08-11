const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  EscogerInternoUtil,
  ObtenerUltimoRegistro,
  ValorMaximoDeCampoUtil,
} = require("../../utils/consulta.utils");
const { SelectInnerJoinSimple } = require("../../utils/multiConsulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_oper_carga_archivos_bolsa";

async function tipoDeCambio(req, res) {
  const { fecha_operacion } = req.body;

  let query = EscogerInternoUtil("APS_oper_tipo_cambio", {
    select: [
      `"APS_oper_tipo_cambio".fecha`,
      `"APS_param_moneda".sigla`,
      `"APS_param_moneda".descripcion`,
      `"APS_oper_tipo_cambio".compra`,
      `"APS_oper_tipo_cambio".venta`,
      `"APS_param_moneda".activo`,
      `"APS_param_moneda".es_visible`,
    ],
    innerjoin: [
      {
        table: "APS_param_moneda",
        on: [
          {
            table: "APS_oper_tipo_cambio",
            key: "id_moneda",
          },
          {
            table: "APS_param_moneda",
            key: "id_moneda",
          },
        ],
      },
    ],
    where: [
      { key: `"APS_param_moneda".activo`, value: true },
      { key: `"APS_oper_tipo_cambio".fecha`, value: fecha_operacion },
    ],
  });
  pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        respResultadoCorrecto200(res, result);
      }
    })
    .catch((err) => {
      respErrorServidor500(res, err);
    });
}

async function obtenerFechaOperacion(req, res) {
  const { tipo } = req.body; //PENSIONES O BOLSA
  const { id_rol, id_usuario } = req.user;
  const queryMax = ValorMaximoDeCampoUtil(nameTable, {
    fieldMax: "fecha_operacion",
    where: [
      {
        key: "id_rol",
        value: id_rol,
      },
      {
        key: "id_usuario",
        value: id_usuario,
      },
      {
        key: "cargado",
        value: true,
      },
    ],
  });
  const maxFechaOperacion = await pool
    .query(queryMax)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
      } else if (result?.rows[0]?.max === null) {
        return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
      } else {
        return result.rows[0].max;
      }
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500END(res, err);
      return null;
    });
  const queryUltimoRegistro = ObtenerUltimoRegistro(nameTable, {
    where: [
      {
        key: "id_usuario",
        value: id_usuario,
      },
      {
        key: "id_rol",
        value: id_rol,
      },
      {
        key: "fecha_operacion",
        value: new Date(maxFechaOperacion).toISOString().split("T")[0],
      },
      {
        key: "cargado",
        value: true,
      },
    ],
    orderby: {
      field: "nro_carga",
    },
  });

  const ultimoRegistro = await pool
    .query(queryUltimoRegistro)
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500END(res, err);
      return null;
    });

  const addValues = (date, days) => {
    date.setDate(date.getDate() + days);
    return date;
  };

  const lastDate = new Date(ultimoRegistro);

  const fechaOperacionMensual = () => {
    const year = lastDate.getFullYear(); //2022
    const month = lastDate.getMonth(); //08
    const day = lastDate.getDay(); //10
    const firstDayMonth = new Date(year, month, 1); // 2022-08-01
    const fechaOperacion = addValues(firstDayMonth, -1); // 2022-07-31

    return fechaOperacion;
  };
  const fechaOperacionDiaria = () => {
    const fechaOperacion = addValues(lastDate, 1);
    return fechaOperacion;
  };
  const fechaOperacionDiaHabil = () => {
    const checkDate = addValues(lastDate, 1);
    const day = checkDate.getUTCDay();
    let fechaOperacion = null;
    if (day === 1) {
      //SI ES LUNES
      fechaOperacion = addDays(lastDate, -3); // ENTONCES SERA VIERNES
    } else if (day === 0) {
      // SI ES DOMINGO
      fechaOperacion = addDays(lastDate, -2); // ENTONCES SERA VIERNES
    } else {
      // SI ES SABADO
      fechaOperacion = checkDate; // ENTONCES SERA VIERNES
    }
    return fechaOperacion;
  };

  const FECHA_OPERACION = {
    M: fechaOperacionMensual(),
    D: fechaOperacionDiaria(),
    DH: fechaOperacionDiaHabil(),
  };

  if (isNaN(Date.parse(FECHA_OPERACION[tipo]))) {
    respErrorServidor500END(res, {
      message: "Hubo un error al obtener la fecha de operación.",
      value: FECHA_OPERACION[tipo],
    });
  } else {
    respResultadoCorrectoObjeto200(res, FECHA_OPERACION[tipo]);
  }
}

//FUNCION PARA OBTENER TODOS LOS CARGA ARCHIVO BOLSA DE SEGURIDAD
function Listar(req, res) {
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

//FUNCION PARA OBTENER UN CARGA ARCHIVO BOLSA, CON BUSQUEDA
function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = BuscarUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rows || result.rows < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA OBTENER UN CARGA ARCHIVO BOLSA, CON ID DEL CARGA ARCHIVO BOLSA
function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = EscogerUtil(nameTable, params);
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

//FUNCION PARA INSERTAR UN CARGA ARCHIVO BOLSA
function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = InsertarUtil(nameTable, params);
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

//FUNCION PARA ACTUALIZAR UN CARGA ARCHIVO BOLSA
function Actualizar(req, res) {
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
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN CARGA ARCHIVO BOLSA
function Deshabilitar(req, res) {
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
  obtenerFechaOperacion,
  tipoDeCambio,
};
