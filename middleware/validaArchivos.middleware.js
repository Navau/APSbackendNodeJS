const fs = require("fs");
const { Worker, isMainThread } = require("node:worker_threads");
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
  respUsuarioNoAutorizado200END,
} = require("../utils/respuesta.utils");
const {
  size,
  sortBy,
  map,
  isUndefined,
  isNumber,
  forEach,
  find,
  filter,
} = require("lodash");

const {
  VerificarPermisoTablaUsuarioAuditoria,
} = require("../utils/auditoria.utils");
const { DateTime } = require("luxon");
const {
  obtenerInformacionColumnasArchivosBD,
  obtenerValidacionesArchivos,
  CONF_FILE_VALUE_VALIDATIONS,
} = require("./helpers/informacion-archivo.helper");
const {
  insertarNuevaCargaArchivo,
  obtenerArchivosSubidos,
} = require("./helpers/consultas-cargas.helpers");
const {
  obtenerInformacionInicial,
} = require("./helpers/informacion-inicial.helper");
const {
  validacionesEntradasCargaArchivos,
} = require("./helpers/validaciones-entradas-carga-archivos.helper");
const { EjecutarQuery } = require("../utils/consulta.utils");

const TABLES_INFO_UPLOAD = (codInstitucion = undefined) => ({
  SEGUROS: {
    id: "SEGUROS",
    codeInst: codInstitucion,
    table: "APS_aud_carga_archivos_pensiones_seguros",
    tableErrors: "APS_aud_errores_carga_archivos_pensiones_seguros",
  },
  PENSIONES: {
    id: "PENSIONES",
    codeInst: codInstitucion,
    table: "APS_aud_carga_archivos_pensiones_seguros",
    tableErrors: "APS_aud_errores_carga_archivos_pensiones_seguros",
  },
  CUSTODIO_SEGUROS: {
    id: "CUSTODIO_SEGUROS",
    codeInst: codInstitucion,
    table: "APS_aud_carga_archivos_custodio",
    tableErrors: "APS_aud_errores_carga_archivos_custodio",
  },
  CUSTODIO_PENSIONES: {
    id: "CUSTODIO_PENSIONES",
    codeInst: codInstitucion,
    table: "APS_aud_carga_archivos_custodio",
    tableErrors: "APS_aud_errores_carga_archivos_custodio",
  },
  BOLSA: {
    id: "BOLSA",
    codeInst: codInstitucion,
    table: "APS_aud_carga_archivos_bolsa",
    tableErrors: "APS_aud_errores_carga_archivos_bolsa",
  },
});

exports.subirArchivos = async (req, res, next) => {
  try {
    const uploadErrors = [];
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, "./uploads/tmp"),
      filename: (req, file, cb) => cb(null, file.originalname),
    });

    const upload = multer({
      storage: storage,
      // limits: { fileSize: 20 * 1024 * 1024 }, //? 20MB
    }).any("archivos");

    upload(req, res, (err) => {
      const files = req?.files;
      if (err instanceof multer.MulterError)
        uploadErrors.push({ data: err, message: err.message });
      else if (err) uploadErrors.push({ data: err, message: err.message });
      else {
        if (!files || size(files) === 0) {
          uploadErrors.push({
            data: {},
            message: `No se encontraron archivos para subir`,
          });
        }
        forEach(files, (file) => {
          if (file.size > 20 * 1024 * 1024)
            uploadErrors.push({
              data: file,
              message: `El archivo '${file.originalname}' excede el tamaño permitido de 20MB`,
            });
        });
      }
      if (size(uploadErrors) > 0) {
        forEach(files, (file) => {
          const filePath = file.path;
          fs.unlink(filePath, (err) => {
            if (err) throw err;
            else
              console.log(
                `El archivo ${file.originalname} fue eliminado del directorio`
              );
          });
        });
      }
      req.uploadErrors = uploadErrors;
      next();
    });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
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

    const { uploadErrors } = req;

    const dataInitial = {
      fecha_operacion,
      tipo_periodo,
      fecha_entrega,
      files,
      tipo_carga,
      reproceso,
      uploadErrors,
    };
    const { id_rol, id_usuario } = req.user;

    const validaciones = await validacionesEntradasCargaArchivos(dataInitial);
    if (size(validaciones?.errors) > 0)
      throw { myCode: 400, message: validaciones.errors };

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

    const {
      codigosSeguros,
      codigosPensiones,
      confArchivos,
      formatoArchivosRequeridos,
    } = await obtenerInformacionInicial(dataInitial, req.user);

    let COD_INSTITUCION = null;
    if (size(codigosSeguros) > 0) COD_INSTITUCION = codigosSeguros[0].codigo;
    if (size(codigosPensiones) > 0)
      COD_INSTITUCION = codigosPensiones[0].codigo;
    if (
      tipo_carga === "CUSTODIO_SEGUROS" ||
      tipo_carga === "CUSTODIO_PENSIONES"
    )
      COD_INSTITUCION = "CUSTODIO";
    if (tipo_carga === "BOLSA") COD_INSTITUCION = "BOLSA";

    if (COD_INSTITUCION === null)
      throw {
        myCode: 500,
        message: `No se encontró el código de la institución (usuario: ${id_usuario}, rol: ${id_rol})`,
      };
    const TABLE_INFO = TABLES_INFO_UPLOAD(COD_INSTITUCION)[tipo_carga];

    const fechaOperacionFormateada = DateTime.fromISO(fecha_operacion).toFormat(
      TABLE_INFO.id === "BOLSA" ? "yyMMdd" : "yyyyMMdd"
    );
    dataInitial.fechaOperacionFormateada = fechaOperacionFormateada;

    const nuevaCarga = await insertarNuevaCargaArchivo({
      TABLE_INFO,
      user: req.user,
      ...dataInitial,
    });

    const WORKER_OPTIONS = {
      data: {
        TABLE_INFO,
        ...dataInitial,
        ...req.user,
        codigosSeguros,
        codigosPensiones,
        confArchivos,
        formatoArchivosRequeridos,
        optionsValidationsFiles: {},
        nuevaCarga,
      },
      error: undefined,
      isFormattedFiles: false,
      isValidatedContentFormatFiles: false,
      isValidatedContentValuesFiles: false,
      formattedFiles: [],
      validatedContentFormatFiles: [],
      validatedContentValuesFiles: [],
      errorsFiles: [],
      poolErrors: undefined,
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
        const { formattedFiles, errorsFormatFile } = params;
        WORKER_OPTIONS.formattedFiles = formattedFiles;
        if (size(errorsFormatFile) > 0)
          WORKER_OPTIONS.errorsFiles = errorsFormatFile;
      } catch (err) {
        WORKER_OPTIONS.error = err;
      }
    });
    worker.on("error", (err) => {
      console.error("==============================");
      console.error("ERROR FORMATEO DE ARCHIVOS");
      console.error(err);
      console.error("==============================");
      WORKER_OPTIONS.error = err;
    });
    worker.on("exit", (exitCode) => {
      console.log("==============================");
      console.log("FIN FORMATEO DE ARCHIVOS");
      console.log("==============================");
      if (!isUndefined(WORKER_OPTIONS.error)) {
        respErrorServidor500END(res, WORKER_OPTIONS.error);
      }
      //  else if (size(WORKER_OPTIONS.formattedFiles) !== size(files))
      //   respErrorServidor500END(
      //     res,
      //     null,
      //     "La cantidad de archivos de salida no es igual a la cantidad de archivos de entrada."
      //   );
      else if (size(WORKER_OPTIONS.errorsFiles) > 0) {
        const type = "formatearArchivos";
        workerInsertarErrores(WORKER_OPTIONS, type);
        respArchivoErroneo200(res, WORKER_OPTIONS.errorsFiles, []);
      } else {
        WORKER_OPTIONS.isFormattedFiles = true;
        req.WORKER_OPTIONS = WORKER_OPTIONS;
        next();
      }
    });
  } catch (err) {
    handleErrors(err, res);
  }
};

exports.validarFormatoContenidoDeArchivos = async (req, res, next) => {
  try {
    const { WORKER_OPTIONS } = req;
    const { data, formattedFiles } = WORKER_OPTIONS;
    const { confArchivos, TABLE_INFO } = data;

    const readedFiles = await obtenerArchivosSubidos(formattedFiles);
    const infoColumnasArchivos = await obtenerInformacionColumnasArchivosBD(
      confArchivos,
      TABLE_INFO,
      formattedFiles
    );
    WORKER_OPTIONS.data.readedFiles = readedFiles;
    WORKER_OPTIONS.data.infoColumnasArchivos = infoColumnasArchivos;

    const worker = new Worker(
      "./middleware/workers/validar-contenido-formato-archivo.worker.js",
      { workerData: WORKER_OPTIONS.data }
    );

    worker.on("online", () => {
      console.log("==========================================");
      console.log("INICIO VALIDACIÓN DE CONTENIDO DE ARCHIVOS");
      console.log("==========================================");
    });
    worker.on("message", (params) => {
      try {
        const { validatedContentFormatFiles, errorsContentFormatFile } = params;
        WORKER_OPTIONS.validatedContentFormatFiles =
          validatedContentFormatFiles;
        if (size(errorsContentFormatFile) > 0)
          WORKER_OPTIONS.errorsFiles = errorsContentFormatFile;
      } catch (err) {
        WORKER_OPTIONS.error = err;
      }
    });
    worker.on("error", (err) => {
      console.error("==========================================");
      console.error("ERROR VALIDACIÓN DE CONTENIDO DE ARCHIVOS");
      console.error(err);
      console.error("==========================================");
      WORKER_OPTIONS.error = err;
    });
    worker.on("exit", (exitCode) => {
      console.log("==========================================");
      console.log("FIN VALIDACIÓN DE CONTENIDO DE ARCHIVOS");
      console.log("==========================================");
      if (!isUndefined(WORKER_OPTIONS.error)) {
        respErrorServidor500END(res, WORKER_OPTIONS.error);
      } else if (size(WORKER_OPTIONS.errorsFiles) > 0) {
        const type = "validarFormatoContenidoDeArchivos";
        workerInsertarErrores(WORKER_OPTIONS, type);
        respArchivoErroneo200(res, WORKER_OPTIONS.errorsFiles, []);
      } else {
        WORKER_OPTIONS.isValidatedContentFormatFiles = true;
        req.WORKER_OPTIONS = WORKER_OPTIONS;
        next();
      }
    });
  } catch (err) {
    handleErrors(err, res);
  }
};

exports.validarValoresContenidoDeArchivos = async (req, res, next) => {
  try {
    const { WORKER_OPTIONS } = req;
    const { validatedContentFormatFiles, data } = WORKER_OPTIONS;
    const { TABLE_INFO } = data;

    const optionsValidationsFiles = await obtenerValidacionesArchivos(
      validatedContentFormatFiles,
      TABLE_INFO
    );
    // console.log("optionsValidationsFiles", optionsValidationsFiles);

    WORKER_OPTIONS.data.optionsValidationsFiles = optionsValidationsFiles;
    WORKER_OPTIONS.data.objectArrayFilesContent = validatedContentFormatFiles;

    const worker = new Worker(
      "./middleware/workers/validar-contenido-valores-archivo.worker.js",
      { workerData: WORKER_OPTIONS.data }
    );

    worker.on("online", () => {
      console.log("==========================================");
      console.log("INICIO VALIDACIÓN DE VALORES DE ARCHIVOS");
      console.log("==========================================");
    });
    worker.on("message", (params) => {
      try {
        const { validatedContentValuesFiles, errorsContentValuesFile } = params;
        WORKER_OPTIONS.validatedContentValuesFiles =
          validatedContentValuesFiles;
        if (size(errorsContentValuesFile) > 0)
          WORKER_OPTIONS.errorsFiles = errorsContentValuesFile;
      } catch (err) {
        WORKER_OPTIONS.error = err;
      }
    });
    worker.on("error", (err) => {
      console.error("==========================================");
      console.error("ERROR VALIDACIÓN DE VALORES DE ARCHIVOS");
      console.error(err);
      console.error("==========================================");
      WORKER_OPTIONS.error = err;
    });
    worker.on("exit", (exitCode) => {
      console.log("==========================================");
      console.log("FIN VALIDACIÓN DE VALORES DE ARCHIVOS");
      console.log("==========================================");
      if (!isUndefined(WORKER_OPTIONS.error)) {
        respErrorServidor500END(res, WORKER_OPTIONS.error);
      } else if (size(WORKER_OPTIONS.errorsFiles) > 0) {
        const type = "validarValoresContenidoDeArchivos";
        workerInsertarErrores(WORKER_OPTIONS, type);
        respArchivoErroneo200(res, WORKER_OPTIONS.errorsFiles, []);
        // WORKER_OPTIONS.isValidatedContentValuesFiles = true;
        // req.WORKER_OPTIONS = WORKER_OPTIONS;
        // next();
      } else {
        WORKER_OPTIONS.isValidatedContentValuesFiles = true;
        req.WORKER_OPTIONS = WORKER_OPTIONS;
        next();
      }
    });
  } catch (err) {
    handleErrors(err, res);
  }
};

const workerInsertarErrores = (WORKER_OPTIONS, type) => {
  const workerErrors = new Worker(
    "./middleware/workers/carga-errores-bd.worker.js",
    {
      workerData: {
        ...WORKER_OPTIONS,
        type,
      },
    }
  );
  workerErrors.on("online", () => {
    console.log("==============================");
    console.log(`INICIO CARGA ERRORES DE CONTENIDO`);
    console.log(`('${WORKER_OPTIONS.data.TABLE_INFO.codeInst}')`);
    console.log("==============================");
  });
  workerErrors.on("message", (params) => {});
  workerErrors.on("error", (err) => {
    console.error("==============================");
    console.error(`ERROR EN CARGA ERRORES DE CONTENIDO A BASE DE DATOS`);
    console.error(`('${WORKER_OPTIONS.data.TABLE_INFO.codeInst}')`);
    console.error(err);
    console.error("==============================");
    //TODO: AVISAR AL USUARIO QUE NO SE REGISTRARON LOS ERRORES EN LA BASE DE DATOS, POR MEDIO DE SOCKET IO
  });
  workerErrors.on("exit", (exitCode) => {
    console.log("============================================");
    console.log(`FIN CARGA ERRORES DE CONTENIDO`);
    console.log("PROCESO TERMINADO CON ", exitCode === 0 ? "EXITO" : "ERROR");
    console.log(`('${WORKER_OPTIONS.data.TABLE_INFO.codeInst}')`);
    console.log("============================================");
  });
};

const handleErrors = (err, res) => {
  if (err?.type === "errores_archivos")
    respArchivoErroneo200(res, err.errors, []);
  else if (err?.type === "unauthorized")
    respUsuarioNoAutorizado200END(res, null, err.action, err.table);
  else if (isNumber(err?.myCode))
    respResultadoDinamicoEND(res, err.myCode, 0, [], err.message);
  else respErrorServidor500END(res, err);
};
