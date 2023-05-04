const { map } = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");
const moment = require("moment");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerInstitucion,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respErrorServidor500END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_aud_errores_carga_archivos_custodio";

function ValorMaximo(req, res) {
  const { max } = req.body;
  let fieldMax = max ? max : "fecha_operacion";
  let whereValuesAux = [];
  let whereFinal = [
    {
      key: "cargado",
      value: true,
    },
  ];
  map(req.body, (item, index) => {
    whereValuesAux.push({
      key: index,
      value: item,
    });
  });
  whereFinal = whereFinal.concat(whereValuesAux);
  const params = {
    fieldMax,
    where: whereFinal,
  };
  let query = ValorMaximoDeCampoUtil(nameTable, params);
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        if (result.rows[0].max === null) {
          result = {
            ...result,
            rows: [
              {
                max: moment(item).format("YYYY-MM-DD HH:mm:ss.SSS"),
              },
            ],
          };
        }
        respResultadoCorrecto200(res, result);
      }
    }
  });
}

// OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

async function Reporte(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const cod_institucion = await ObtenerInstitucion(req.user);
    const params = {
      body: {
        ...body,
        cod_institucion: cod_institucion?.result?.[0]?.codigo,
      },
    };
    const query = EscogerUtil(nameTable.replace("errores_", ""), params);
    const cargaArchivos = await pool
      .query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          return result.rows?.[0];
        } else {
          return result.rows;
        }
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    // console.log(cargaArchivos);

    if (cargaArchivos === null) {
      respErrorServidor500END(res, err);
      return null;
    }
    if (cargaArchivos.length <= 0) {
      respResultadoIncorrectoObjeto200(
        res,
        null,
        cargaArchivos,
        `No existe ningún registro de carga para la fecha`
      );
      return null;
    }

    const paramsErrores = {
      select: ["*"],
      where: [
        {
          key: "id_carga_archivos",
          value: cargaArchivos.id_carga_archivos,
        },
      ],
    };
    const queryErrores = EscogerInternoUtil(nameTable, paramsErrores);

    pool
      .query(queryErrores)
      .then((result) => {
        if (result.rowCount > 0) {
          respResultadoCorrectoObjeto200(res, result.rows);
        } else {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            result.rows,
            `No existen errores registrados para esa fecha`
          );
        }
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

// INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
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
  ValorMaximo,
  Reporte,
};
