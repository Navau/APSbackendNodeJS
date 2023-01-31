const { indexOf, size, isUndefined, split } = require("lodash");
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
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
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

const nameTable = "APS_oper_renta_variable";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_tipo_instrumento";
const nameTableFK3 = "APS_param_moneda";
const nameTableFK4 = "APS_param_clasificador_comun";
const nameTableFK5 = "APS_seg_usuario";
const nameTableFK6 = "APS_oper_emision";

async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable, { activo: null }),
      ListarUtil(nameTableFK1),
      ListarUtil(nameTableFK2),
      ListarUtil(nameTableFK3),
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 28 },
          { key: "activo", value: true },
        ],
      }), // TIPO ACCION
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 19 },
          { key: "activo", value: true },
        ],
      }), //CUSTODIO
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 5 },
          { key: "activo", value: true },
        ],
      }), //CALIFICACION
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 7 },
          { key: "activo", value: true },
        ],
      }), //CALIFICADORA
      ListarUtil(nameTableFK5), //USUARIO
      ListarUtil(nameTableFK6, { activo: null }), //EMISION
    ];
    const resultQuerys = await EjecutarVariosQuerys(querys);
    if (resultQuerys.ok === null) {
      throw resultQuerys.result;
    }
    if (resultQuerys.ok === false) {
      throw resultQuerys.errors;
    }
    const resultFinal = AsignarInformacionCompletaPorUnaClave(
      resultQuerys.result,
      [
        { table: nameTableFK4, key: "id_tipo_accion" },
        { table: nameTableFK4, key: "id_custodio" },
        { table: nameTableFK4, key: "id_calificacion" },
        { table: nameTableFK4, key: "id_calificadora" },
      ]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//FUNCION PARA OBTENER TODOS LOS RENTA VARIABLE  DE SEGURIDAD
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

//FUNCION PARA OBTENER UN RENTA VARIABLE , CON BUSQUEDA
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

//FUNCION PARA OBTENER UN RENTA VARIABLE , CON ID DEL RENTA VARIABLE
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

//FUNCION PARA INSERTAR UN RENTA VARIABLE
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

//FUNCION PARA ACTUALIZAR UN RENTA VARIABLE
async function Actualizar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      const query = ActualizarUtil(nameTable, params);
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
}

//FUNCION PARA DESHABILITAR UN RENTA VARIABLE
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
  ListarCompleto,
};
