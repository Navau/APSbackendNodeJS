exports.permisoListar = async (req, res) => {
  const permiso = await VerificarPermisoTablaUsuario({
    req,
    res,
    table: nameTable,
    action: "Listar",
  });

  if (permiso?.err) {
    respErrorServidor500END(res, permiso.err);
    return;
  }
  if (permiso?.ok === false) {
    respResultadoVacio404(res, "Usuario no Autorizado");
    return;
  }
};
