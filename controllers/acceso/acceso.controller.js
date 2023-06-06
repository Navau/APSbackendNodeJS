const jwt = require("../../services/jwt.service");
const moment = require("moment");
const pool = require("../../database");
const format = require("pg-format");
const yup = require("yup");
const { setLocale } = require("yup");

setLocale({
  mixed: {
    required: "El campo ${path} es requerido",
  },
  string: {
    max: "El campo ${path} no puede tener más de ${max} caracteres",
  },
});

const {
  estadoJWT,
  obtenerToken,
  obtenerInfoUsuario,
} = require("../../api/autenticacion.api");
const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoVacio404END,
  respLoginResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respDemasiadasSolicitudes429,
  respResultadoDinamicoEND,
} = require("../../utils/respuesta.utils");

const {
  ListarUtil,
  EjecutarVariosQuerys,
  EscogerInternoUtil,
  InsertarVariosUtil,
  InsertarUtil,
  ActualizarUtil,
  EliminarUtil,
  formatearQuery,
  EjecutarQuery,
} = require("../../utils/consulta.utils");
const { APP_GUID, MAX_INTENTOS_LOGIN } = require("../../config");
const {
  size,
  forEach,
  find,
  map,
  difference,
  differenceBy,
  maxBy,
  isUndefined,
} = require("lodash");

function willExpiredToken(token) {
  const { exp } = jwt.decodedToken(token);

  const currentDate = moment().unix();

  if (currentDate > exp) {
    //VERIFICACION SI CADUCO EL TOKEN TRUE = CADUCADO, FALSE = NO CADUCADO
    return true;
  }
  return false;
}

function refreshAccessToken(req, res) {
  //FUNCTION QUE SE ENCARGA DE REFRESCAR EL ACCESS TOKEN
  const { refreshToken } = req.body;

  const isTokenExpired = willExpiredToken(refreshToken); //VERIFICAMOS EL REFRESH ACCESS TOKEN

  if (isTokenExpired) {
    res.status(404).send({
      resultado: 0,
      datos: null,
      mensaje: "El Refresh Token ha expirado",
    });
  } else {
    const { id_usuario } = jwt.decodedToken(refreshToken);

    pool.query(
      `SELECT * 
    FROM public."APS_seg_usuario" 
    WHERE activo = true AND id_usuario = ${id_usuario}`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send({
            resultado: 0,
            datos: null,
            mensaje: "Error del Servidor",
            err,
          });
        } else {
          if (!userStored) {
            res.status(404).send({
              resultado: 0,
              datos: null,
              mensaje: "Usuario no encontrado",
            });
          } else {
            res.status(200).send({
              resultado: 1,
              datos: {
                accessToken: jwt.createAccessToken(result),
                refreshToken: refreshToken,
              },
              mensaje: "",
            });
          }
        }
      }
    );
  }
}

async function Login(req, res) {
  try {
    const body = req.body;
    const user = body.usuario?.toLowerCase();
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    const password = body.password;

    const userInputSchema = yup.object().shape({
      usuario: yup.string().max(50).required(),
      contraseña: yup.string().max(80).required(),
    });
    const userInput = {
      usuario: user,
      contraseña: password,
    };
    const resultInput = await userInputSchema
      .validate(userInput)
      .then((validUserInput) => {
        return { ok: true, result: validUserInput };
      })
      .catch((err) => {
        return { ok: false, err };
      });
    if (resultInput.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], resultInput.err.message);
      return;
    }

    const auxVerifica = await verificaCuentaBloqueada(res, user);
    if (auxVerifica.ok === false) {
      auxVerifica.resp();
      return;
    }

    const values = [user, password];
    const queryUsuario = formatearQuery(
      'SELECT * FROM public."APS_seg_usuario" WHERE usuario = %L AND password is NOT NULL AND password = crypt(%L, password);',
      values
    );

    await pool
      .query(queryUsuario)
      .then(async (result) => {
        if (result.rowCount > 0) {
          await reiniciarIntentosFallidos(result.rows[0].id_usuario);
          const valuesRol = [result.rows[0].id_usuario, true];
          const queryRol = formatearQuery(
            `SELECT id_rol FROM public."APS_seg_usuario_rol" WHERE id_usuario = %L and activo = %L;`,
            valuesRol
          );

          await pool
            .query(queryRol)
            .then(async (result2) => {
              if (result2.rowCount > 0) {
                const resultFinal = {
                  id_usuario: result.rows[0].id_usuario,
                  id_rol: result2.rows[0].id_rol,
                };
                if (result2.rowCount >= 2) {
                  respLoginResultadoCorrectoObjeto200(
                    res,
                    jwt.createAccessTokenWithRol(resultFinal),
                    { rol: result2.rows, usuario: result.rows },
                    "Usuario correcto. (Mas de 1 Rol)"
                  );
                } else if (result2.rowCount === 1) {
                  respLoginResultadoCorrectoObjeto200(
                    res,
                    jwt.createAccessTokenWithRol(resultFinal),
                    { rol: result2.rows, usuario: result.rows },
                    "Usuario correcto. (Solo 1 Rol)"
                  );
                } else {
                  respErrorServidor500END(
                    res,
                    "Hubo un error al crear el token de autenticación"
                  );
                }
              } else {
                respResultadoVacio404END(
                  res,
                  "Este usuario no cuenta con un Rol"
                );
              }
            })
            .catch((err) => {
              respErrorServidor500END(res, err);
            });
        } else {
          const aux = await numeroDeIntentos(res, user, password, ip);
          if (aux.ok === false) {
            aux.resp();
            return;
          }
          respResultadoVacio404END(res, "Usuario y/o Contraseña incorrecto");
        }
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

function TokenConRol(req, res) {
  const body = req.body;
  const { id_rol } = body;
  const { id_usuario } = jwt.decodedToken(req.headers.authorization);

  if (!id_usuario || !id_rol) {
    respResultadoVacio404END(res, "No se recibió la información suficiente");
  } else {
    const user = {
      id_usuario,
      id_rol,
    };
    respResultadoCorrectoObjeto200(
      res,
      jwt.createAccessTokenWithRol(user),
      "Token con Rol creado correctamente"
    );
  }
}

const numeroDeIntentos = async (res, user, pass, ip) => {
  try {
    //#region CONSULTAS
    const queryUsuario = EscogerInternoUtil("APS_seg_usuario", {
      select: ["*"],
      where: [
        { key: "usuario", value: user },
        { key: "activo", value: true },
      ],
    });
    const usuario = (await EjecutarQuery(queryUsuario))?.[0] || undefined;

    if (isUndefined(usuario))
      return {
        ok: false,
        resp: () =>
          respResultadoVacio404END(res, "Usuario y/o Contraseña incorrecto"),
      };

    const intentosActuales = await EjecutarQuery(
      EscogerInternoUtil("APS_seg_intentos_log", {
        select: ["*"],
        where: [
          { key: "id_usuario", value: usuario.id_usuario },
          { key: "activo", value: true },
        ],
      })
    );
    //#endregion
    //#region OBTENIENDO EL ULTIMO INTENTO, UTILIZANDO EL MAXIMO
    const maxIntentoAux = maxBy(intentosActuales, (item) => item.num_intento);
    const maxIntento = isUndefined(maxIntentoAux)
      ? 0
      : maxIntentoAux.num_intento;
    //#endregion
    //#region INSERTANDO INTENTO EN APS_seg_intentos_log
    let ultimoIntentoInsertado;
    if (maxIntento < MAX_INTENTOS_LOGIN) {
      const queryInsert = InsertarUtil("APS_seg_intentos_log", {
        body: {
          id_usuario: usuario.id_usuario || -1,
          usuario: user,
          password: pass,
          ip,
          num_intento: maxIntento + 1,
        },
        returnValue: "*",
      });

      ultimoIntentoInsertado = await EjecutarQuery(queryInsert);
    } else ultimoIntentoInsertado = [{ num_intento: maxIntento }];
    //#endregion

    if (ultimoIntentoInsertado[0].num_intento >= MAX_INTENTOS_LOGIN) {
      await ActualizarUsuarioBloqueado(true, usuario.id_usuario);

      return {
        ok: false,
        resp: () =>
          respDemasiadasSolicitudes429(
            res,
            "Usuario Bloqueado, contáctese con el Administrador del Sistema"
          ),
      };
    }
    return { ok: true, result: ultimoIntentoInsertado };
  } catch (err) {
    throw err;
  }
};

const verificaCuentaBloqueada = async (res, usuario) => {
  try {
    //#region CONSULTAS
    const queryUsuario = EscogerInternoUtil("APS_seg_usuario", {
      select: ["*"],
      where: [
        { key: "usuario", value: usuario },
        { key: "activo", value: true },
      ],
    });
    const usuarioInfo = (await EjecutarQuery(queryUsuario))?.[0] || undefined;

    if (isUndefined(usuarioInfo))
      return {
        ok: false,
        resp: () =>
          respResultadoVacio404END(res, "Usuario y/o Contraseña incorrecto"),
      };

    let intentosInfo = [];
    if (usuarioInfo.id_usuario) {
      intentosInfo = await EjecutarQuery(
        EscogerInternoUtil("APS_seg_intentos_log", {
          select: ["*"],
          where: [
            { key: "id_usuario", value: usuarioInfo.id_usuario },
            { key: "activo", value: true },
          ],
        })
      );
    }
    //#endregion

    //#region VERIRIFICACION DE INTENTOS LOG, ESTO ES POR SI EN USUARIOS ESTA EN TRUE, PERO TIENE LOS INTENTOS EN MAS DE 5 (MAX_INTENTOS_LOGIN) EN LA TABLA DE APS_INTENTOS_LOG
    if (size(intentosInfo) > 0) {
      const maxIntentoAux = maxBy(intentosInfo, "num_intento");
      const maxIntentoFinal = isUndefined(maxIntentoAux)
        ? 0
        : maxIntentoAux.num_intento;
      if (maxIntentoFinal >= MAX_INTENTOS_LOGIN) {
        if (usuarioInfo.bloqueado === false) {
          await ActualizarUsuarioBloqueado(true, usuarioInfo.id_usuario);
        }
        return {
          ok: false,
          resp: () =>
            respDemasiadasSolicitudes429(
              res,
              "Usuario Bloqueado, contáctese con el Administrador del Sistema"
            ),
        };
      }
    }
    //#endregion

    return {
      ok: usuarioInfo.bloqueado === true ? false : true,
      resp: () =>
        respDemasiadasSolicitudes429(
          res,
          "Usuario Bloqueado, contáctese con el Administrador del Sistema"
        ),
    };
  } catch (err) {
    throw err;
  }
};

const reiniciarIntentosFallidos = async (id_usuario) => {
  try {
    const queryReinicio = ActualizarUtil("APS_seg_intentos_log", {
      body: { activo: false },
      idKey: "id_usuario",
      idValue: id_usuario,
      returnValue: ["*"],
    });
    await EjecutarQuery(queryReinicio);
    await ActualizarUsuarioBloqueado(false, id_usuario);
  } catch (err) {
    throw err;
  }
};

const ActualizarUsuarioBloqueado = async (bloqueado, id_usuario) => {
  try {
    const queryBloqueaUsuario = ActualizarUtil("APS_seg_usuario", {
      body: { bloqueado },
      idKey: "id_usuario",
      idValue: id_usuario,
      returnValue: ["*"],
    });
    await EjecutarQuery(queryBloqueaUsuario);
  } catch (err) {
    throw err;
  }
};

async function LoginApiExterna(req, res) {
  try {
    const body = req.body;
    const user = body.usuario;
    const password = body.password;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    const userInputSchema = yup.object().shape({
      usuario: yup.string().max(50).required(),
      contraseña: yup.string().max(80).required(),
    });
    const userInput = {
      usuario: user,
      contraseña: password,
    };
    const resultInput = await userInputSchema
      .validate(userInput)
      .then((validUserInput) => {
        return { ok: true, result: validUserInput };
      })
      .catch((err) => {
        return { ok: false, err };
      });
    if (resultInput.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], resultInput.err.message);
      return;
    }

    const auxVerifica = await verificaCuentaBloqueada(res, user);
    if (auxVerifica.ok === false) {
      auxVerifica.resp();
      return;
    }

    const estado = await estadoJWT(); //VERIFICAR ESTADO DE SERVICIO
    const data = { usuario: user, password, app: APP_GUID };
    const tokenInfo = await obtenerToken(res, data, numeroDeIntentos, ip); //OBTENER TOKEN
    if (tokenInfo === null) return;
    const token = {
      token_value: tokenInfo?.access_token,
      token_type: tokenInfo?.token_type,
    };
    const usuarioActual = await obtenerInfoUsuario(token, data); // OBTIENE INFO DE USUARIO
    const rolesUsuarioActual = usuarioActual.roles; //ROLES DEL USUARIO ACTUAL
    const whereInAux = map(rolesUsuarioActual, (item) => item.nombre); // VARIABLE AUXILIAR QUE ES UN ARRAY DE NOMBRES DE LOS ROLES DEL USUARIO ACTUAL
    const results = await EjecutarVariosQuerys([
      EscogerInternoUtil("APS_seg_usuario", {
        select: ["*"],
        where: [{ key: "usuario", value: usuarioActual.nombreUsuario }],
      }),
      EscogerInternoUtil("APS_seg_rol", {
        select: ["*"],
        where: [{ key: "codigo", valuesWhereIn: whereInAux, whereIn: true }],
      }),
      EscogerInternoUtil("APS_seg_rol", {
        select: [
          `"APS_seg_rol".id_rol`,
          `"APS_seg_usuario".id_usuario`,
          `"APS_seg_institucion".id_institucion`,
          `"APS_seg_usuario".usuario`,
          `"APS_seg_institucion".codigo AS codigo_institucion`,
          `"APS_seg_rol".rol`,
          `"APS_seg_rol".codigo AS codigo_rol`,
          `"APS_seg_rol".activo AS activo_rol`,
        ],
        innerjoin: [
          {
            table: "APS_seg_usuario_rol",
            on: [
              { table: "APS_seg_usuario_rol", key: "id_rol" },
              { table: "APS_seg_rol", key: "id_rol" },
            ],
          },
          {
            table: "APS_seg_usuario",
            on: [
              { table: "APS_seg_usuario_rol", key: "id_usuario" },
              { table: "APS_seg_usuario", key: "id_usuario" },
            ],
          },
          {
            table: "APS_seg_institucion",
            on: [
              { table: "APS_seg_usuario", key: "id_institucion" },
              { table: "APS_seg_institucion", key: "id_institucion" },
            ],
          },
        ],
        where: [
          {
            key: `"APS_seg_rol".codigo`,
            valuesWhereIn: whereInAux,
            whereIn: true,
          },
          {
            key: `"APS_seg_usuario".usuario`,
            value: usuarioActual.nombreUsuario,
          },
          {
            key: `"APS_seg_rol".activo`,
            value: true,
          },
        ],
      }),
    ]); //QUERYS QUE SE EJECUTAN

    if (results.ok === null) throw results.result;
    if (results.ok === false) throw results.errors;

    const usuariosExistentes = results.result[0].data; //SON LOS USUARIOS DE LA TABLA APS_SEG_USUARIO QUE EXISTEN EN LA BASE DE DATOS
    if (size(usuariosExistentes) <= 0) {
      respResultadoVacio404END(res, "Usuario y/o Contraseña incorrecto");
      return;
    }
    if (size(usuariosExistentes) > 1) {
      respResultadoVacio404END(
        res,
        "Existen varios usuarios con este nombre de usuario, contáctese con el Administrador del Sistema"
      );
      return;
    }
    const infoUsuario = usuariosExistentes[0];
    const rolesExistentes = results.result[1].data; //SON LOS ROLES DE LA TABLA ASP_SEG_ROL QUE EXISTEN EN LA BASE DE DATOS, TAMBIEN ESTAN ENLAZADOS A LOS ROLES QUE LLEGAN DE LA API EXTERNA
    const rolesActualesDelUsuario = results.result[2].data; //SON LOS REGISTROS DE LA CONSULTA COMPLEJA, QUE SACA LOS ROLES DEL USUARIO QUE EXISTE EN LA BASE DE DATOS, ESTO CON EL FIN DE REGISTRAR LOS ROLES QUE NO TENGA EN LA BASE DE DATOS

    if (size(rolesExistentes) <= 0) {
      respResultadoVacio404END(
        res,
        "No existen roles disponibles para este usuario"
      );
      return;
    } // VALIDA LOS ROLES DE LA APS EXTERNA Y LA BASE DE DATOS
    // if (size(rolesActualesDelUsuario) <= 0) {
    //   respResultadoVacio404END(
    //     res,
    //     "No existen roles asignados para este usuario"
    //   );
    //   return;
    // }

    const diferenciasRolesAux = differenceBy(
      rolesExistentes,
      rolesActualesDelUsuario,
      "id_rol"
    ); // VARIABLE QUE CONTIENE LA DIFERENCIA ENTRE rolesExistentes Y rolesActualesDelUsuario
    const dataQuery = map(diferenciasRolesAux, (item) => {
      return { id_rol: item.id_rol, id_usuario: infoUsuario.id_usuario };
    }); //PREPARACIÓN DE DATOS PARA REGISTRAR LOS ROLES DE LA API EXTERNA EN LA BASE DE DATOS
    if (size(dataQuery) > 0) {
      //EJECUCION DE REGISTRAR ROLES EN APS_SEG_USUARIO_ROL
      const rolesInsertados = await EjecutarQuery(
        InsertarVariosUtil("APS_seg_usuario_rol", {
          body: dataQuery,
          returnValue: ["*"],
        })
      );
      console.log({ rolesInsertados });
    }
    //LOGIN
    const values = [user, password];
    const queryUsuario = formatearQuery(
      'SELECT * FROM public."APS_seg_usuario" WHERE usuario = %L AND password is NOT NULL AND password = crypt(%L, password);',
      values
    );
    await pool
      .query(queryUsuario)
      .then(async (result) => {
        if (result.rowCount > 0) {
          await reiniciarIntentosFallidos(result.rows[0].id_usuario);
          const valuesRol = [result.rows[0].id_usuario, true];
          const queryRol = formatearQuery(
            `SELECT id_rol FROM public."APS_seg_usuario_rol" WHERE id_usuario = %L and activo = %L;`,
            valuesRol
          );

          await pool
            .query(queryRol)
            .then((result2) => {
              if (result2.rowCount > 0) {
                const resultFinal = {
                  id_usuario: result.rows[0].id_usuario,
                  id_rol: result2.rows[0].id_rol,
                };
                if (result2.rowCount >= 2) {
                  respLoginResultadoCorrectoObjeto200(
                    res,
                    jwt.createAccessTokenWithRol(resultFinal),
                    { rol: result2.rows, usuario: result.rows },
                    "Usuario correcto. (Mas de 1 Rol)"
                  );
                } else if (result2.rowCount === 1) {
                  respLoginResultadoCorrectoObjeto200(
                    res,
                    jwt.createAccessTokenWithRol(resultFinal),
                    { rol: result2.rows, usuario: result.rows },
                    "Usuario correcto. (Solo 1 Rol)"
                  );
                } else {
                  respErrorServidor500END(
                    res,
                    "Hubo un error al crear el token de autenticación"
                  );
                }
              } else
                respResultadoVacio404END(
                  res,
                  "Este usuario no cuenta con un Rol"
                );
            })
            .catch((err) => {
              respErrorServidor500END(res, err);
            });
        } else {
          const aux = await numeroDeIntentos(res, user, password, ip);
          if (aux.ok === false) {
            aux.resp();
            return;
          }
          respResultadoVacio404END(res, "Usuario y/o Contraseña incorrecto");
        }
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  refreshAccessToken,
  Login,
  LoginApiExterna,
  TokenConRol,
};
