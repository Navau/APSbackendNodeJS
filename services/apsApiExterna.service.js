const {
  IP_SERVER_API_EXTERNA,
  SITE_KEY,
  IP_SERVER_API,
  SECRET_CAPTCHA_KEY,
} = require("../config");
const axios = require("axios");

exports.obtenerJwtEstadoApi = async function () {
  try {
    //GET
    const url = `${IP_SERVER_API_EXTERNA}/jwt/estado`;
    return await axios
      .get(url)
      .then((response) => {
        const result = response.data;
        const status = response?.status;
        return { status, result };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  }
};

exports.obtenerTokenApi = async function (data) {
  try {
    //POST
    const url = `${IP_SERVER_API_EXTERNA}/jwt/api/v2/token`;
    const options = {
      headers: { "Content-Type": "application/json" },
    };
    const body = JSON.stringify(data);

    return await axios
      .post(url, body, options)
      .then((response) => {
        const result = response?.data;
        const status = response?.status;
        return { status, result };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  }
};

exports.obtenerInfoUsuarioApi = async function (token, data) {
  try {
    //GET
    const { usuario, app } = data;
    const { token_value, token_type } = token;
    const url = `${IP_SERVER_API_EXTERNA}/jwt/api/v2/usuarios/${usuario}/app/${app}`;

    const options = {
      headers: {
        Authorization: `${token_type} ${token_value}`,
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(data);

    return await axios
      .get(url, options, body)
      .then((response) => {
        const result = response.data;
        const status = response?.status;
        return { status, result };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  }
};

exports.actualizarContraseñaUsuarioApi = async function (token, data) {
  try {
    //PUT
    const { usuario } = data;
    const { token_value, token_type } = token;
    const url = `${IP_SERVER_API_EXTERNA}/jwt/api/v2/usuarios/${usuario}/updatePassword`;
    const options = {
      headers: {
        Authorization: `${token_type} ${token_value}`,
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify(data);

    return await axios
      .put(url, body, options)
      .then((response) => {
        const result = response.data;
        const status = response?.status;
        return { status, result };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  }
};

exports.verificarTokenRecaptcha = async function (captchaToken) {
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_CAPTCHA_KEY}&response=${captchaToken}`;

  const options = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  // console.log({
  //   verificationURL,
  //   key: "6LfP1nAmAAAAAJm0KfX7KfCohmp4Vf4XaMrN4TdU",
  //   captchaToken,
  // });

  try {
    const response = await axios.post(verificationURL, null, options);
    console.log(response.data);
    return response.data.success;
  } catch (err) {
    console.log(err);
    console.error("Error al verificar el token de reCAPTCHA:", err.message);
    // throw error;
  }
};
