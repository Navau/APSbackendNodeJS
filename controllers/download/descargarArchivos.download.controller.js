const { RealizarOperacionAvanzadaCRUD } = require("../../utils/crud.utils");

async function DescargarArchivosPorFecha(req, res) {
  const params = {
    req,
    res,
    nameTable: undefined,
    methodName: "DescargarArchivosPorFecha_DescargarArchivos",
    action: "Descargar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

//TO DO: ACCION DESCARGAR, Y QUE EL PERMISO SE VERIFICARA SIN LA TABLA
async function DescargarArchivos(req, res) {
  const params = {
    req,
    res,
    nameTable: undefined,
    methodName: "DescargarArchivos_DescargarArchivos",
    action: "Descargar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ListarArchivos(req, res) {
  const params = {
    req,
    res,
    nameTable: undefined,
    methodName: "ListarArchivos_DescargarArchivos",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function Modalidades(req, res) {
  const params = {
    req,
    res,
    nameTable: undefined,
    methodName: "Modalidades_DescargarArchivos",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

module.exports = {
  DescargarArchivosPorFecha,
  ListarArchivos,
  DescargarArchivos,
  Modalidades,
};
