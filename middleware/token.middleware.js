const jwt = require("jwt-simple");
const moment = require("moment");
const { respResultadoDinamicoEND } = require("../utils/respuesta.utils");

const SECRET_KEY =
  "EstoEsUnaClaveSecretaParaQueElTokenFuncioneYTengaAutenticidad-PuedeTomarCualquierValor-PeroDebeSerSeguro";

exports.AsegurarAutenticacionConToken = (req, res, next) => {
  var Moment = require("moment-timezone");
  Moment().tz("America/La_Paz").format();

  if (!req.headers.authorization) {
    //VERIFICAMOS SI LA PETICION TIENE UNA AUTORIZACION, PARA TENER SEGURIDAD DE QUE NO SE ESTA ENVIANDO DESDE CUALQUIER LUGAR QUE NO SEA EL FRONTEND

    return respResultadoDinamicoEND(
      res,
      403,
      0,
      null,
      "La petición no tiene cabecera de autenticación"
    );
  }
  const token = req.headers.authorization.replace(/['"]+/g, ""); //LIMPIA EL TOKEN QUE LLEGA EN HEADERS

  try {
    var payload = jwt.decode(token, SECRET_KEY); //DECODIFICAMOS LOS DATOS Y NOS DEVUELBE UN OBJETO

    if (payload.exp <= moment().unix()) {
      //VERIFICAMOS SI EL TOKEN HA EXPIRADO
      return respResultadoDinamicoEND(
        res,
        404,
        0,
        null,
        "El token ha expirado"
      );
    }
  } catch (err) {
    return respResultadoDinamicoEND(res, 404, 0, null, "Token Inválido");
  }

  req.user = payload; //RECARGAMOS LA PETICION Y ACTUALIZAMOS USER PARA ENVIARSELO RECIEN AL GET EN User.js de ROUTERS
  next(); //DAMOS PASO A QUE SE EJECUTE EL ENDPOINT Y DECIMOS QUE EL MIDDLEWARE ES CORRECTO
};
