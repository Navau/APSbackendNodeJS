const pool = require("../../database");

const {
  EscogerInternoUtil,
  ActualizarUtil,
  EliminarUtil,
} = require("../../utils/consulta.utils");

const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const {
  respDatosNoRecibidos400,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_seg_usuario";

async function InstitucionConIDUsuario(req, res) {
  const { id_usuario } = req.body;

  if (!id_usuario) {
    respDatosNoRecibidos400(
      res,
      "La información que se mando no es suficiente, falta el ID de usuario."
    );
    return;
  }
  const params = {
    select: [
      `"APS_seg_usuario".usuario`,
      `"APS_seg_institucion".institucion`,
      `"APS_seg_institucion".sigla`,
      `"APS_seg_institucion".codigo`,
      `"APS_param_clasificador_comun".descripcion`,
    ],
    innerjoin: [
      {
        table: "APS_seg_institucion",
        on: [
          {
            table: "APS_seg_usuario",
            key: "id_institucion",
          },
          {
            table: "APS_seg_institucion",
            key: "id_institucion",
          },
        ],
      },
      {
        table: "APS_param_clasificador_comun",
        on: [
          {
            table: "APS_seg_institucion",
            key: "id_tipo_entidad",
          },
          {
            table: "APS_param_clasificador_comun",
            key: "id_clasificador_comun",
          },
        ],
      },
    ],
    where: [{ key: `"APS_seg_usuario".id_usuario`, value: id_usuario }],
  };

  const query = EscogerInternoUtil(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//LISTAR UN USUARIO
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

//BUSCAR UN USUARIO
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

//ESCOGER UN USUARIO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

//INSERTAR UN USUARIO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

//ACTUALIZAR UN USUARIO
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

async function Desbloquear(req, res) {
  try {
    const { id_usuario, bloqueado } = req.body;
    const queryReinicio = ActualizarUtil("APS_seg_intentos_log", {
      body: { activo: false },
      idKey: "id_usuario",
      idValue: id_usuario,
      returnValue: ["*"],
    });
    await pool
      .query(queryReinicio)
      .then(async (result) => {
        const queryBloqueaUsuario = ActualizarUtil("APS_seg_usuario", {
          body: { bloqueado: bloqueado },
          idKey: "id_usuario",
          idValue: id_usuario,
          returnValue: ["*"],
        });
        const usuarioBloqueado = await pool
          .query(queryBloqueaUsuario)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        if (usuarioBloqueado.ok === null) throw usuarioBloqueado.err;
        respResultadoCorrectoObjeto200(
          res,
          [],
          "Usuario desbloqueado con éxito"
        );
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  InstitucionConIDUsuario,
  Desbloquear,
};
