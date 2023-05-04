const fs = require("fs");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");
const {
  map,
  filter,
  forEach,
  split,
  join,
  includes,
  size,
  replace,
  find,
  isUndefined,
} = require("lodash");
const archiver = require("archiver");
const {
  respDescargarArchivos200,
  respErrorServidor500END,
  respResultadoVacioObject200,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
} = require("../../utils/respuesta.utils");
const {
  EscogerInternoUtil,
  EjecutarVariosQuerys,
} = require("../../utils/consulta.utils");

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
  const { archivos } = req.body;
  if (size(archivos) <= 0) {
    respResultadoIncorrectoObjeto200(
      res,
      null,
      archivos,
      "No existen archivos para descargar"
    );
    return;
  }
  const filter = split(archivos?.[0], ".")[0];
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

async function ListarArchivos(req, res) {
  try {
    const { modalidades, tipo_archivos = "seguros" } = req.body;
    const codigos = [];
    const nameTableTipoArchivos =
      tipo_archivos === "pensiones"
        ? "APS_pensiones_archivo_"
        : "APS_seguro_archivo_";
    const queryArchivos = EscogerInternoUtil("INFORMATION_SCHEMA.TABLES", {
      select: ["*"],
      where: [
        { key: "table_schema", value: "public" },
        { key: "table_type", value: "BASE TABLE" },
        { key: "table_name", value: nameTableTipoArchivos, like: true },
      ],
    });
    const codigosArchivos = await pool
      .query(queryArchivos)
      .then((result) => {
        return {
          result: map(result.rows, (item) =>
            replace(item.table_name, nameTableTipoArchivos, "")
          ),
        };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (codigosArchivos.ok === null) throw codigosArchivos.err;

    forEach(modalidades, (item) =>
      filter(item.modalidades, (modalidad) => {
        if (modalidad.esCompleto === true) {
          codigos.push({
            fecha: join(split(item.fecha.replace(/\s/g, ""), "-"), ""),
            codigo: modalidad.codigo,
          });
        }
      })
    );
    const files = fs.readdirSync("./uploads/tmp");
    const resultFinal = [];
    forEach(codigos, (item) => {
      const aux = filter(files, (file) => {
        const splitFecha = split(item.fecha, "-").join("");
        const fileSplitFecha = file
          .toUpperCase()
          .substring(0, file.indexOf(splitFecha));
        const auxResultFind = find(codigosArchivos.result, (codArchivo) => {
          if (fileSplitFecha.indexOf("CC") === -1)
            if (tipo_archivos === "pensiones") {
              const codInstitucionAux = fileSplitFecha.substring(
                0,
                fileSplitFecha.indexOf(codArchivo)
              );
              return (
                split(file, codArchivo)[0] === codInstitucionAux &&
                item.codigo === codInstitucionAux
              );
            } else if (tipo_archivos === "seguros") {
              return split(file, item.fecha)[0] === item.codigo;
            } else return includes(file, codArchivo);

          return false;
        });
        return isUndefined(auxResultFind) ? false : true;
      });
      resultFinal.push(...aux);
    });
    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function Modalidades(req, res) {
  try {
    const { fecha, id_tipo_modalidad } = req.body;
    const { id_rol } = req.user;
    const querys = [
      EscogerInternoUtil(
        id_rol === 10
          ? "aps_view_modalidad_seguros"
          : "aps_view_modalidad_pensiones",
        {
          select: ["*"],
          where: [{ key: "id_tipo_entidad", value: id_tipo_modalidad }],
        }
      ),
    ];
    const results = await EjecutarVariosQuerys(querys);
    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }
    const modalidadesArray = map(results.result, (item, index) => {
      return {
        id_modalidad: index + 1,
        titulo: "Todas",
        fecha,
        descripcion: "Todas las entidades",
        esCompleto: false,
        esTodoCompleto: false,
        modalidades: map(results.result?.[0].data, (item) => {
          return {
            id_tipo_modalidad: item.id_tipo_entidad,
            esCompleto: false,
            descripcion: item.descripcion,
            codigo: item.codigo,
            institucion: item.institucion,
            sigla: item.sigla,
          };
        }),
      };
    });

    respResultadoCorrectoObjeto200(res, modalidadesArray);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  DescargarArchivosPorFecha,
  ListarArchivos,
  DescargarArchivos,
  Modalidades,
};
