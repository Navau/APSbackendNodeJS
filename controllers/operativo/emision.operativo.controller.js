const { size, forEach, map } = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  BuscarDiferenteCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  EscogerInternoUtil,
  BuscarDiferenteUtil,
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
  respResultadoIncorrectoObjeto200,
  respResultadoCorrectoObjeto200,
  respResultadoVacioObject200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_oper_emision";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_moneda";
const nameTableFK3 = "APS_param_tipo_instrumento";

async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable, { activo: null }),
      ListarUtil(nameTableFK1),
      ListarUtil(nameTableFK2),
      ListarUtil(nameTableFK3),
    ];
    const resultQuerys = await EjecutarVariosQuerys(querys);
    if (resultQuerys.ok === null) {
      throw resultQuerys.result;
    }
    if (resultQuerys.ok === false) {
      throw resultQuerys.errors;
    }
    const resultFinal = AsignarInformacionCompletaPorUnaClave(
      resultQuerys.result
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

// OBTENER TODOS LOS EMISION PATRIMONIO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN EMISION PATRIMONIO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN EMISION, CON BUSQUEDA DIFERENTE
async function BuscarDiferente(req, res) {
  const params = { req, res, nameTable };
  await BuscarDiferenteCRUD(params);
}

// OBTENER UN EMISION PATRIMONIO, CON ID DEL EMISION PATRIMONIO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

async function EscogerPorTipoInstrumentoDetalle(req, res) {
  try {
    const { id_emisor, id_tipo_instrumento } = req.body;
    //#region TIPO INSTRUMENTO DETALLE
    const whereAux = [
      {
        key: "id_tipo_instrumento",
        value: id_tipo_instrumento,
      },
      {
        key: "es_seriado",
        value: true,
      },
      {
        key: "id_tipo_renta",
        valuesWhereIn: [135, 136],
        whereIn: true,
      },
      {
        key: "activo",
        value: true,
      },
      {
        key: "id_grupo",
        valuesWhereIn: [111, 119, 121, 126, 127],
        whereIn: true,
        searchCriteriaWhereIn: "NOT IN",
      },
    ];
    const queryTipoInstrumentoDetalle = EscogerInternoUtil(
      "APS_param_tipo_instrumento",
      {
        select: ["*"],
        where: whereAux,
        orderby: {
          field: "sigla",
        },
      }
    );
    const tipoInstrumentoDetalle = await pool
      .query(queryTipoInstrumentoDetalle)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (tipoInstrumentoDetalle.ok === null) throw tipoInstrumentoDetalle.err;
    //#endregion
    const instrumentos = map(
      tipoInstrumentoDetalle.result,
      (instrumento) => `'${instrumento.id_tipo_instrumento}'`
    );
    const whereAuxEmision = [{ key: "id_emisor", value: id_emisor }];
    if (size(instrumentos) > 0) {
      whereAuxEmision.push({
        key: "id_tipo_instrumento",
        valuesWhereIn: instrumentos,
        whereIn: true,
      });
    } else {
      respResultadoIncorrectoObjeto200(
        res,
        instrumentos,
        "Tipo Instrumento no válido"
      );
      return;
    }
    const query = EscogerInternoUtil(nameTable, {
      select: ["*"],
      where: whereAuxEmision,
    });
    await pool
      .query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          respResultadoCorrectoObjeto200(res, result.rows);
        } else {
          respResultadoCorrectoObjeto200(
            res,
            result.rows,
            "No existe ninguna emisión registrada"
          );
        }
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

// INSERTAR UN EMISION PATRIMONIO
async function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const id = ValidarIDActualizarUtil(nameTable, body);
    delete body[id.idKey];
    const queryExist = EscogerUtil(nameTable, {
      body: {
        id_emisor: body.id_emisor,
        id_tipo_instrumento: body.id_tipo_instrumento,
        denominacion: body.denominacion,
      },
      activo: null,
    });
    const exist = await pool
      .query(queryExist)
      .then((result) => {
        if (result.rowCount > 0) {
          return { ok: true, result: result.rows };
        } else {
          return { ok: false, result: result.rows };
        }
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (exist.ok === null) {
      respErrorServidor500END(res, exist.err);
      return;
    }
    if (exist.ok === true) {
      respResultadoIncorrectoObjeto200(
        res,
        null,
        exist.result,
        "La información ya existe"
      );
      return;
    }
    const params = {
      body,
    };
    const query = InsertarUtil(nameTable, params);
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

// ACTUALIZAR UN EMISION PATRIMONIO
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  BuscarDiferente,
  ListarCompleto,
  EscogerPorTipoInstrumentoDetalle,
};
