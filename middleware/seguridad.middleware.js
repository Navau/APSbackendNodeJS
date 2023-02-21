const { split } = require("lodash");
const {
  VerificarPermisoTablaUsuarioAuditoria,
} = require("../utils/auditoria.utils");
const {
  respUsuarioNoAutorizado200END,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
} = require("../utils/respuesta.utils");
const { obtenerTablaPorRutaPrincipal } = require("../utils/tablas.utils");

exports.permisoUsuario = async (req, res, next, section) => {
  try {
    const mainRoute = split(req.originalUrl, "/")[2]; // USUARIO
    const actionRoute = split(req.originalUrl, "/")[3]; // LISTAR
    const responseTable = await obtenerTablaPorRutaPrincipal(
      res,
      mainRoute,
      section
    );
    if (responseTable === null) {
      respUsuarioNoAutorizado200END(res);
      return;
    }
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      req,
      res,
      table: responseTable?.tabla,
      action: actionRoute,
    });

    if (permiso?.err) {
      respErrorServidor500END(res, permiso.err);
      return;
    }
    if (permiso?.ok === false) {
      respUsuarioNoAutorizado200END(res);
      return;
    }

    next();
  } catch (err) {
    respErrorServidor500END(res, err);
  }
};
