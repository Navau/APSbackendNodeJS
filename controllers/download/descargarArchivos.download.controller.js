const fs = require("fs");
const { map } = require("lodash");
const archiver = require("archiver");
const {
  respDescargarArchivos200,
  respErrorServidor500END,
  respResultadoVacioObject200,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");
const { ObtenerInstitucion } = require("../../utils/consulta.utils");

async function ListarArchivos(req, res) {
  try {
    const { fecha, id_rol = null } = req.body;
    const idRolFinal = id_rol === null ? req.user.id_rol : id_rol;
    const date = fecha.split("-").join("");
    const cod_institucion = await ObtenerInstitucion({
      id_usuario: req.user.id_usuario,
      id_rol: idRolFinal,
    });
    const filter = `${cod_institucion.result.codigo}${date}`;
    codigoInstitucionFechaVar = filter;
    const filesFinalArray = [];
    const files = fs.readdirSync("./uploads/tmp");
    map(files, (item, index) => {
      if (item.includes(filter)) {
        filesFinalArray.push(item);
      }
    });

    respResultadoCorrectoObjeto200(res, filesFinalArray);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function DescargarArchivosPorFecha(req, res) {
  const { fecha } = req.body;
  const date = fecha.split("-").join("");
  const nameExportZip = `./downloads/files_${date}.zip`;
  const fileZipPromise = new Promise(async (resolve, reject) => {
    try {
      const filesFinalArray = [];
      const files = fs.readdirSync("./uploads/tmp");
      map(files, (item, index) => {
        if (item.includes(date)) {
          filesFinalArray.push(item);
        }
      });
      if (filesFinalArray.length <= 0) {
        resolve(filesFinalArray);
      } else {
        const output = fs.createWriteStream(nameExportZip);
        const archive = archiver("zip", {
          zlib: { level: 9 }, // Sets the compression level.
        });
        archive.on("error", function (err) {
          throw err;
        });
        map(files, (item, index) => {
          if (item.includes(date)) {
            archive.file(`./uploads/tmp/${item}`, {
              name: `${item}`,
            });
          }
        });

        archive.pipe(output);

        await archive.finalize();
        output.on("close", () => {
          resolve(filesFinalArray);
        });
      }
    } catch (err) {
      reject(err);
    }
  });

  fileZipPromise
    .then((result) => {
      if (result.length >= 1) {
        respDescargarArchivos200(res, nameExportZip, result);
      } else {
        respResultadoVacioObject200(
          res,
          result,
          "No existen archivos para esa fecha."
        );
      }
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

async function DescargarArchivos(req, res) {
  const { archivos, fecha, id_rol = null } = req.body;
  const idRolFinal = id_rol === null ? req.user.id_rol : id_rol;
  const date = fecha.split("-").join("");
  const cod_institucion = await ObtenerInstitucion({
    id_usuario: req.user.id_usuario,
    id_rol: idRolFinal,
  });
  const filter = `${cod_institucion.result.codigo}${date}`;
  const nameExportZip = `./downloads/archivos_${filter}.zip`;
  const fileZipPromise = new Promise(async (resolve, reject) => {
    try {
      if (archivos.length <= 0) {
        resolve(archivos);
      } else {
        const output = fs.createWriteStream(nameExportZip);
        const archive = archiver("zip", {
          zlib: { level: 9 }, // Sets the compression level.
        });
        archive.on("error", function (err) {
          reject(err);
        });
        map(archivos, (item, index) => {
          archive.file(`./uploads/tmp/${item}`, {
            name: `${item}`,
          });
        });

        archive.pipe(output);

        await archive.finalize();
        output.on("close", () => {
          resolve(archivos);
        });
      }
    } catch (err) {
      reject(err);
    }
  });

  fileZipPromise
    .then((result) => {
      if (result.length >= 1) {
        respDescargarArchivos200(res, nameExportZip, result);
      } else {
        respResultadoVacioObject200(
          res,
          result,
          "No existen archivos para esa fecha."
        );
      }
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    })
    .finally(() => {
      codigoInstitucionFechaVar = null;
    });
}

module.exports = {
  DescargarArchivosPorFecha,
  ListarArchivos,
  DescargarArchivos,
};
