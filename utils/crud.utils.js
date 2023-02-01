const { size, find, includes, isUndefined } = require("lodash");
const pool = require("../database");
const {
  ListarUtil,
  ListarCamposDeTablaUtil,
  BuscarUtil,
  InsertarUtil,
} = require("./consulta.utils");
const {
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respDatosNoRecibidos200END,
} = require("./respuesta.utils");

async function CampoActivoAux(nameTable) {
  const fields = await pool
    .query(ListarCamposDeTablaUtil(nameTable))
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  const existFieldActive = find(fields, (item) =>
    includes(item.column_name, "activo")
  );
  return existFieldActive;
}

// TO DO: Cambiar el nombre de Util por Consulta, por ejemplo de ListarUtil, cambiar a ListarConsulta o ListarQuery
async function ListarCRUD(req, res, nameTable) {
  try {
    const query = isUndefined(CampoActivoAux(nameTable))
      ? ListarUtil(nameTable, { activo: null })
      : ListarUtil(nameTable);

    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function BuscarCRUD(req, res, nameTable) {
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { body };
    if (isUndefined(CampoActivoAux(nameTable))) params.activo = null;
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function EscogerCRUD(req, res, nameTable) {
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { body };
    if (isUndefined(CampoActivoAux(nameTable))) params.activo = null;
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function InsertarCRUD(req, res, nameTable) {
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { body };
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
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ActualizarCRUD(req, res, nameTable) {
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { body };
    if (isUndefined(CampoActivoAux(nameTable))) params.activo = null;
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
};
