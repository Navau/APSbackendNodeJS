const { IP_SERVER_API_EXTERNA } = require("../config");
const axios = require("axios");

exports.obtenerJwtEstadoApi = async function () {
  try {
    const url = `${IP_SERVER_API_EXTERNA}/jwt/estado`;
    return await axios
      .get(url)
      .then((response) => {
        const result = response.data;
        return {
          ok: true,
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
    // const params = {
    //   method: "POST",
    //   headers:
    //   body: JSON.stringify(data),
    // };

    console.log({ url, data, options });

    return await axios
      .post(url, data, options)
      .then((response) => {
        const result = response.data;
        return {
          ok: true,
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
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, params);
    const result = await response.json();
    return { ok: true, result };
  } catch (err) {
    return { ok: null, err };
  }
};

exports.actualizarContraseñaUsuarioApi = async function (token, data) {
  try {
    const { username } = data;
    const url = `${IP_SERVER_API_EXTERNA}/jwt/api/v2/usuarios/${username}/updatePassword`;
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, params);
    const result = await response.json();
    return { ok: true, result };
  } catch (err) {
    return { ok: null, err };
  }
};
