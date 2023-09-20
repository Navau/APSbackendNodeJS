const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY =
  "EstoEsUnaClaveSecretaParaQueElTokenFuncioneYTengaAutenticidad-PuedeTomarCualquierValor-PeroDebeSerSeguro";

exports.createAccessToken = function (user) {
  //FUNCTION PARA CREAR EL ACCESS TOKEN
  const payload = {
    id_usuario: user.id_usuario,
    token_api: user.tokenAPI,
    nbf: moment().unix(),
    exp: moment().add(1, "hours").unix(), //Cambiar a 1
    iat: moment().unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.createAccessTokenWithRol = function (user) {
  //FUNCTION PARA CREAR EL ACCESS TOKEN
  const payload = {
    id_usuario: user.id_usuario,
    id_rol: user.id_rol,
    token_api: user.tokenAPI,
    nbf: moment().unix(),
    exp: moment().add(2, "years").unix(), //Cambiar a 1
    iat: moment().unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken = function (user) {
  //FUNCTION PARA CREAR EL REFRESH ACCES TOKEN
  const payload = {
    id: user.id_usuario,
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

exports.decodedToken = function (token) {
  return jwt.decode(token, SECRET_KEY, true);
};
