const {
  map,
  forEach,
  find,
  isEmpty,
  isNumber,
  includes,
  isNull,
  isUndefined,
  size,
  groupBy,
  toLower,
} = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");
const {
  respResultadoIncorrectoObjeto200,
  respResultadoDinamicoEND,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");
const {
  EscogerInternoUtil,
  EjecutarQuery,
  AlterarSequenciaUtil,
  ValorMaximoDeCampoUtil,
  EliminarMultiplesTablasUtil,
  InsertarVariosUtil,
} = require("../../utils/consulta.utils");
const {
  eliminarInformacionDuplicada,
  funcionesSeguros,
  modificarNuevaCargaArchivo,
  funcionesPensiones,
  eliminarArchivosCargados,
} = require("../../middleware/helpers/consultas-cargas.helpers");
const { fs } = require("mz");
const { DateTime } = require("luxon");

var nameTable = "APS_aud_carga_archivos_bolsa";

async function CargarArchivo(req, res) {
  const params = {
    req,
    res,
    nameTable: undefined,
    methodName: "CargarArchivo_Upload",
    action: "Insertar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}
async function CargarArchivo2(req, res) {
  const { WORKER_OPTIONS } = req;
  const { id_usuario, id_rol } = req.user;
  const { data } = WORKER_OPTIONS;
  const {
    objectArrayFilesContent,
    infoColumnasArchivos,
    codigosSeguros,
    codigosPensiones,
    nuevaCarga,
    fecha_operacion,
    TABLE_INFO,
    reproceso,
    formatoArchivosRequeridos,
  } = data;
  console.log(formatoArchivosRequeridos);
  const { id, codeInst, table, tableErrors } = TABLE_INFO;
  const infoPreparedToInsertInDB = [];
  const uploadedFilesResult = [];
  let counter = 0;
  let sequence = "";
  try {
    forEach(infoColumnasArchivos, (infoFile, fileCode) => {
      sequence = "";
      let auxColumns = [];
      const fileName =
        formatoArchivosRequeridos[counter]?.archivo ||
        formatoArchivosRequeridos[counter]?.nombre;
      let fileTableName = null;
      let primaryKey = null;
      const newFileCodeAux = codeInst === "CUSTODIO" ? codeInst : fileCode;
      forEach(infoFile, (columnInfo) => {
        const { column_name, column_default, table_name } = columnInfo;
        if (
          column_default !== null &&
          (column_name === `id_archivo_${newFileCodeAux}` ||
            column_name === `id_archivo_${toLower(newFileCodeAux)}`)
        ) {
          const regex = /"(.*?)"/g;
          const matches = column_default.match(regex);
          if (matches === null) {
            throw {
              myCode: 500,
              message: `No se encontró el schema de la columna ${column_name}`,
            };
          } else sequence = matches[0].replace(/"/g, "");
        }
        fileTableName = table_name;
        if (
          column_name !== `id_archivo_${newFileCodeAux}` &&
          column_name !== `id_archivo_${toLower(newFileCodeAux)}`
        )
          auxColumns.push(column_name);
        else primaryKey = column_name;
      });
      infoPreparedToInsertInDB.push({
        fileName,
        fileCode,
        fileTableName,
        sequence,
        primaryKey,
        columns: auxColumns,
        objectArrayFileContent:
          objectArrayFilesContent[`${fileName}_separador_${fileCode}`],
      });
      counter++;
    });
    // console.log(infoPreparedToInsertInDB);

    for await (const infoPrepared of infoPreparedToInsertInDB) {
      const {
        fileName,
        fileCode,
        fileTableName,
        sequence,
        primaryKey,
        columns,
        objectArrayFileContent,
      } = infoPrepared;
      //#region ESTA ES UNA VALIDACION PARA VERIFICAR LA UNICIDAD SEGUN EL TIPO DE ARCHIVO, SE VERIFICA SI LA INFORMACION QUE SE ESTA REGISTRANDO YA EXISTE, SI ES ASI ENTONCES LOS REGISTROS ANTERIORES SE ELIMINAN
      const valuesWhereInAux = [
        `fecha_operacion`,
        `fecha`,
        `fecha_informacion`,
        `cod_institucion`,
      ];
      const isCustodio = includes(
        ["CUSTODIO_SEGUROS", "CUSTODIO_PENSIONES"],
        id
      );
      if (isCustodio) {
        valuesWhereInAux.push(`tipo_instrumento`);
        valuesWhereInAux.push(`serie`);
      }
      const columnsValidation = await EjecutarQuery(
        EscogerInternoUtil("INFORMATION_SCHEMA.COLUMNS", {
          select: ["column_name"],
          where: [
            {
              key: "COLUMN_NAME",
              valuesWhereIn: valuesWhereInAux,
              whereIn: true,
            },
            { key: "TABLE_NAME", value: fileTableName },
          ],
          orderby: { field: "COLUMN_NAME" },
        })
      );
      const uniquenessFields = {};
      forEach(columnsValidation, (columnValidation) => {
        const { column_name } = columnValidation;
        if (includes(["cod_institucion"], column_name))
          uniquenessFields[column_name] = column_name;
        if (includes(["tipo_instrumento", "serie"], column_name) && isCustodio)
          uniquenessFields[column_name] = column_name;
        if (
          includes(
            ["fecha_operacion", "fecha_informacion", "fecha"],
            column_name
          )
        )
          uniquenessFields.fecha = column_name;
      });
      const fieldsMessage = [];

      if (id === "BOLSA") {
        isUndefined(uniquenessFields?.fecha) && fieldsMessage.push("fecha");
        if (size(fieldsMessage) > 0)
          throw {
            myCode: 404,
            message: `No existe el campo '${fieldsMessage.join(
              ", "
            )}' para poder validar unicidad en la tabla '${fileTableName}'`,
          };
        else {
          const where = [
            { key: uniquenessFields.fecha, value: fecha_operacion },
          ];
          await eliminarInformacionDuplicada(
            fileTableName,
            where,
            sequence,
            primaryKey
          );
        }
      } else if (isCustodio) {
        isUndefined(uniquenessFields?.cod_institucion) &&
          fieldsMessage.push("cod_institucion");
        isUndefined(uniquenessFields?.tipo_instrumento) &&
          fieldsMessage.push("tipo_instrumento");
        isUndefined(uniquenessFields?.serie) && fieldsMessage.push("serie");
        isUndefined(uniquenessFields?.fecha) && fieldsMessage.push("fecha");
        if (size(fieldsMessage) > 0)
          throw {
            myCode: 404,
            message: `No existe el campo '${fieldsMessage.join(
              ", "
            )}' para poder validar unicidad en la tabla '${fileTableName}'`,
          };
        else {
          const groupSeries = groupBy(objectArrayFileContent, "serie");
          const groupTiposInstrumentos = groupBy(
            objectArrayFileContent,
            (item) => item?.tipo_instrumento || item?.tipo_activo
          );
          const seriesUniqs = Object.keys(groupTiposInstrumentos);
          const tiposInstrumentosUniqs = Object.keys(groupSeries);
          const where = [
            { key: uniquenessFields.fecha, value: fecha_operacion },
            { key: uniquenessFields.cod_institucion, value: codeInst },
          ];
          if (size(seriesUniqs) > 0)
            where.push({
              key: "serie",
              valuesWhereIn: seriesUniqs,
              whereIn: true,
            });
          if (size(tiposInstrumentosUniqs) > 0)
            where.push({
              key: "tipo_instrumento",
              valuesWhereIn: tiposInstrumentosUniqs,
              whereIn: true,
            });
          await eliminarInformacionDuplicada(
            fileTableName,
            where,
            sequence,
            primaryKey
          );
        }
      } else {
        isUndefined(uniquenessFields?.cod_institucion) &&
          fieldsMessage.push("cod_institucion");
        isUndefined(uniquenessFields?.fecha) && fieldsMessage.push("fecha");
        if (size(fieldsMessage) > 0)
          throw {
            myCode: 404,
            message: `No existe el campo '${fieldsMessage.join(
              ", "
            )}' para poder validar unicidad en la tabla '${fileTableName}'`,
          };
        else {
          const where = [
            { key: uniquenessFields.fecha, value: fecha_operacion },
            { key: uniquenessFields.cod_institucion, value: codeInst },
          ];
          await eliminarInformacionDuplicada(
            fileTableName,
            where,
            sequence,
            primaryKey
          );
        }
      }
      //#endregion

      //#region INSERTAR EL ID DE CARGA ARCHIVOS, COD_INSTITUCION, FECHA_INFORMACION A CADA FILA
      forEach(columns, (column) => {
        forEach(objectArrayFileContent, (row) => {
          if (column === "id_carga_archivos")
            row.id_carga_archivos = nuevaCarga.id_carga_archivos;
          if (column === "cod_institucion") row.cod_institucion = codeInst;
          if (column === "fecha_informacion")
            row.fecha_informacion = fecha_operacion;
        });
      });
      //#endregion

      //#region CREANDO EL ARCHIVO FISICO
      const fileData = map(objectArrayFileContent, (row) => {
        return [...Object.values(row), "\r\n"];
      }).join("");
      const filePathWrite = `./uploads/tmp/${fileName}`;
      fs.writeFileSync(filePathWrite, fileData);
      //#endregion

      //#region CREANDO Y EJECUTANDO LOS QUERYS PARA INSERTAR LA INFORMACION A CADA TABLA SEGUN EL TIPO DE ARCHIVO
      if (size(objectArrayFileContent) > 0) {
        const queryInsertFiles = InsertarVariosUtil(fileTableName, {
          body: objectArrayFileContent,
          returnValue: [primaryKey],
        });
        // console.log(queryInsertFiles);
        // fileCode === "484" && console.log(queryInsertFiles);
        const fileInserted = await EjecutarQuery(queryInsertFiles);
      }
      console.log({ message: `Archivo ${fileName} cargado` });
      //#endregion
      uploadedFilesResult.push({
        archivo: fileName,
        cargado: true,
        id_carga_archivos: nuevaCarga.id_carga_archivos,
        mensaje: `Envío satisfactorio`,
        nro_carga: nuevaCarga.nro_carga,
        fecha_operacion,
        fecha_carga: DateTime.fromJSDate(nuevaCarga.fecha_carga).toFormat(
          "yyyy-MM-dd | HH:mm:ss"
        ),
      });
    }
    if (includes(map(codigosSeguros, "codigo"), codeInst)) {
      await funcionesSeguros(fecha_operacion, id_usuario, codeInst);
    } else if (includes(map(codigosPensiones, "codigo"), codeInst)) {
      await funcionesPensiones(fecha_operacion, id_rol);
    }
    await modificarNuevaCargaArchivo({
      nuevaCarga,
      cargado: true,
      reprocesado: true,
      reproceso,
      fecha_operacion,
      table,
      id_rol,
      id,
    });
    respResultadoCorrectoObjeto200(res, uploadedFilesResult);
  } catch (err) {
    try {
      await eliminarArchivosCargados(
        map(infoPreparedToInsertInDB, "fileTableName"),
        map(infoPreparedToInsertInDB, "sequence"),
        map(infoPreparedToInsertInDB, "primaryKey"),
        nuevaCarga
      );
      await modificarNuevaCargaArchivo({
        nuevaCarga,
        cargado: false,
        reprocesado: false,
        reproceso,
        fecha_operacion,
        table,
        id_rol,
        id,
      });
    } catch (err) {
      respErrorServidor500END(res, err);
    }
    if (isNumber(err?.myCode))
      respResultadoDinamicoEND(res, err.myCode, [], [], err.message);
    else respErrorServidor500END(res, err);
  }
}

// OBTENER TODOS LOS ACTIVIDAD ECONOMICA DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN ACTIVIDAD ECONOMICA, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN ACTIVIDAD ECONOMICA, CON ID DEL ACTIVIDAD ECONOMICA
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN ACTIVIDAD ECONOMICA
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN ACTIVIDAD ECONOMICA
async function Actualizar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  CargarArchivo,
  CargarArchivo2,
};
