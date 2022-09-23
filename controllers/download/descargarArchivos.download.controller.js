const fs = require("fs");
const { map } = require("lodash");
const archiver = require("archiver");
const {
  respDescargarArchivos200,
  respErrorServidor500END,
  respResultadoVacioObject200,
} = require("../../utils/respuesta.utils");

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
        respDescargarArchivos200(res, nameExportZip);
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

module.exports = {
  DescargarArchivosPorFecha,
};
