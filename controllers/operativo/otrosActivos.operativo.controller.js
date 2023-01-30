const { indexOf, size } = require("lodash");
const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  EjecutarVariosQuerys,
  EscogerInternoUtil,
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

const nameTable = "APS_oper_otros_activos";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_tipo_instrumento";
const nameTableFK3 = "APS_param_moneda";
const nameTableFK4 = "APS_param_clasificador_comun";
const nameTableFK5 = "APS_seg_usuario";

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
          { key: "id_clasificador_comun_grupo", value: 24 },
          { key: "activo", value: true },
        ],
      }), //PERIODO VENCIMIENTO
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 25 },
          { key: "activo", value: true },
        ],
      }), //TIPO AMORTIZACION
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 35 },
          { key: "activo", value: true },
        ],
      }), //CALIFICACION
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 8 },
          { key: "activo", value: true },
        ],
      }), //CALIFICADORA
      ListarUtil(nameTableFK5), //USUARIO
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
        { table: nameTableFK4, key: "id_periodo_vencimiento" },
        { table: nameTableFK4, key: "id_tipo_amortizacion" },
        { table: nameTableFK4, key: "id_calificacion" },
        { table: nameTableFK4, key: "id_calificadora" },
      ]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function EmisorTGN(req, res) {
  const query = EscogerInternoUtil(nameTableFK1, {
    select: ["*"],
    where: [
      { key: "id_pais", value: 8, operator: "<>" },
      { key: "codigo_rmv", value: "TGN", operatorSQL: "OR" },
    ],
  });
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA OBTENER TODOS LOS OTROS ACTIVOS DE SEGURIDAD
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

//FUNCION PARA OBTENER UN OTROS ACTIVOS, CON BUSQUEDA
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

//FUNCION PARA OBTENER UN OTROS ACTIVOS, CON ID DEL OTROS ACTIVOS
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

//FUNCION PARA INSERTAR UN OTROS ACTIVOS
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
        if (err?.code === "23505")
          respResultadoIncorrectoObjeto200(
            res,
            err,
            [],
            `La Clave de Instrumento${err?.detail.substring(
              indexOf(err?.detail, "=") + 1,
              size(err?.detail) - 1
            )} ya está registrada`
          );
        else respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA ACTUALIZAR UN OTROS ACTIVOS
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
          if (err?.code === "23505") {
            const detail = err?.detail;
            if (!isUndefined(detail)) {
              const arrayDetail = split(detail, "=");
              const fieldsAux = arrayDetail[0];
              const valuesAux = arrayDetail[1];
              const fields = fieldsAux.substring(
                indexOf(fieldsAux, "("),
                indexOf(fieldsAux, ")") + 1
              );
              const values = valuesAux.substring(
                indexOf(valuesAux, "("),
                indexOf(valuesAux, ")") + 1
              );

              respResultadoIncorrectoObjeto200(
                res,
                err,
                [],
                `Los campos ${fields} con los valores ${values} ya esta registrado`
              );
            } else {
              respErrorServidor500END(res, err);
            }
          } else respErrorServidor500END(res, err);
        });
    }
  }
}

//FUNCION PARA DESHABILITAR UN OTROS ACTIVOS
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
  EmisorTGN,
};
