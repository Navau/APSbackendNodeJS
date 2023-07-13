const jwt = require("../../services/jwt.service");
const pool = require("../../database");
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
  estadoJWTAPS,
  obtenerTokenAPS,
  obtenerInfoUsuarioAPS,
} = require("../../api/autenticacion.api");
const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoVacio404END,
  respLoginResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respResultadoDinamicoEND,
} = require("../../utils/respuesta.utils");

const {
  EscogerInternoUtil,
  InsertarVariosUtil,
  InsertarUtil,
  ActualizarUtil,
  formatearQuery,
  EjecutarQuery,
} = require("../../utils/consulta.utils");
const { APP_GUID, MAX_INTENTOS_LOGIN } = require("../../config");
const { size, map, differenceBy, maxBy, isUndefined } = require("lodash");

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

async function LoginApiExterna(req, res) {
  try {
    const { usuario, password } = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    await validarLoginConYup(req.body);
    const usuarioObtenido = await obtenerUsuario(usuario); //VERIFICA SI EL USUARIO EXISTE EN EL SISTEMA
    if (isUndefined(usuarioObtenido)) {
      await loginConAPS(res, usuario, password, ip);
    } else {
      await loginNormal(res, usuario, password, ip, usuarioObtenido);
    }
  } catch (err) {
    if (!isUndefined(err?.code))
      respResultadoDinamicoEND(
        res,
        err.code,
        0,
        err?.data || null,
        err?.message
      );
    else respErrorServidor500END(res, err);
  }
}

async function loginConAPS(res, usuario, password, ip) {
  try {
    const usuarioAPS = await verificarUsuarioAPS(usuario, password);
    const usuarioInsertado = await insertarUsuarioAPSaSistema(
      usuarioAPS,
      password
    );
    await registrarRolesDeUsuarioAPS(usuarioAPS, usuarioInsertado);

    await verificaCuentaBloqueada(usuarioInsertado);
    await logearUsuario(res, usuario, password, ip);
  } catch (err) {
    throw err;
  }
}

async function loginNormal(res, usuario, password, ip, usuarioObtenido) {
  try {
    await verificaCuentaBloqueada(usuarioObtenido);
    await logearUsuario(res, usuario, password, ip, usuarioObtenido);
  } catch (err) {
    throw err;
  }
}

const validarLoginConYup = async (data) => {
  try {
    // TODO: Validar con las columnas de la tabla Usuario, podria ser crear un modulo de creación de validaciones Yup dinamicas en otro archivo
    const { usuario, password } = data;
    const userInputSchema = yup.object().shape({
      usuario: yup.string().max(50).required(),
      contraseña: yup.string().max(80).required(),
    });
    const userInput = {
      usuario,
      contraseña: password,
    };
    await userInputSchema.validate(userInput).catch((err) => {
      throw {
        code: 400,
        message: err.message,
      };
    });
  } catch (err) {
    throw err;
  }
};

const obtenerUsuario = async (usuario) => {
  try {
    const queryUsuario = EscogerInternoUtil("APS_seg_usuario", {
      where: [{ key: "usuario", value: usuario }],
    });
    const usuarioObtenido = await EjecutarQuery(queryUsuario);
    if (size(usuarioObtenido) > 1)
      throw {
        code: 409,
        message:
          "Existen varios usuarios con este nombre de usuario, contáctese con el Administrador del Sistema",
      };
    return usuarioObtenido?.[0] || undefined;
  } catch (err) {
    throw err;
  }
};

const verificarUsuarioAPS = async (usuario, password) => {
  try {
    const estado = await estadoJWTAPS(); //VERIFICAR ESTADO DE SERVICIO
    const payload = { usuario, password, app: APP_GUID };
    const tokenInfo = await obtenerTokenAPS(payload); //OBTENER TOKEN
    const token = {
      token_value: tokenInfo?.access_token,
      token_type: tokenInfo?.token_type,
    };
    const usuarioAPS = await obtenerInfoUsuarioAPS(token, payload); // OBTIENE INFO DE USUARIO

    return usuarioAPS;
  } catch (err) {
    throw err;
  }
};

const logearUsuario = async (res, usuario, password, ip, usuarioObtenido) => {
  try {
    //#region PREPARANDO QUERY DE LOGEO
    const values = [usuario, password];
    const queryUsuario = formatearQuery(
      'SELECT * FROM public."APS_seg_usuario" WHERE usuario = %L AND password is NOT NULL AND password = crypt(%L, password);',
      values
    );

    const usuarioLogeado =
      (await EjecutarQuery(queryUsuario))?.[0] || undefined;

    //SI EL USUARIO NO EXISTE
    if (isUndefined(usuarioLogeado)) {
      await insertarIntentoFallido(usuarioObtenido, password, ip);
      throw {
        code: 404,
        message: "Usuario y/o Contraseña incorrecto",
      };
    }
    //#endregion

    //#region Esto se realiza porque anteriormente a esto ya se habia hecho en el LoginNormal el verificaCuentaBloqueada
    await reiniciarIntentosFallidos(usuarioLogeado.id_usuario);
    //#endregion

    //#region Obteniendo los Roles del usuario por el id del usuario
    const valuesRoles = [usuarioLogeado.id_usuario, true];
    const queryRoles = formatearQuery(
      `SELECT id_rol FROM public."APS_seg_usuario_rol" WHERE id_usuario = %L and activo = %L;`,
      valuesRoles
    );
    const rolesUsuarioLogeado = await EjecutarQuery(queryRoles);
    if (size(rolesUsuarioLogeado) <= 0) {
      throw {
        code: 404,
        message: "Este usuario no cuenta con un Rol",
      };
    }
    //#endregion

    //#region Creando el Token y dando respuesta
    const messageFinal = `Usuario correcto. ${
      size(rolesUsuarioLogeado) > 0 ? "(Mas de 1 Rol)" : "(Solo 1 Rol)"
    }`;
    const resultFinal = {
      id_usuario: usuarioLogeado.id_usuario,
      id_rol: rolesUsuarioLogeado[0].id_rol,
    };

    respLoginResultadoCorrectoObjeto200(
      res,
      jwt.createAccessTokenWithRol(resultFinal),
      { rol: rolesUsuarioLogeado, usuario: usuarioLogeado },
      messageFinal
    );
    //#endregion
  } catch (err) {
    throw err;
  }
};

const insertarIntentoFallido = async (usuario, password, ip) => {
  try {
    //#region CONSULTAS DE INTENTOS
    const intentosActuales = await obtenerNumeroDeIntentosDeUsuario(
      usuario.id_usuario
    );
    //#endregion
    //#region OBTENIENDO EL ULTIMO INTENTO, UTILIZANDO EL MAXIMO
    const valorMaximoDeIntentosActuales =
      obtenerMaximoDeIntentos(intentosActuales);
    //#endregion
    //#region INSERTANDO INTENTO EN APS_seg_intentos_log
    let ultimoIntento = { num_intento: valorMaximoDeIntentosActuales };
    if (valorMaximoDeIntentosActuales < MAX_INTENTOS_LOGIN) {
      const queryInsert = InsertarUtil("APS_seg_intentos_log", {
        body: {
          id_usuario: usuario.id_usuario || -1,
          usuario: usuario.usuario,
          password,
          ip,
          num_intento: valorMaximoDeIntentosActuales + 1,
        },
        returnValue: "*",
      });

      ultimoIntento = (await EjecutarQuery(queryInsert))?.[0] || undefined;
      if (isUndefined(ultimoIntento))
        throw new Error("Hubo un error al insertar el ultimo intento");
    }
    //#endregion

    if (ultimoIntento.num_intento >= MAX_INTENTOS_LOGIN) {
      await actualizarUsuarioBloqueado(true, usuario.id_usuario);
      throw {
        code: 429,
        message:
          "Usuario Bloqueado, contáctese con el Administrador del Sistema",
      };
    }
  } catch (err) {
    throw err;
  }
};

const verificaCuentaBloqueada = async (usuario) => {
  try {
    //#region CONSULTAS DE INTENTOS
    const intentosActuales = await obtenerNumeroDeIntentosDeUsuario(
      usuario.id_usuario
    );
    //#endregion
    //#region Verificación de los intentos que tiene el usuario, si es mas de 5 (MAX_INTENTOS_LOGIN) entonces se bloqueara el usuario
    if (size(intentosActuales) > 0) {
      const valorMaximoDeIntentosActuales =
        obtenerMaximoDeIntentos(intentosActuales);

      if (valorMaximoDeIntentosActuales >= MAX_INTENTOS_LOGIN) {
        if (usuario.bloqueado === false)
          await actualizarUsuarioBloqueado(true, usuario.id_usuario);

        throw {
          code: 403,
          message:
            "Usuario Bloqueado, contáctese con el Administrador del Sistema",
        };
      }
    }
    //#endregion

    //#region Si es que el usuario no tiene intentos fallidos, pero en la tabla Usuario esta bloqueado, entonces no dejara entrar ingresar al sistema
    if (usuario.bloqueado === true) {
      throw {
        code: 403,
        message:
          "Usuario Bloqueado, contáctese con el Administrador del Sistema",
      };
    }
    //#endregion
  } catch (err) {
    throw err;
  }
};

const actualizarUsuarioBloqueado = async (bloqueado, id_usuario) => {
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

const reiniciarIntentosFallidos = async (id_usuario) => {
  try {
    const queryReinicio = ActualizarUtil("APS_seg_intentos_log", {
      body: { activo: false },
      idKey: "id_usuario",
      idValue: id_usuario,
      returnValue: ["*"],
    });
    await EjecutarQuery(queryReinicio);
    await actualizarUsuarioBloqueado(false, id_usuario);
  } catch (err) {
    throw err;
  }
};

const obtenerNumeroDeIntentosDeUsuario = async (id_usuario) => {
  try {
    return await EjecutarQuery(
      EscogerInternoUtil("APS_seg_intentos_log", {
        select: ["*"],
        where: [
          { key: "id_usuario", value: id_usuario },
          { key: "activo", value: true },
        ],
      })
    );
  } catch (err) {
    throw err;
  }
};

const obtenerMaximoDeIntentos = (intentos) => {
  const max = maxBy(intentos, "num_intento");
  return isUndefined(max) ? 0 : max.num_intento;
};

const registrarRolesDeUsuarioAPS = async (usuarioAPS, usuarioInsertado) => {
  try {
    const rolesUsuarioActualAPS = usuarioAPS.roles; //ROLES DEL USUARIO ACTUAL DE LA APS
    const nombresRoles = map(rolesUsuarioActualAPS, (item) => item.nombre); // VARIABLE AUXILIAR QUE ES UN ARRAY DE NOMBRES DE LOS ROLES DEL USUARIO ACTUAL
    const rolesDeSistema = await EjecutarQuery(
      EscogerInternoUtil("APS_seg_rol", {
        select: ["*"],
        where: [{ key: "codigo", valuesWhereIn: nombresRoles, whereIn: true }],
      })
    ); //SON LOS ROLES DE LA TABLA ASP_SEG_ROL QUE EXISTEN EN LA BASE DE DATOS, TAMBIEN ESTAN ENLAZADOS A LOS ROLES QUE LLEGAN DE LA API EXTERNA
    const rolesActualesDeUsuario = await EjecutarQuery(
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
            valuesWhereIn: nombresRoles,
            whereIn: true,
          },
          {
            key: `"APS_seg_usuario".usuario`,
            value: usuarioAPS.nombreUsuario,
          },
          {
            key: `"APS_seg_rol".activo`,
            value: true,
          },
        ],
      })
    ); //SON LOS REGISTROS DE LA CONSULTA COMPLEJA, QUE SACA LOS ROLES DEL USUARIO QUE EXISTE EN LA BASE DE DATOS, ESTO CON EL FIN DE REGISTRAR LOS ROLES QUE NO TENGA EN LA BASE DE DATOS

    if (size(rolesDeSistema) <= 0) {
      throw {
        code: 404,
        message: "No existen roles disponibles para este usuario",
      };
    }

    const diferenciasRolesAux = differenceBy(
      rolesDeSistema,
      rolesActualesDeUsuario,
      "id_rol"
    ); // VARIABLE QUE CONTIENE LA DIFERENCIA ENTRE rolesDeSistema Y rolesActualesDeUsuario
    const dataQuery = map(diferenciasRolesAux, (item) => {
      return { id_rol: item.id_rol, id_usuario: usuarioInsertado.id_usuario };
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
  } catch (err) {
    throw err;
  }
};

const insertarUsuarioAPSaSistema = async (usuarioAPS, password) => {
  try {
    //#region Obteniendo el id_institucion para registrar al usuarioAPS
    const queryInstituciones = EscogerInternoUtil("APS_seg_institucion", {
      select: ["*"],
      where: [
        { key: "sigla", value: usuarioAPS?.entidad?.nombre || "" },
        { key: "activo", value: true },
      ],
    });

    const institucionInfo =
      (await EjecutarQuery(queryInstituciones))?.[0] || undefined;

    if (isUndefined(institucionInfo))
      throw {
        code: 404,
        message:
          "No se encontró la institución en el sistema para registrar al usuario",
      };
    //#endregion
    //#region Insertando el usuario de la APS al sistema
    const queryInsertarUsuario = InsertarUtil("APS_seg_usuario", {
      body: {
        usuario: usuarioAPS?.nombreUsuario || "",
        password,
        paterno: "",
        materno: "",
        nombres: "",
        id_institucion: institucionInfo.id_institucion,
        doc_identidad: "",
        telefono: "",
        email: "",
      },
      returnValue: "*",
    });
    const usuarioInsertado =
      (await EjecutarQuery(queryInsertarUsuario))?.[0] || undefined;
    return usuarioInsertado;
    //#endregion
  } catch (err) {
    throw err;
  }
};

module.exports = {
  Login,
  LoginApiExterna,
  TokenConRol,
};
