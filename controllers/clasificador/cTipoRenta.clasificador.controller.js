const {
  ListarClasificadorCRUD,
  EscogerClasificadorCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_clasificador_comun";
const nameTableGroup = "APS_param_clasificador_comun_grupo";
const idClasificadorComunGrupo = 12;
const valueId = "id_tipo_renta";

async function Listar(req, res) {
  const params = { req, res, nameTable, idClasificadorComunGrupo, valueId };
  await ListarClasificadorCRUD(params);
}

async function Escoger(req, res) {
  const params = {
    req,
    res,
    nameTable,
    idClasificadorComunGrupo,
    valueId,
    nameTableGroup,
  };
  await EscogerClasificadorCRUD(params);
}

module.exports = {
  Listar,
  Escoger,
};
