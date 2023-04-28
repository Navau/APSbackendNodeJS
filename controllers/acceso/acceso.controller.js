const jwt = require("../../services/jwt.services");
const moment = require("moment");
const pool = require("../../database");
const format = require("pg-format");
const validator = require("validator");
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
} = require("../../utils/consulta.utils");
const { APP_GUID } = require("../../config");
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
    if (auxVerifica.ok === null) throw auxVerifica.err;
    if (auxVerifica.ok === false) {
      auxVerifica.resp();
      return;
    }

    const values = [user, password];
    const queryUsuario = format(
      'SELECT * FROM public."APS_seg_usuario" WHERE usuario = %L AND password is NOT NULL AND password = crypt(%L, password);',
      ...values
    );

    console.log(queryUsuario);
    await pool
      .query(queryUsuario)
      .then(async (result) => {
        if (result.rowCount > 0) {
          await reiniciarIntentosFallidos(result.rows[0].id_usuario);
          const valuesRol = [result.rows[0].id_usuario, true];
          const queryRol = format(
            `SELECT id_rol FROM public."APS_seg_usuario_rol" WHERE id_usuario = %L and activo = %L;`,
            ...valuesRol
          );
          console.log(queryRol);

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
                // const aux = await numeroDeIntentos(res, user, ip);
                // if (aux.ok === null) throw aux.err;
                // if (aux.ok === false) {
                //   aux.resp();
                //   return;
                // }
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
          if (aux.ok === null) throw aux.err;
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
    const usuario = await pool
      .query(
        EscogerInternoUtil("APS_seg_usuario", {
          select: ["*"],
          where: [
            { key: "usuario", value: user },
            { key: "activo", value: true },
          ],
        })
      )
      .then((result) => {
        if (result.rowCount === 1) return { ok: true, result: result.rows[0] };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (usuario.ok === null) return usuario;
    if (usuario.ok === false)
      return {
        ok: false,
        resp: () => respResultadoVacio404END(res, "El usuario no existe"),
      };

    const intentosActuales = await pool
      .query(
        EscogerInternoUtil("APS_seg_intentos_log", {
          select: ["*"],
          where: [
            { key: "id_usuario", value: usuario.result?.id_usuario },
            { key: "activo", value: true },
          ],
        })
      )
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (intentosActuales.ok === null) return intentosActuales;
    //#endregion
    //#region OBTENIENDO EL ULTIMO INTENTO, UTILIZANDO EL MAXIMO
    const maxIntentoAux = maxBy(
      intentosActuales.result,
      (item) => item.num_intento
    );
    const maxIntento = isUndefined(maxIntentoAux)
      ? 0
      : maxIntentoAux.num_intento;
    //#endregion
    //#region INSERTANDO INTENTO EN APS_seg_intentos_log
    let ultimoIntentoInsertado;
    if (maxIntento < 3) {
      const queryInsert = InsertarUtil("APS_seg_intentos_log", {
        body: {
          id_usuario: usuario.result?.id_usuario || -1,
          usuario: user,
          password: pass,
          ip,
          num_intento: maxIntento + 1,
        },
        returnValue: "*",
      });

      ultimoIntentoInsertado = await pool
        .query(queryInsert)
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          return { ok: null, err };
        });
      if (ultimoIntentoInsertado.ok === null) return ultimoIntentoInsertado;
    } else ultimoIntentoInsertado = { result: [{ num_intento: maxIntento }] };
    //#endregion

    if (ultimoIntentoInsertado.result[0].num_intento >= 3) {
      await ActualizarUsuarioBloqueado(true, usuario.result?.id_usuario);

      return {
        ok: false,
        resp: () =>
          respDemasiadasSolicitudes429(
            res,
            "Usuario Bloqueado, contáctese con el Administrador del Sistema"
          ),
      };
    }
    return { ok: true, result: ultimoIntentoInsertado.result };
  } catch (err) {
    return { ok: null, err };
  }
};

const verificaCuentaBloqueada = async (res, usuario) => {
  try {
    //#region CONSULTAS
    const usuarioInfo = await pool
      .query(
        EscogerInternoUtil("APS_seg_usuario", {
          select: ["*"],
          where: [
            { key: "usuario", value: usuario },
            { key: "activo", value: true },
          ],
        })
      )
      .then((result) => {
        return { ok: true, result: result.rows?.[0] || {} };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (usuarioInfo.ok === null) return usuarioInfo;
    let intentosInfo = { ok: false, result: [] };
    if (usuarioInfo.result?.id_usuario) {
      intentosInfo = await pool
        .query(
          EscogerInternoUtil("APS_seg_intentos_log", {
            select: ["*"],
            where: [
              { key: "id_usuario", value: usuarioInfo.result?.id_usuario },
              { key: "activo", value: true },
            ],
          })
        )
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          return { ok: null, err };
        });

      if (usuarioInfo.ok === null) return usuarioInfo;
    }
    //#endregion

    //#region VERIRIFICACION DE INTENTOS LOG, ESTO ES POR SI EN USUARIOS ESTA EN TRUE, PERO TIENE LOS INTENTOS EN MAS DE 3 EN LA TABLA DE APS_INTENTOS_LOG
    if (size(intentosInfo.result) > 0) {
      const maxIntentoAux = maxBy(intentosInfo.result, "num_intento");
      const maxIntentoFinal = isUndefined(maxIntentoAux)
        ? 0
        : maxIntentoAux.num_intento;
      if (maxIntentoFinal >= 3) {
        if (usuarioInfo.result.bloqueado === false) {
          await ActualizarUsuarioBloqueado(true, usuarioInfo.result.id_usuario);
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
      ok: usuarioInfo.result.bloqueado === true ? false : true,
      resp: () =>
        respDemasiadasSolicitudes429(
          res,
          "Usuario Bloqueado, contáctese con el Administrador del Sistema"
        ),
    };
  } catch (err) {
    return { ok: null, err };
  }
};

const reiniciarIntentosFallidos = async (id_usuario) => {
  try {
    const queryReinicio = EliminarUtil("APS_seg_intentos_log", {
      where: {
        id_usuario: id_usuario,
      },
    });
    await pool
      .query(queryReinicio)
      .then(async (result) => {
        await ActualizarUsuarioBloqueado(false, id_usuario);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    return { ok: null, err };
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
    const usuarioBloqueado = await pool
      .query(queryBloqueaUsuario)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (usuarioBloqueado.ok === null) throw usuarioBloqueado.err;
  } catch (err) {
    return { ok: null, err };
  }
};

async function LoginApiExterna(req, res) {
  try {
    const body = req.body;
    const user = body.usuario;
    const password = body.password;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    //#region NUMERO DE INTENTOS
    const intento = async () => {
      const aux = await numeroDeIntentos(res, user, ip);
      if (aux.ok === null) throw aux.err;
      if (aux.ok === false) {
        aux.resp();
      }
    };
    //#endregion
    const estado = estadoJWT(res); //VERIFICAR ESTADO DE SERVICIO
    if (estado === null) {
      return;
    }
    const data = {
      usuario: user,
      password,
      app: APP_GUID,
    };
    const tokenInfo = await obtenerToken(data, res); //OBTENER TOKEN
    if (tokenInfo === null) {
      return;
    }
    const token = {
      token_value: tokenInfo?.access_token,
      token_type: tokenInfo?.token_type,
    };
    const usuarioActual = await obtenerInfoUsuario(token, data, res); // OBTIENE INFO DE USUARIO
    if (usuarioActual === null) return;
    const rolesUsuarioActual = usuarioActual.roles; //ROLES DEL USUARIO ACTUAL
    const whereInAux = map(rolesUsuarioActual, (item) => `'${item.nombre}'`); // VARIABLE AUXILIAR QUE ES UN ARRAY DE NOMBRES DE LOS ROLES DEL USUARIO ACTUAL
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
      respResultadoVacio404END(res, "El usuario no existe");
      return;
    }
    if (size(usuariosExistentes) > 1) {
      respResultadoVacio404END(
        res,
        "Existen varios usuarios con este nombre de usuario, comuniquese con el administrador"
      );
      return;
    }
    const infoUsuario = usuariosExistentes[0];
    const rolesExistentes = results.result[1].data; //SON LOS ROLES DE LA TABLA ASP_SEG_ROL QUE EXISTEN EN LA BASE DE DATOS
    const rolesActualesDelUsuario = results.result[2].data; //SON LOS REGISTROS DE LA CONSULTA COMPLEJA, QUE SACA LOS ROLES DEL USUARIO QUE EXISTE EN LA BASE DE DATOS, ESTO CON EL FIN DE REGISTRAR LOS ROLES QUE NO TENGA EN LA BASE DE DATOS

    if (size(rolesExistentes) <= 0) {
      respResultadoVacio404END(
        res,
        "No existen roles disponibles para este usuario"
      );
      return;
    }
    if (size(rolesActualesDelUsuario) <= 0) {
      respResultadoVacio404END(
        res,
        "No existen roles asignados para este usuario"
      );
      return;
    }

    const diferenciasRolesAux = differenceBy(
      rolesExistentes,
      rolesActualesDelUsuario,
      "id_rol"
    ); // VARIABLE QUE CONTIENE LA DIFERENCIA ENTRE rolesExistentes Y rolesActualesDelUsuario
    const dataQuery = map(diferenciasRolesAux, (item) => {
      return { id_rol: item.id_rol, id_usuario: infoUsuario.id_usuario };
    }); //PREPARACIÓN DE DATOS PARA REGISTRAR LOS ROLES
    if (size(dataQuery) > 0) {
      //EJECUCION DE REGISTRAR ROLES EN APS_SEG_USUARIO_ROL
      await pool
        .query(
          InsertarVariosUtil("APS_seg_usuario_rol", {
            body: dataQuery,
            returnValue: ["*"],
          })
        )
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          throw err;
        });
    }
    //LOGIN
    const values = [user, password];
    const queryUsuario = format(
      'SELECT * FROM public."APS_seg_usuario" WHERE usuario = %L AND password is NOT NULL AND password = crypt(%L, password);',
      ...values
    );
    console.log(queryUsuario);
    await pool
      .query(queryUsuario)
      .then(async (result) => {
        if (result.rowCount > 0) {
          const valuesRol = [result.rows[0].id_usuario, true];
          const queryRol = format(
            `SELECT id_rol FROM public."APS_seg_usuario_rol" WHERE id_usuario = %L and activo = %L;`,
            ...valuesRol
          );
          console.log(queryRol);

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
        } else
          respResultadoVacio404END(res, "Usuario y/o Contraseña incorrecto");
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
