const { map } = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");

const {
  ListarUtil,
  EscogerUtil,
  EscogerLlaveClasificadorUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respResultadoVacioObject200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_clasificador_comun";
const nameTableGroup = "APS_param_clasificador_comun_grupo";
const idClasificadorComunGrupo = 7;
const valueId = "id_calificadora_rnacional";

async function Listar(req, res) {
  const params = {
    clasificador: true,
    idClasificadorComunGrupo,
    valueId,
  };
  const query = ListarUtil(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoCorrectoObjeto200(res, result.rows);
      } else {
        let resultFinalAux = result;
        let a = [];
        let b = [];
        map(resultFinalAux.rows, (item, index) => {
          map(item, (item2, index2) => {
            if (index2 === "id_clasificador_comun") {
              result.rows[index][valueId] = item2;
              delete result.rows[index][index2];
            }
            b.push();
          });
        });
        respResultadoCorrectoObjeto200(res, result.rows);
      }
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

async function Escoger(req, res) {
  const params = {
    clasificador: true,
    idClasificadorComunGrupo,
    valueId,
  };
  let paramsLlave = {
    idClasificadorComunGrupo,
  };
  const queryLlave = EscogerLlaveClasificadorUtil(nameTableGroup, paramsLlave);
  await pool
    .query(queryLlave)
    .then(async (result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacioObject200(
          res,
          result.rows,
          `No existe ningún registro que contenta la llave: ${idClasificadorComunGrupo} o ${valueId}`
        );
      } else {
        const query = EscogerUtil(nameTable, {
          ...params,
          key: result.rows[0].llave,
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
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

module.exports = {
  Listar,
  Escoger,
};
