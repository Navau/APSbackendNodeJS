const jwt = require("../../services/jwt.services");
const moment = require("moment");
const pool = require("../../database");
const format = require("pg-format");
const validator = require("validator");

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
} = require("../../utils/respuesta.utils");
const { APP_GUID } = require("../../config");

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
    const user = body.usuario.toLowerCase();
    const password = body.password;
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
    const body = req.body;
    const user = body.usuario.toLowerCase();
    const password = body.password;
    estadoJWT(res); //VERIFICAR ESTADO DE SERVICIO
    const data = {
      usuario: user,
      password,
      app: APP_GUID,
    };
    const tokenInfo = await obtenerToken(data, res); //OBTENER TOKEN
    const token = {
      token_value: tokenInfo.access_token,
      token_type: tokenInfo.token_type,
    };
    const usuario = await obtenerInfoUsuario(token, data, res); // OBTIENE INFO DE USUARIO
    respResultadoCorrectoObjeto200(res, usuario); //RESPUESTA
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
