// const { map, find, forEach, size } = require("lodash");
// const { parentPort, workerData } = require("worker_threads");
// const {
//   validarFechaOperacionIgual,
//   validarArchivosNecesariosDeUsuario,
//   validarTamañoDeArchivos,
// } = require("../helpers/validaciones-formato-archivo.helper");
// const { agregarError } = require("../helpers/funciones-auxiliares.helper");

// function formatearArchivo() {
//   const {
//     files,
//     TABLE_INFO,
//     fechaOperacionFormateada,
//     fecha_operacion,
//     tipo_periodo,
//     fecha_entrega,
//     tipo_carga,
//     reproceso,
//     id_rol,
//     id_usuario,
//     codigosSeguros,
//     codigosPensiones,
//     confArchivos,
//     formatoArchivosRequeridos,
//     nuevaCarga,
//   } = workerData;
//   const errorsFormatFile = [];
//   let formattedFiles = files;
//   try {
//     const uploadErrors = [];
//     const storage = multer.diskStorage({
//       destination: (req, file, cb) => cb(null, "./uploads/tmp"),
//       filename: (req, file, cb) => cb(null, file.originalname),
//     });

//     const upload = multer({
//       storage: storage,
//       // limits: { fileSize: 20 * 1024 * 1024 }, //? 20MB
//     }).any("archivos");

//     upload(req, res, (err) => {
//       const fileSizeExceeded = filter(
//         req.files,
//         (file) => file.size > 20 * 1024 * 1024
//       );
//       if (size(fileSizeExceeded) > 0) {
//         respArchivoErroneo200(res, fileSizeExceeded, []);
//       }
//       if (err instanceof multer.MulterError) respErrorMulter500(res, err);
//       else if (err) {
//         if (err.name == "ExtensionError") respErrorExtensionError403(res, err);
//         else respErrorServidor500END(res, err);
//       } else {
//         const files = req?.files;
//         if (fileSizeExceeded.length > 0) {
//           respDatosNoRecibidos400(
//             res,
//             `Los siguientes archivos exceden el tamaño permitido: ${fileSizeExceeded.join(
//               ", "
//             )}`
//           );
//         } else if (!files || size(files) === 0) {
//           respDatosNoRecibidos400(
//             res,
//             "No se encontró ningún archivo para subir"
//           );
//         } else {
//           // next();
//         }
//       }
//     });
//   } catch (err) {
//     agregarError(
//       {
//         id_carga_archivos: nuevaCarga.id_carga_archivos,
//         archivo: "",
//         tipo_error: "ERROR DE SERVIDOR",
//         descripcion: `Error de servidor al formatear los archivos. ${
//           err?.message ? err.message : err
//         }`,
//       },
//       errorsFormatFile
//     );
//   }

//   return { formattedFiles, errorsFormatFile };
// }
// parentPort.postMessage(formatearArchivo());
