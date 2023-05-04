const { map, forEach, size } = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");
const moment = require("moment");
const nodemailer = require("nodemailer");

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
  EjecutarFuncionSQL,
  ObtenerUsuario,
  ObtenerUsuariosPorRol,
  EjecutarVariosQuerys,
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

const dayjs = require("dayjs");
require("dayjs/locale/es");

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

async function EscogerValidacionPreliminar(req, res) {
  try {
    const { id_carga_archivos } = req.body;
    const querys = [
      EscogerInternoUtil("APS_aud_carga_archivos_pensiones_seguros", {
        select: ["*"],
        where: [{ key: "id_carga_archivos", value: id_carga_archivos }],
      }),
      EscogerUtil(nameTable, {
        activo: null,
        body: {
          id_carga_archivos,
        },
      }),
    ];
    const results = await EjecutarVariosQuerys(querys);

    if (results.ok === null) throw results.result;

    if (results.ok === false) throw results.errors;

    const carga = results.result[0].data?.[0];
    console.log();
    if (!carga) {
      respResultadoIncorrectoObjeto200(
        res,
        null,
        [],
        `No existe ningún registro con el ID: ${id_carga_archivos}`
      );
      return;
    }

    if (carga.cargado === true && carga.reproceso === false) {
      respResultadoIncorrectoObjeto200(
        res,
        null,
        [],
        "La Validación Preliminar fue exitosa"
      );
      return;
    } else if (carga.cargado === false && carga.reproceso === true) {
      respResultadoIncorrectoObjeto200(
        res,
        null,
        [
          {
            id: carga.id_carga_archivos,
            cod_institucion: carga.cod_institucion,
            descripcion: "Hubo Autorización de Reproceso",
            fecha_carga: carga.fecha_carga,
          },
        ],
        `Hubo Autorización de Reproceso ${dayjs(carga.fecha_carga)
          .locale("es")
          .format("[el día] DD [de] MMMM [de] YYYY [a las] HH:mm")}`
      );
      return;
    }

    const erroresDeCarga = results.result[1].data;
    if (size(erroresDeCarga) > 0)
      respResultadoCorrectoObjeto200(res, erroresDeCarga);
    else
      respResultadoIncorrectoObjeto200(
        res,
        null,
        erroresDeCarga,
        "No existe información disponible de los errores"
      );
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function Reporte(req, res) {
  function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(date) {
    if (dayjs(date).isValid()) {
      return (
        [
          date.getFullYear(),
          padTo2Digits(date.getMonth() + 1),
          padTo2Digits(date.getDate()),
        ].join("-") +
        " " +
        [padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes())].join(
          ":"
        )
      );
    }
    return null;
  }
  const { fecha, periodo, resultado } = req.body;
  const resultadoFinal =
    resultado === "Con Éxito" || resultado === "Con Error" ? resultado : null;

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
      where:
        resultadoFinal !== null
          ? [
              {
                key: "resultado",
                value: resultadoFinal,
              },
              {
                key: "id_rol",
                value: req.user.id_rol,
              },
            ]
          : [
              {
                key: "id_rol",
                value: req.user.id_rol,
              },
            ],
    };
    const query = EjecutarFuncionSQL(
      "aps_reporte_validacion_preliminar",
      params
    );

    pool
      .query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          const resultFinal = [];
          forEach(result.rows, (item, index) => {
            resultFinal.push({
              ...item,
              fecha_carga: formatDate(new Date(item.fecha_carga)),
            });
          });
          respResultadoCorrectoObjeto200(res, resultFinal);
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
  const { email, subject, description, id_rol } = req.body;
  const idRolFinal = id_rol ? id_rol : req.user.id_rol;
  const resultArray = [];
  const errorsArray = [];
  try {
    const users = await ObtenerUsuariosPorRol({ id_rol: idRolFinal });
    if (users.err) {
      errorsArray.push({
        message: users?.err?.message && users?.err.message,
        err: users?.err,
      });
    }
    const usersFinal = users.result;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "contactojosegutierrez10@gmail.com",
        // user: "admin-jose-aps",
        pass: "svslrhedrsdtwlar",
      },
    });
    function validateEmail(email) {
      const res =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return res.test(String(email).toLowerCase());
    }

    if (size(usersFinal) > 0) {
      for await (const item of usersFinal) {
        const emailFinal = email ? email : item.email;
        // const emailFinal = "milibrolunadepluton344@gmail.com";

        if (!validateEmail(emailFinal)) {
          errorsArray.push({ message: "Email no válido", emailFinal });
        } else {
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
              console.log(result);
              resultArray.push(result);
            })
            .catch((err) => {
              errorsArray.push({ message: err?.message && err.message, err });
            });
        }
      }
    }

    if (errorsArray.length > 0) {
      respErrorServidor500END(res, errorsArray);
    }
    respResultadoCorrectoObjeto200(
      res,
      resultArray,
      `Correos enviados correctamente`
    );
  } catch (err) {
    respErrorServidor500END(res, err);
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
  EnviarCorreo,
  EscogerValidacionPreliminar,
};
