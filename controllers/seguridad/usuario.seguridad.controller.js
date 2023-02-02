const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
} = require("../../utils/consulta.utils");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const { SelectInnerJoinSimple } = require("../../utils/multiConsulta.utils");
const {
  VerificarPermisoTablaUsuario,
  DatosCriticos,
  DatosAnteriores,
  Log,
  LogDet,
} = require("../../utils/permiso.utils");

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

const nameTable = "APS_seg_usuario";

//TO DO: Arreglar y Eliminar lo de "SelectInnerJoinSimple"
async function InstitucionConIDUsuario(req, res) {
  const { id_usuario } = req.body;

  if (!id_usuario) {
    respDatosNoRecibidos400(
      res,
      "La información que se mando no es suficiente, falta el ID de usuario."
    );
  } else {
    const params = {
      select: [
        `"APS_seg_usuario".usuario`,
        `"APS_seg_institucion".institucion`,
        `"APS_seg_institucion".sigla`,
        `"APS_seg_institucion".codigo`,
        `"APS_param_clasificador_comun".descripcion`,
      ],
      from: [`"APS_seg_usuario"`],
      innerjoin: [
        {
          join: `"APS_seg_institucion"`,
          on: [
            `"APS_seg_usuario".id_institucion = "APS_seg_institucion".id_institucion`,
          ],
        },
        {
          join: `"APS_param_clasificador_comun"`,
          on: [
            `"APS_seg_institucion".id_tipo_entidad = "APS_param_clasificador_comun".id_clasificador_comun`,
          ],
        },
      ],
      where: [{ key: `"APS_seg_usuario".id_usuario`, value: id_usuario }],
    };
    let query = SelectInnerJoinSimple(params);
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

//FUNCION PARA OBTENER TODOS LOS USUARIO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

//FUNCION PARA OBTENER UN USUARIO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

//FUNCION PARA OBTENER UN USUARIO, CON ID DEL USUARIO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

//FUNCION PARA INSERTAR UN USUARIO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

//FUNCION PARA ACTUALIZAR UN USUARIO
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
  InstitucionConIDUsuario,
};
