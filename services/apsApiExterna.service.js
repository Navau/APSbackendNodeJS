const { IP_SERVER_API_EXTERNA } = require("../config");
const axios = require("axios");

exports.obtenerJwtEstadoApi = async function () {
  try {
    const url = `${IP_SERVER_API_EXTERNA}/jwt/estado`;
    return await axios
      .get(url)
      .then((response) => {
        const result = response.data;
        const status = response?.status;
        return {
          ok: status === 200 ? true : false,
          status,
          result,
        };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
};

exports.obtenerTokenApi = async function (data) {
  try {
    const url = `${IP_SERVER_API_EXTERNA}/jwt/api/v2/token`;
    const options = {
      headers: { "Content-Type": "application/json" },
    };
    const body = JSON.stringify(data);

    return await axios
      .post(url, body, options)
      .then((response) => {
        const result = response.data;
        const status = response?.status;
        return {
          ok: status === 200 ? true : false,
          result,
        };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
};

exports.obtenerInfoUsuarioApi = async function (token, data) {
  try {
    const { username, appGuId } = data;
    const url = `${IP_SERVER_API_EXTERNA}/jwt/api/v2/usuarios/${username}/app/${appGuId}`;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(data);

    return await axios
      .post(url, body, options)
      .then((response) => {
        const result = response.data;
        const status = response?.status;
        return {
          ok: status === 200 ? true : false,
          result,
        };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
};

exports.actualizarContraseñaUsuarioApi = async function (token, data) {
  try {
    const { username } = data;
    const url = `${IP_SERVER_API_EXTERNA}/jwt/api/v2/usuarios/${username}/updatePassword`;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(data);

    return await axios
      .post(url, body, options)
      .then((response) => {
        const result = response.data;
        const status = response?.status;
        return {
          ok: status === 200 ? true : false,
          result,
        };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
};
