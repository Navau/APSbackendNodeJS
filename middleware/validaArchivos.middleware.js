const { Worker, setEnvironmentData } = require("node:worker_threads");
const multer = require("multer");
const {
  respErrorMulter500,
  respErrorExtensionError403,
  respErrorServidor500END,
  respDatosNoRecibidos400,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respResultadoDinamicoEND,
  respArchivoErroneo200,
} = require("../utils/respuesta.utils");
const {
  size,
  forEach,
  sortBy,
  map,
  isUndefined,
  isNumber,
  find,
} = require("lodash");
const {
  validarEntradasCargaArchivos,
} = require("./helpers/validar-entradas-carga-archivos.helper");
const {
  VerificarPermisoTablaUsuarioAuditoria,
} = require("../utils/auditoria.utils");
const {
  obtenerInformacionInicial,
} = require("./helpers/obtener-info-inicial.helper");
const {
  insertarNuevaCargaArchivo,
} = require("./helpers/consultas-cargas.helpers");

const TABLES_INFO_UPLOAD = (codInstitucion = undefined) => ({
  SEGUROS_PENSIONES: {
    id: "SEGUROS_PENSIONES",
    code: codInstitucion,
    table: "APS_aud_carga_archivos_pensiones_seguros",
    tableErrors: "APS_aud_errores_carga_archivos_pensiones_seguros",
  },
  CUSTODIO: {
    id: "CUSTODIO",
    code: codInstitucion,
    table: "APS_aud_carga_archivos_custodio",
    tableErrors: "APS_aud_errores_carga_archivos_custodio",
  },
  BOLSA: {
    id: "BOLSA",
    code: codInstitucion,
    table: "APS_aud_carga_archivos_bolsa",
    tableErrors: "APS_aud_errores_carga_archivos_bolsa",
  },
});

exports.subirArchivos = async (req, res, next) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads/tmp"),
    filename: (req, file, cb) => cb(null, file.originalname),
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }).any("archivos");

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) respErrorMulter500(res, err);
    else if (err) {
      if (err.name == "ExtensionError") respErrorExtensionError403(res, err);
      else respErrorServidor500END(res, err);
    } else {
      const files = req?.files;
      if (!files || size(files) === 0) {
        respDatosNoRecibidos400(
          res,
          "No se encontro ningún archivo para subir."
        );
      } else next();
    }
  });
};

exports.formatearArchivos = async (req, res, next) => {
  try {
    const files = sortBy(req?.files, "originalname");
    const {
      fecha_operacion,
      tipo_periodo,
      fecha_entrega,
      tipo_carga,
      reproceso,
    } = req?.body;
    const dataInitial = {
      fecha_operacion,
      tipo_periodo,
      fecha_entrega,
      files,
      tipo_carga,
      reproceso,
    };
    const { id_rol, id_usuario } = req.user;

    const validaciones = await validarEntradasCargaArchivos(dataInitial);
    if (size(validaciones?.errors) > 0)
      throw { code: 400, message: validaciones.errors };

    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: TABLES_INFO_UPLOAD()[tipo_carga].table,
      action: "Insertar",
      req,
      res,
    });
    if (permiso.ok === false)
      throw {
        type: "unauthorized",
        table: TABLES_INFO_UPLOAD()[tipo_carga].table,
        action: "Insertar",
      };

    const fechaOperacionFormateada = fecha_operacion.split("-").join("");
    dataInitial.fechaOperacionFormateada = fechaOperacionFormateada;
    const { codigosSeguros, codigosPensiones, confArchivos } =
      await obtenerInformacionInicial(dataInitial, req.user);

    const COD_INSTITUCION =
      size(codigosSeguros) > 0
        ? codigosSeguros[0].codigo
        : size(codigosPensiones) > 0
        ? codigosPensiones[0].codigo
        : null;
    if (COD_INSTITUCION === null)
      throw {
        code: 500,
        message: `No se encontró el código de la institución (usuario: ${id_usuario}, rol: ${id_rol})`,
      };
    const TABLE_INFO = TABLES_INFO_UPLOAD(COD_INSTITUCION)[tipo_carga];
    const nuevaCarga = await insertarNuevaCargaArchivo({
      TABLE_INFO,
      user: req.user,
      ...dataInitial,
    });

    const WORKER_OPTIONS = {
      data: {
        ...dataInitial,
        ...req.user,
      },
      error: undefined,
      formattedFiles: [],
    };
    const worker = new Worker(
      "./middleware/workers/formatear-archivo.worker.js",
      { workerData: WORKER_OPTIONS.data }
    );
    worker.on("online", () => {
      console.log("==============================");
      console.log("INICIO FORMATEO DE ARCHIVOS");
      console.log("==============================");
      console.log(map(files, "originalname"));
    });
    worker.on("message", (params) => {
      try {
        WORKER_OPTIONS.formattedFiles = map(params.files, "originalname");
      } catch (err) {
        WORKER_OPTIONS.error = err;
      }
    });
    worker.on("error", (err) => {
      console.error("==============================");
      console.error("ERROR FORMATEO DE ARCHIVOS");
      console.log(err);
      console.error("==============================");
      WORKER_OPTIONS.error = err;
    });
    worker.on("exit", (exitCode) => {
      console.log("==============================");
      console.log("FIN FORMATEO DE ARCHIVOS");
      console.log("==============================");
      if (!isUndefined(WORKER_OPTIONS.error))
        respErrorServidor500END(res, WORKER_OPTIONS.error);
      else if (size(WORKER_OPTIONS.formattedFiles) !== size(files))
        respErrorServidor500END(
          res,
          null,
          "La cantidad de archivos de salida no es igual a la cantidad de archivos de entrada."
        );
      else {
        req.formattedFiles = WORKER_OPTIONS.formattedFiles;
        next();
      }
    });
  } catch (err) {
    if (err?.type === "errores_archivos")
      respArchivoErroneo200(res, err.errors);
    else if (err?.type === "unauthorized")
      respUsuarioNoAutorizado200END(res, null, err.action, err.table);
    else if (isNumber(err?.code))
      respResultadoDinamicoEND(res, err.code, [], [], err.message);
    else respErrorServidor500END(res, err);
  }
};
// exports.formatearArchivo = async (req, res, next) => {
//   const files = sortBy(req.files, "originalname");
//   const { fecha_operacion, tipo_periodo } = req.body;
//   let completedWorkers = 0;
//   let result = [];
//   forEach(files, (file, index) => {
//     const worker = new Worker(
//       "./middleware/workers/formatearArchivo.worker.js",
//       { workerData: { file, index } }
//     );
//     worker.on("message", (fileName) => {
//       result.push(fileName);
//       completedWorkers++;
//       if (completedWorkers === size(files))
//         respResultadoCorrectoObjeto200(res, result, "Archivo formateado");
//     });
//   });
// };

exports.validarArchivos = async (req, res, next) => {
  respResultadoCorrectoObjeto200(res, req.formattedFiles, "Archivo formateado");
};
