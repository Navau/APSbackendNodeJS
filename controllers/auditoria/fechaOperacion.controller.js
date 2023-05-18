const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

async function obtenerFechaOperacion(req, res) {
  const { tipo_archivo } = req.body; //tipo_archivo = PENSIONES, CUSTODIO O BOLSA
  const nameTable =
    tipo_archivo === "PENSIONES" || tipo_archivo === "SEGUROS"
      ? "APS_aud_carga_archivos_pensiones_seguros"
      : tipo_archivo === "BOLSA"
      ? "APS_aud_carga_archivos_bolsa"
      : tipo_archivo === "CUSTODIO"
      ? "APS_aud_carga_archivos_custodio"
      : null;

  const params = {
    req,
    res,
    nameTable,
    methodName: "ObtenerFechaOperacion_FechaOperacion",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

module.exports = {
  obtenerFechaOperacion,
};
