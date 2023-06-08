const {
  obtenerJwtEstadoApi,
  obtenerTokenApi,
  obtenerInfoUsuarioApi,
  actualizarContraseñaUsuarioApi,
} = require("../services/apsApiExterna.service");
const {
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
} = require("../utils/respuesta.utils");

async function estadoJWT(req, res) {
  try {
    const result = await obtenerJwtEstadoApi();
    if (result.ok === false) throw result;
    if (result.ok === null) throw result.err;
    respResultadoCorrectoObjeto200(res, result);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function obtenerToken(req, res) {
  try {
    const data = {
      usuario: "laurence",
      password: "YDaf(ssdq9+6",
      app: "8cb2f01b-fa2a-44bb-9928-746530e7d53c",
    };
    const result = await obtenerTokenApi(data);
    if (result.ok === false) throw result;
    if (result.ok === null) throw result.err;
    respResultadoCorrectoObjeto200(res, result);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function obtenerInfoUsuario(req, res) {
  try {
    const token = {
      token_value:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyN2ZmMTQyNS0wOGEwLTQwMmMtOWIzYS1lOTVjMzMxM2Q3YjkiLCJpYXQiOjE2Nzg0ODE2MjgsInN1YiI6ImxhdXJlbmNlIiwidXNlcm5hbWUiOiJsYXVyZW5jZSIsInVpZCI6MzM1LCJjb21wYW55IjoiQVBTIiwicm9sZSI6WyJBZG1pbmlzdHJhZG9yIiwiQWRtaW5pc3RyYWRvciBkZSBUYWJsYXMgQsOhc2ljYXMiXSwibmJmIjoxNjc4NDgxNjI4LCJleHAiOjE2Nzg0ODUyMjgsImlzcyI6ImxvY2FsaG9zdCIsImF1ZCI6ImxvY2FsaG9zdCJ9.a5yhl32fBTIhhlacebulVdJZZqyqxaS_4R3K2RgPbHY",
      token_type: "Bearer",
    };
    const data = {
      username: "laurence",
      password: "Jmmt3Ah[xd2)",
      app: "8cb2f01b-fa2a-44bb-9928-746530e7d53c",
    };
    const result = await obtenerInfoUsuarioApi(token, data);
    if (result.ok === false) throw result;
    if (result.ok === null) throw result.err;
    respResultadoCorrectoObjeto200(res, result);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function actualizarContraseñaUsuario(req, res) {
  try {
    const { old_password, new_password } = req.body;
    const token = {
      token_value:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZGY3NjFkMC0wODhkLTRlOWUtOTRhNS0wZTM1NDFiYTRhYjEiLCJpYXQiOjE2Nzg0ODAxNzksInN1YiI6ImxhdXJlbmNlIiwidXNlcm5hbWUiOiJsYXVyZW5jZSIsInVpZCI6MzM1LCJjb21wYW55IjoiQVBTIiwicm9sZSI6WyJBZG1pbmlzdHJhZG9yIiwiQWRtaW5pc3RyYWRvciBkZSBUYWJsYXMgQsOhc2ljYXMiXSwibmJmIjoxNjc4NDgwMTc5LCJleHAiOjE2Nzg0ODM3NzksImlzcyI6ImxvY2FsaG9zdCIsImF1ZCI6ImxvY2FsaG9zdCJ9.i_C_9BWpa3Uht8s8riAG7ERUR_DEOdLxseCOjVJWS4Y",
      token_type: "Bearer",
    };
    const data = {
      usuario: "laurence",
      app: "8cb2f01b-fa2a-44bb-9928-746530e7d53c",
      oldPassword: old_password,
      newPassword: new_password,
    };
    const result = await actualizarContraseñaUsuarioApi(token, data);
    if (result.ok === false) throw result;
    if (result.ok === null) throw result.err;
    respResultadoCorrectoObjeto200(res, result);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  estadoJWT,
  obtenerToken,
  obtenerInfoUsuario,
  actualizarContraseñaUsuario,
};
