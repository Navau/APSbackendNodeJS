const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const {
  ListarUtil,
  AsignarInformacionCompletaPorUnaClave,
  EjecutarVariosQuerys,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_seg_institucion";
const nameTableFK1 = "APS_param_clasificador_comun";
const nameTableFK2 = "APS_param_clasificador_comun";

//TO DO: CRUD EXTREMO
async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable),
      EscogerInternoUtil(nameTableFK1, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 26 },
          { key: "activo", value: true },
        ],
      }),
      EscogerInternoUtil(nameTableFK2, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 10 },
          { key: "activo", value: true },
        ],
      }),
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
        { table: nameTableFK1, key: "id_tipo_entidad" },
        { table: nameTableFK2, key: "id_tipo_mercado" },
      ]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//LISTAR UNA INSTITUCION
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

//BUSCAR UNA INSTITUCION
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

//ESCOGER UNA INSTITUCION
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

//INSERTAR UNA INSTITUCION
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

//ACTUALIZAR UNA INSTITUCION
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
  ListarCompleto,
};
