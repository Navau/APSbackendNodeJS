const pool = require("../../database");
const { map } = require("lodash");
const moment = require("moment");

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
  respResultadoVacioObject200,
  respErrorServidor500END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_aud_carga_archivos_bolsa";

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

function ValorMaximo(req, res) {
  const { max } = req.body;
  let fieldMax = max ? max : "fecha_operacion";
  let whereValuesAux = [];
  let whereFinal = [
    {
      key: "cargado",
      value: true,
    },
  ];
  map(req.body, (item, index) => {
    whereValuesAux.push({
      key: index,
      value: item,
    });
  });
  whereFinal = whereFinal.concat(whereValuesAux);
  const params = {
    fieldMax,
    where: whereFinal,
  };
  let query = ValorMaximoDeCampoUtil(nameTable, params);
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        if (result.rows[0].max === null) {
          result = {
            ...result,
            rows: [
              {
                max: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
              },
            ],
          };
        }
        respResultadoCorrecto200(res, result);
      }
    }
  });
}

function UltimaCarga(req, res) {
  const { fecha_operacion, cargado } = req.body;
  const { id_rol, id_usuario } = req.user;
  const params = {
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
        value: fecha_operacion,
      },
      {
        key: "cargado",
        value: cargado === true || cargado === false ? cargado : true,
      },
    ],
    orderby: {
      field: "nro_carga",
    },
  };
  let query = ObtenerUltimoRegistro(nameTable, params);
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500END(res, err);
    } else {
      respResultadoVacioObject200(res, result.rows);
    }
  });
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
  tipoDeCambio,
  ValorMaximo,
  UltimaCarga,
};
