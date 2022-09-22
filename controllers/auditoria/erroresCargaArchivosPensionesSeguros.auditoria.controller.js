const { map } = require("lodash");
const pool = require("../../database");
const moment = require("moment");
const nodemailer = require("nodemailer");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerInstitucion,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
  ObtenerUsuario,
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

const nameTable = "APS_aud_errores_carga_archivos_pensiones_seguros";

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

//FUNCION PARA OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
function Listar(req, res) {
  let query = ListarUtil(nameTable);
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

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = BuscarUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rows || result.rows < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = EscogerUtil(nameTable, params);
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

async function Reporte(req, res) {
  const { fecha, periodo } = req.body;

  if (Object.entries(req.body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const cod_institucion = await ObtenerInstitucion(req.user);
    const params = {
      body: {
        fecha,
        cod_institucion: cod_institucion.result.codigo,
        periodo,
      },
    };
    const query = EjecutarFuncionSQL(
      "aps_reporte_validacion_preliminar",
      params
    );

    pool
      .query(query)
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
        console.log(err);
        respErrorServidor500END(res, err);
      });
  }
}

async function Reporte2(req, res) {
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

async function EnviarCorreo(req, res) {
  const { email, subject, description } = req.body;
  const user = await ObtenerUsuario(req.user);

  const emailFinal = email ? email : user.result.email;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "contactojosegutierrez10@gmail.com",
      // user: "admin-jose-aps",
      pass: "zwnytvxpkcbnztob",
    },
  });

  const mailOptions = {
    from: "APS validaciones",
    to: emailFinal,
    subject: subject ? subject : "Asunto APS",
    html: `
    <div>
      <h3>${description}</h3>
    </div>
    `,
  };

  await transporter
    .sendMail(mailOptions)
    .then((result) => {
      respResultadoCorrectoObjeto200(
        res,
        result,
        `Correo enviado correctamente a ${emailFinal}`
      );
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = InsertarUtil(nameTable, params);
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

//FUNCION PARA ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
function Actualizar(req, res) {
  const body = req.body;

  let query = "";

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
      query = ActualizarUtil(nameTable, params);

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

//FUNCION PARA DESHABILITAR UN CARGA ARCHIVO PENSIONES SEGURO
function Deshabilitar(req, res) {
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
  ValorMaximo,
  Reporte,
  EnviarCorreo,
};
