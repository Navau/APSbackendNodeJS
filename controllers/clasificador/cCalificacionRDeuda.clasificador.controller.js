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
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respResultadoVacioObject200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_clasificador_comun";
const nameTableGroup = "APS_param_clasificador_comun_grupo";
const idClasificadorComunGrupo = 6;
const valueId = "id_calificacion_rdeuda";

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
  pool.query(queryLlave, (err, result) => {
    if (err) {
      respErrorServidor500END(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(
          res,
          `No existe ningún registro que contenga la llave: ${idClasificadorComunGrupo} o ${valueId}`
        );
      } else {
        let query = EscogerUtil(nameTable, params);
        params = { ...params, key: result.rows[0].llave };
        pool.query(query, (err2, result2) => {
          if (err2) {
            respErrorServidor500(res, err2);
          } else {
            if (!result.rowCount || result.rowCount < 1) {
              respResultadoVacio404(res);
            } else {
              respResultadoCorrecto200(res, result2);
            }
          }
        });
      }
    }
  });
}

module.exports = {
  Listar,
  Escoger,
};
