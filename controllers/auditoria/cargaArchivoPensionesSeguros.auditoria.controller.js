const {
  map,
  forEach,
  isEmpty,
  size,
  find,
  isUndefined,
  includes,
  filter,
  keys,
  sortBy,
} = require("lodash");
const pool = require("../../database");
const moment = require("moment");
const xl = require("excel4node");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
  EjecutarVariosQuerys,
  ObtenerInstitucion,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoVacioObject200,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respResultadoVacio404END,
  respResultadoIncorrectoObjeto200,
  respDescargarArchivos200,
} = require("../../utils/respuesta.utils");
const {
  formatearFechaDeInformacion,
  ordenarArray,
} = require("../../utils/formatearDatos");
const dayjs = require("dayjs");
const {
  defaultOptionsReportExcel,
  SimpleReport,
} = require("../../utils/opcionesReportes");
const path = require("path");

const nameTable = "APS_aud_carga_archivos_pensiones_seguros";

// async function obtenerFechaOperacion(req, res) {
//   const { tipo } = req.body;

//   const addDays = (date, days) => {
//     date.setDate(date.getDate() + days);
//     return date;
//   };

//   const fechaOperacionMensual = () => {
//     const uploadDate = new Date();
//     const year = uploadDate.getFullYear();
//     const month = uploadDate.getMonth();
//     const day = uploadDate.getDay();
//     const firstDayMonth = new Date(year, month, 1);
//     const fechaOperacion = addDays(firstDayMonth, -1);

//     return fechaOperacion;
//   };
//   const fechaOperacionDiaria = () => {
//     const uploadDate = new Date();
//     const fechaOperacion = addDays(uploadDate, -1);

//     return fechaOperacion;
//   };
//   const fechaOperacionDiaHabil = () => {
//     const uploadDate = new Date();
//     const checkDate = addDays(uploadDate, -1);
//     const day = checkDate.getUTCDay();
//     let fechaOperacion = null;
//     if (day === 1) {
//       //SI ES LUNES
//       fechaOperacion = addDays(uploadDate, -3); // ENTONCES SERA VIERNES
//     } else if (day === 0) {
//       // SI ES DOMINGO
//       fechaOperacion = addDays(uploadDate, -2); // ENTONCES SERA VIERNES
//     } else {
//       // SI ES SABADO
//       fechaOperacion = checkDate; // ENTONCES SERA VIERNES
//     }
//     return fechaOperacion;
//   };

//   const FECHA_OPERACION = {
//     M: fechaOperacionMensual(),
//     D: fechaOperacionDiaria(),
//     DH: fechaOperacionDiaHabil(),
//   };

//   if (isNaN(Date.parse(FECHA_OPERACION[tipo]))) {
//     respErrorServidor500END(res, {
//       message: "Hubo un error al obtener la fecha de operación.",
//       value: FECHA_OPERACION[tipo],
//     });
//   } else {
//     respResultadoCorrectoObjeto200(res, FECHA_OPERACION[tipo]);
//   }
// }

async function ValorMaximo(req, res) {
  const { max, periodicidad } = req.body;
  const { id_rol, id_usuario } = req.user;
  const institucion = async () => {
    let queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
      select: [`"APS_seg_institucion".codigo`],
      innerjoin: [
        {
          table: `APS_seg_institucion`,
          on: [
            {
              table: `APS_seg_institucion`,
              key: "id_institucion",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_institucion",
            },
          ],
        },
        {
          table: `APS_seg_usuario_rol`,
          on: [
            {
              table: `APS_seg_usuario_rol`,
              key: "id_usuario",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_usuario",
            },
          ],
        },
      ],
      where: [
        { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
        { key: `"APS_seg_usuario_rol".id_rol`, value: id_rol },
      ],
    });

    const resultFinal = await pool
      .query(queryInstitucion)
      .then((result) => {
        if (result.rows.length >= 1) {
          return { ok: true, result: result?.rows?.[0] };
        } else {
          return { ok: false, result: result?.rows?.[0] };
        }
      })
      .catch((err) => {
        return { ok: false, err };
      });
    return resultFinal;
  };

  if (!periodicidad) {
    respDatosNoRecibidos400(res, "No se envio la periodicidad.");
  }

  const cod_institucion = await institucion();

  if (cod_institucion?.err) {
    respErrorServidor500END(res, err);
    return;
  }
  if (cod_institucion.ok === false) {
    respResultadoVacio404END(
      res,
      "No existe ninguna institución para este usuario."
    );
    return;
  }

  let fieldMax = max ? max : "fecha_operacion";
  let whereFinal = [
    {
      key: "id_rol",
      value: id_rol,
    },
    {
      key: "id_periodo",
      value: periodicidad,
    },
    {
      key: "cod_institucion",
      value: cod_institucion.result.codigo,
    },
    {
      key: "cargado",
      value: true,
    },
  ];
  const params = {
    fieldMax,
    where: whereFinal,
  };
  let query = ValorMaximoDeCampoUtil(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        if (result.rows[0].max === null) {
          result = {
            ...result,
            rows: [
              {
                max: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
              },
            ],
          };
        }
        respResultadoCorrecto200(res, result);
      }
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function UltimaCarga(req, res) {
  const { cargado } = req.body;
  const { id_rol, id_usuario } = req.user;
  const institucion = async () => {
    let queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
      select: [`"APS_seg_institucion".codigo`],
      innerjoin: [
        {
          table: `APS_seg_institucion`,
          on: [
            {
              table: `APS_seg_institucion`,
              key: "id_institucion",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_institucion",
            },
          ],
        },
        {
          table: `APS_seg_usuario_rol`,
          on: [
            {
              table: `APS_seg_usuario_rol`,
              key: "id_usuario",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_usuario",
            },
          ],
        },
      ],
      where: [
        { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
        { key: `"APS_seg_usuario_rol".id_rol`, value: id_rol },
      ],
    });

    const resultFinal = await pool
      .query(queryInstitucion)
      .then((result) => {
        if (result.rows.length >= 1) {
          return { ok: true, result: result?.rows?.[0] };
        } else {
          return { ok: false, result: result?.rows?.[0] };
        }
      })
      .catch((err) => {
        return { ok: false, err };
      });
    return resultFinal;
  };

  const cod_institucion = await institucion();

  if (cod_institucion?.err) {
    respErrorServidor500END(res, err);
    return;
  }
  if (cod_institucion.ok === false) {
    respResultadoVacio404END(
      res,
      "No existe ninguna institución para este usuario."
    );
    return;
  }
  const params = {
    where: [
      {
        key: "id_rol",
        value: id_rol,
      },
      {
        key: "cod_institucion",
        value: cod_institucion.result.codigo,
      },
      {
        key: "cargado",
        value: cargado === true || cargado === false ? cargado : true,
      },
    ],
    orderby: {
      field: "nro_carga",
    },
  };
  let query = ObtenerUltimoRegistro(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      respResultadoVacioObject200(res, result.rows);
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function UltimaCarga2(req, res) {
  const { fecha_operacion, periodicidad } = req.body;
  const { id_rol, id_usuario } = req.user;

  let query = `
  SELECT CASE 
  WHEN maxid > 0 
      THEN nro_carga 
      ELSE 0 
  END AS nroCarga, 
  CASE 
  WHEN maxid > 0 
      THEN null 
      ELSE false 
  END AS Cargado 
  FROM ( 
    SELECT coalesce(max(id_carga_archivos), 0) AS maxid 
    FROM public."APS_aud_carga_archivos_pensiones_seguros" AS pen 
    INNER JOIN "APS_seg_institucion" AS int 
    ON int.codigo = pen.cod_institucion 
    INNER JOIN "APS_seg_usuario" AS usuario 
    ON usuario.id_institucion = int.id_institucion 
    WHERE usuario.id_usuario=${id_usuario} 
    AND pen.id_periodo=${periodicidad} 
    AND pen.fecha_operacion = '${fecha_operacion}') AS max_id 
    LEFT JOIN "APS_aud_carga_archivos_pensiones_seguros" AS datos 
    ON max_id.maxid = datos.id_carga_archivos
  `;

  console.log("TEST ULTIMA CARGA", query);
  await pool
    .query(query)
    .then((result) => {
      respResultadoVacioObject200(res, result.rows[0]);
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function ReporteEnvio(req, res) {
  try {
    const { fecha, id_rol, cargado, estado, tipo } = req.body;
    const idRolFinal = id_rol ? id_rol : req.user.id_rol;
    const cargadoFinal = cargado === true || cargado === false ? cargado : null;
    const estadoFinal = isEmpty(estado) ? null : estado;

    if (Object.entries(req.body).length === 0) {
      respDatosNoRecibidos400(res);
    } else {
      const queryValida = `SELECT COUNT(*) 
      FROM public."APS_aud_valida_archivos_pensiones_seguros" 
      WHERE fecha_operacion='${fecha}' 
      AND validado=true 
      AND id_usuario IN (CAST((
        SELECT DISTINCT cod_institucion 
        FROM public."APS_aud_carga_archivos_pensiones_seguros" 
        WHERE cargado = true 
        AND fecha_operacion = '${fecha}' 
        AND id_rol = ${id_rol}) AS INTEGER))`;

      const queryValora = `SELECT COUNT(*) 
      FROM public."APS_aud_valora_archivos_pensiones_seguros" 
      WHERE fecha_operacion='${fecha}' 
      AND valorado=true 
      AND id_usuario IN (CAST((
        SELECT DISTINCT cod_institucion 
        FROM public."APS_aud_carga_archivos_pensiones_seguros" 
        WHERE cargado = true 
        AND fecha_operacion = '${fecha}' 
        AND id_rol = ${id_rol}) AS INTEGER))`;
      const params = {
        body: {
          fecha,
          idRolFinal,
        },
      };

      if (cargadoFinal !== null || estadoFinal !== null) {
        params.where = [];
      }
      if (cargadoFinal !== null) {
        params.where = [
          ...params.where,
          { key: "cargado", value: cargadoFinal },
        ];
      }
      if (estadoFinal !== null) {
        params.where = [...params.where, { key: "estado", value: estadoFinal }];
      }
      const querys = [];
      querys.push(EjecutarFuncionSQL("aps_reporte_control_envio", params));
      tipo === "validacion"
        ? querys.push(queryValida)
        : tipo === "valoracion"
        ? querys.push(queryValora)
        : null;
      tipo === "valoracion"
        ? id_rol === 10
          ? querys.push(EscogerInternoUtil("APS_view_existe_valores_seguros"))
          : id_rol === 7
          ? querys.push(EscogerInternoUtil("APS_view_existe_valores_pensiones"))
          : null
        : null;

      const results = await EjecutarVariosQuerys(querys);

      if (results.ok === null) {
        throw results.result;
      }
      if (results.ok === false) {
        throw results.errors;
      }

      respResultadoCorrectoObjeto200(res, results.result[0].data);
    }
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function Modalidades(req, res) {
  try {
    const { fecha, id_tipo_modalidad } = req.body;
    const querys = [
      EscogerInternoUtil("aps_view_modalidad_seguros", {
        select: ["*"],
        where: [{ key: "id_tipo_entidad", value: id_tipo_modalidad }],
      }),
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

async function ReporteControlEnvioPorTipoReporte(req, res) {
  try {
    const { fecha, id_rol, iid_reporte, periodo, modalidades } = req.body;
    const querys = [];
    const queryInstituciones = ListarUtil(
      id_rol === 10
        ? "aps_view_modalidad_seguros"
        : "aps_view_modalidad_pensiones",
      { activo: null }
    );
    const instituciones = await pool
      .query(queryInstituciones)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (instituciones.ok === null) throw instituciones.err;

    if (iid_reporte === 6) {
      if (!periodo) {
        respDatosNoRecibidos400(res, "No se envio la periodicidad");
        return;
      }
      // VALIDACION PRELIMINAR
      const aux = map(instituciones.result, (item) => {
        return EjecutarFuncionSQL("aps_reporte_validacion_preliminar", {
          body: { fecha, cod_institucion: item.codigo, periodo: periodo },
        });
      });
      forEach(aux, (item) => querys.push(item));
    } else if (iid_reporte === 7) {
      //VALIDACION
      // querys.push(
      //   EjecutarFuncionSQL("aps_reporte_control_envio", {
      //     body: {
      //       fecha,
      //       idRolFinal,
      //     },
      //   })
      // );
      const query = EscogerInternoUtil(
        "APS_aud_valida_archivos_pensiones_seguros",
        {
          select: ["*"],
          where: [
            { key: "fecha_operacion", value: fecha },
            {
              key: "cod_institucion",
              valuesWhereIn: map(
                instituciones.result,
                (item) => `'${item.codigo}'`
              ),
              whereIn: true,
            },
          ],
        }
      );
      querys.push(query);
    } else if (iid_reporte === 8) {
      //VALORACION
      const query = EscogerInternoUtil(
        "APS_aud_valora_archivos_pensiones_seguros",
        {
          select: ["*"],
          where: [
            { key: "fecha_operacion", value: fecha },
            {
              key: "cod_institucion",
              valuesWhereIn: map(
                instituciones.result,
                (item) => `'${item.codigo}'`
              ),
              whereIn: true,
            },
          ],
        }
      );
      querys.push(query);
    } else if (iid_reporte === 25) {
      //CUSTODIO
      const codigos = [];
      forEach(modalidades, (item) =>
        filter(item.modalidades, (modalidad) => {
          if (modalidad.esCompleto === true) {
            codigos.push(`'${modalidad.codigo}'`);
          }
        })
      );
      const paramsAux = {
        body: { fecha },
      };
      if (size(codigos) > 0) {
        paramsAux.where = [
          { key: "cod_institucion", valuesWhereIn: codigos, whereIn: true },
        ];

        const query = EjecutarFuncionSQL("aps_fun_reporte_custodio", paramsAux);
        querys.push(query);
      }
    } else if (iid_reporte === 26) {
      const query = EjecutarFuncionSQL("aps_fun_reporte_cartera_valorada", {
        body: { fecha },
      });
      querys.push(query);
    }

    querys.push(ListarUtil("APS_seg_usuario"));

    const results = await EjecutarVariosQuerys(querys);

    if (results.ok === null) throw results.result;

    if (results.ok === false) throw results.errors;

    let resultAux = [];

    forEach(results.result, (item) => {
      if (item.table !== "APS_seg_usuario") {
        resultAux = [...resultAux, ...item.data];
      }
    });
    const usuarios = find(
      results.result,
      (item) => item.table === "APS_seg_usuario"
    );

    const resultFinal = map(resultAux, (item) => {
      if (iid_reporte === 6) {
        return {
          id: item.id_carga_archivos,
          descripcion: item.descripcion,
          estado: item.resultado,
          cod_institucion: item.cod_institucion,
          fecha_operacion: item.fecha_operacion,
          nro_carga: item.nro_carga,
          fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
          usuario: item.usuario,
          id_carga_archivos: item.id_carga_archivos,
          id_rol: item.id_rol,
        };
      } else if (iid_reporte === 7) {
        return {
          id: item.id_valida_archivos,
          estado: item.validado ? "Con Éxito" : "Con Error",
          cod_institucion: item.cod_institucion,
          fecha_operacion: item.fecha_operacion,
          nro_carga: item.nro_carga,
          fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
          usuario: find(
            usuarios.data,
            (itemF) => item.id_usuario === itemF.id_usuario
          )?.usuario,
          id_valida_archivos: item.id_valida_archivos,
          id_rol: item.id_rol,
          validado: item.validado,
        };
      } else if (iid_reporte === 8) {
        return {
          id: item.id_valora_archivos,
          estado: item.valorado ? "Con Éxito" : "Con Error",
          cod_institucion: item.cod_institucion,
          fecha_operacion: item.fecha_operacion,
          nro_carga: item.nro_carga,
          fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
          usuario: find(
            usuarios.data,
            (itemF) => item.id_usuario === itemF.id_usuario
          )?.usuario,
          id_valora_archivos: item.id_valora_archivos,
          id_rol: item.id_rol,
          valorado: item.valorado,
        };
      } else if (iid_reporte === 25) {
        return {
          Código: item.cod_institucion,
          Fecha: item.fecha_informacion,
          Instrumento: item.tipo_instrumento,
          Serie: item.serie,
          Total_MO_EDV: item.total_mo_edv,
          Total_MO_APS: item.total_mo_aps,
          Diferencia_Total: item.diferencia_total,
          Cantidad_EDV: item.cantidad_edv,
          Cantidad_APS: item.cantidad_aps,
          Diferencia_Cantidad: item.diferencia_cantidad,
        };
      } else if (iid_reporte === 26) {
        return {
          Código: item.cod_institucion,
          Fecha: item.fecha_informacion,
          Instrumento: item.tipo_instrumento,
          Serie: item.serie,
          Total_MO: item.total_mo,
          Total_APS: item.total_aps,
          Diferencia_Total: item.diferencia_total,
          Cantidad: item.cantidad,
          Cantidad_APS: item.cantidad_aps,
          Diferencia_Cantidad: item.diferencia_cantidad,
        };
      }
    });
    if (iid_reporte === 25 || iid_reporte === 26) {
      if (size(resultFinal) > 0) {
        const wb = new xl.Workbook(defaultOptionsReportExcel());
        const keysResult = keys(resultFinal?.[0]);
        const { folder, nameSheet, nameExcel } = TipoReporte(iid_reporte);
        SimpleReport({
          wb,
          data: { headers: keysResult, values: resultFinal },
          nameSheet,
        });
        const pathExcel = path.join(`reports/${folder}`, nameExcel);

        wb.write(pathExcel, (err, stats) => {
          if (err) {
            respErrorServidor500END(res, err);
          } else {
            respDescargarArchivos200(res, pathExcel, nameExcel);
          }
        });
        return;
      }
      respResultadoIncorrectoObjeto200(
        res,
        null,
        resultFinal,
        "No existen registros para obtener el reporte"
      );
      return;
    }

    respResultadoCorrectoObjeto200(res, sortBy(resultFinal, ["id"]));
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ReporteControlEnvioPorTipoReporteDescargas(req, res) {
  try {
    const { fecha, id_rol, iid_reporte, periodo, modalidades } = req.body;
    const querys = [];
    const queryInstituciones = ListarUtil(
      id_rol === 10
        ? "aps_view_modalidad_seguros"
        : "aps_view_modalidad_pensiones",
      { activo: null }
    );
    const instituciones = await pool
      .query(queryInstituciones)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (instituciones.ok === null) throw instituciones.err;
    if (iid_reporte === 6) {
      if (!periodo) {
        respDatosNoRecibidos400(res, "No se envio la periodicidad");
        return;
      }
      // VALIDACION PRELIMINAR
      const aux = map(instituciones.result, (item) => {
        return EjecutarFuncionSQL("aps_reporte_validacion_preliminar", {
          body: { fecha, cod_institucion: item.codigo, periodo: periodo },
        });
      });
      forEach(aux, (item) => querys.push(item));
    } else if (iid_reporte === 7) {
      const query = EscogerInternoUtil(
        "APS_aud_valida_archivos_pensiones_seguros",
        {
          select: ["*"],
          where: [
            { key: "fecha_operacion", value: fecha },
            {
              key: "cod_institucion",
              valuesWhereIn: map(
                instituciones.result,
                (item) => `'${item.codigo}'`
              ),
              whereIn: true,
            },
          ],
        }
      );
      querys.push(query);
    } else if (iid_reporte === 8) {
      //VALORACION
      const query = EscogerInternoUtil(
        "APS_aud_valora_archivos_pensiones_seguros",
        {
          select: ["*"],
          where: [
            { key: "fecha_operacion", value: fecha },
            {
              key: "cod_institucion",
              valuesWhereIn: map(
                instituciones.result,
                (item) => `'${item.codigo}'`
              ),
              whereIn: true,
            },
          ],
        }
      );
      querys.push(query);
    } else if (iid_reporte === 25) {
      //CUSTODIO
      const codigos = [];
      forEach(modalidades, (item) =>
        filter(item.modalidades, (modalidad) => {
          if (modalidad.esCompleto === true) {
            codigos.push(`'${modalidad.codigo}'`);
          }
        })
      );
      const paramsAux = {
        body: { fecha },
      };
      if (size(codigos) > 0) {
        paramsAux.where = [
          { key: "cod_institucion", valuesWhereIn: codigos, whereIn: true },
        ];

        const query = EjecutarFuncionSQL("aps_fun_reporte_custodio", paramsAux);
        querys.push(query);
      }
    } else if (iid_reporte === 26) {
      //CARTERA VALORADA
      const codigos = [];
      forEach(modalidades, (item) =>
        filter(item.modalidades, (modalidad) => {
          if (modalidad.esCompleto === true) {
            codigos.push(`'${modalidad.codigo}'`);
          }
        })
      );
      const paramsAux = {
        body: { fecha },
      };
      if (size(codigos) > 0) {
        paramsAux.where = [
          { key: "cod_institucion", valuesWhereIn: codigos, whereIn: true },
        ];

        const query = EjecutarFuncionSQL(
          "aps_fun_reporte_cartera_valorada",
          paramsAux
        );
        querys.push(query);
      }
    }

    querys.push(ListarUtil("APS_seg_usuario"));

    const results = await EjecutarVariosQuerys(querys);

    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }

    let resultAux = [];

    forEach(results.result, (item) => {
      if (item.table !== "APS_seg_usuario") {
        resultAux = [...resultAux, ...item.data];
      }
    });
    const usuarios = find(
      results.result,
      (item) => item.table === "APS_seg_usuario"
    );

    const resultFinal = map(resultAux, (item) => {
      if (iid_reporte === 6) {
        return {
          id: item.id_carga_archivos,
          descripcion: item.descripcion,
          estado: item.resultado,
          cod_institucion: item.cod_institucion,
          fecha_operacion: item.fecha_operacion,
          nro_carga: item.nro_carga,
          fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
          usuario: item.usuario,
          id_carga_archivos: item.id_carga_archivos,
          id_rol: item.id_rol,
        };
      } else if (iid_reporte === 7) {
        return {
          id: item.id_valida_archivos,
          estado: item.validado ? "Con Éxito" : "Con Error",
          cod_institucion: item.cod_institucion,
          fecha_operacion: item.fecha_operacion,
          nro_carga: item.nro_carga,
          fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
          usuario: find(
            usuarios.data,
            (itemF) => item.id_usuario === itemF.id_usuario
          )?.usuario,
          id_valida_archivos: item.id_valida_archivos,
          id_rol: item.id_rol,
          validado: item.validado,
        };
      } else if (iid_reporte === 8) {
        return {
          id: item.id_valora_archivos,
          estado: item.valorado ? "Con Éxito" : "Con Error",
          cod_institucion: item.cod_institucion,
          fecha_operacion: item.fecha_operacion,
          nro_carga: item.nro_carga,
          fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
          usuario: find(
            usuarios.data,
            (itemF) => item.id_usuario === itemF.id_usuario
          )?.usuario,
          id_valora_archivos: item.id_valora_archivos,
          id_rol: item.id_rol,
          valorado: item.valorado,
        };
      } else if (iid_reporte === 25) {
        return {
          Código: item.cod_institucion,
          Fecha: item.fecha_informacion,
          Instrumento: item.tipo_instrumento,
          Serie: item.serie,
          Total_MO_EDV: item.total_mo_edv,
          Total_MO_APS: item.total_mo_aps,
          Diferencia_Total: item.diferencia_total,
          Cantidad_EDV: item.cantidad_edv,
          Cantidad_APS: item.cantidad_aps,
          Diferencia_Cantidad: item.diferencia_cantidad,
        };
      } else if (iid_reporte === 26) {
        return {
          Código: item.cod_institucion,
          Fecha: item.fecha_informacion,
          Instrumento: item.tipo_instrumento,
          Serie: item.serie,
          Total_MO: item.total_mo,
          Total_APS: item.total_aps,
          Diferencia_Total: item.diferencia_total,
          Cantidad: item.cantidad,
          Cantidad_APS: item.cantidad_aps,
          Diferencia_Cantidad: item.diferencia_cantidad,
        };
      }
    });
    if (iid_reporte === 25 || iid_reporte === 26) {
      if (size(resultFinal) > 0) {
        const wb = new xl.Workbook(defaultOptionsReportExcel());
        const keysResult = keys(resultFinal?.[0]);
        const { folder, nameSheet, nameExcel } = TipoReporte(iid_reporte);
        SimpleReport({
          wb,
          data: { headers: keysResult, values: resultFinal },
          nameSheet,
        });
        const pathExcel = path.join(`reports/${folder}`, nameExcel);

        wb.write(pathExcel, (err, stats) => {
          if (err) {
            respErrorServidor500END(res, err);
          } else {
            respDescargarArchivos200(res, pathExcel, nameExcel);
          }
        });
        return;
      }
      respResultadoIncorrectoObjeto200(
        res,
        null,
        resultFinal,
        "No existen registros para obtener el reporte"
      );
      return;
    }

    respResultadoCorrectoObjeto200(res, sortBy(resultFinal, ["id"]));
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ReporteReproceso(req, res) {
  try {
    const { fecha, id_rol, periodo, reproceso } = req.body;
    const queryInstituciones = ListarUtil(
      id_rol === 10
        ? "aps_view_modalidad_seguros"
        : "aps_view_modalidad_pensiones",
      { activo: null }
    );
    const instituciones = await pool
      .query(queryInstituciones)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (instituciones.ok === null) throw instituciones.err;
    if (!periodo) {
      respDatosNoRecibidos400(res, "No se envio la periodicidad");
      return;
    }
    const querys = [
      EscogerInternoUtil(nameTable, {
        select: ["*"],
        where: [
          { key: "id_periodo", valuesWhereIn: periodo, whereIn: true },
          { key: "reproceso", valuesWhereIn: reproceso, whereIn: true },
          {
            key: "cod_institucion",
            valuesWhereIn: map(
              instituciones.result,
              (item) => `'${item.codigo}'`
            ),
            whereIn: true,
          },
          { key: "fecha_operacion", value: fecha },
        ],
      }),
      ListarUtil("APS_seg_usuario"),
    ];
    const results = await EjecutarVariosQuerys(querys);

    if (results.ok === null) throw results.result;

    if (results.ok === false) throw results.errors;

    const usuarios = find(
      results.result,
      (item) => item.table === "APS_seg_usuario"
    );
    respResultadoCorrectoObjeto200(
      res,
      map(results.result[0].data, (item) => {
        return {
          id: item.id_carga_archivos,
          descripcion: item.id_periodo === 154 ? "Diaria" : "Mensual",
          estado: item.cargado ? "Con Éxito" : "Con Error",
          reproceso: item.reproceso,
          cod_institucion: item.cod_institucion,
          fecha_operacion: item.fecha_operacion,
          nro_carga: item.nro_carga,
          fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
          usuario: find(
            usuarios.data,
            (itemF) => item.id_usuario === itemF.id_usuario
          )?.usuario,
          id_carga_archivos: item.id_carga_archivos,
          id_rol: item.id_rol,
          cargado: item.cargado,
        };
      })
    );
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ReporteExito(req, res) {
  const { id_carga_archivos } = req.body;

  await pool
    .query(
      EscogerInternoUtil(nameTable, {
        select: ["*"],
        where: [
          { key: "id_carga_archivos", value: id_carga_archivos },
          { key: "cargado", value: true },
        ],
      })
    )
    .then((result) => {
      respResultadoCorrectoObjeto200(
        res,
        map(result.rows, (item) => {
          return {
            cod_institucion: item.cod_institucion,
            descripcion: "La información fue validada correctamente",
            fecha_carga: item.fecha_carga,
          };
        })
      );
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

function TipoReporte(id) {
  const ID_REPORTES = {
    25: {
      folder: "custodio",
      nameSheet: "Custodio",
      nameExcel: "Custodio Entidad.xlsx",
    },
    26: {
      folder: "cartera",
      nameSheet: "Cartera",
      nameExcel: "Cartera Valorada.xlsx",
    },
  };

  return ID_REPORTES[id];
}

function NombreReporte(req, res) {
  try {
    const { reporte } = req.body;

    respResultadoCorrectoObjeto200(
      res,
      TipoReporte(reporte)?.nameExcel || "Reporte"
    );
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function Entidades(req, res) {
  try {
    const { id_tipo_modalidad } = req.body;
    const querys = [
      EscogerInternoUtil("aps_view_modalidad_seguros", {
        select: ["*"],
        where: [{ key: "id_tipo_entidad", value: id_tipo_modalidad }],
      }),
    ];
    const results = await EjecutarVariosQuerys(querys);
    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }

    respResultadoCorrectoObjeto200(res, results.result[0].data);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function HabilitarReproceso(req, res) {
  try {
    const { fecha, periodicidad, codigo_entidad } = req.body;
    const queryUpdate = `UPDATE public."APS_aud_carga_archivos_pensiones_seguros" SET cargado = false, fecha_carga = '${moment().format(
      "YYYY-MM-DD HH:mm:ss.SSS"
    )}}', reproceso = true WHERE fecha_operacion = '${fecha}' AND id_periodo = ${periodicidad} AND cod_institucion = '${codigo_entidad}' AND cargado = true RETURNING *;`;
    console.log(queryUpdate);
    const querys = [
      queryUpdate,
      periodicidad === "154"
        ? EjecutarFuncionSQL("aps_fun_borra_tablas_diarias_seguro", {
            body: { fecha, codigo_entidad },
          })
        : EjecutarFuncionSQL("aps_fun_borra_tablas_mensuales_seguro", {
            body: { fecha, codigo_entidad },
          }),
    ];
    const results = await EjecutarVariosQuerys(querys);
    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }

    respResultadoCorrectoObjeto200(res, {
      actualizacion: results.result[0].data,
      eliminacion: results.result[1].data,
    });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//FUNCION PARA OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
async function Listar(req, res) {
  const query = ListarUtil(nameTable, { activo: null });
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
async function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
      activo: null,
    };
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
async function Escoger(req, res) {
  const body = req.body;
  const { id_rol } = req.user;
  const idRolFinal = !body?.id_rol && id_rol;

  // if (Object.entries(body).length === 0) {
  //   respDatosNoRecibidos400(res);
  // } else {
  // }
  const params = {
    body: {
      ...body,
      id_rol: !body?.id_rol ? id_rol : body.id_rol,
    },
    activo: null,
  };
  const query = EscogerUtil(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
async function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = InsertarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(
          res,
          result.rows,
          "Información guardada correctamente"
        );
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
async function Actualizar(req, res) {
  const body = req.body;

  let query = "";

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = ActualizarUtil(nameTable, params);

      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(
              res,
              result,
              "Información actualizada correctamente"
            );
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN CARGA ARCHIVO PENSIONES SEGURO
async function Deshabilitar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = DeshabilitarUtil(nameTable, params);
      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
  ValorMaximo,
  UltimaCarga,
  UltimaCarga2,
  ReporteEnvio,
  ReporteControlEnvioPorTipoReporte,
  Entidades,
  HabilitarReproceso,
  Modalidades,
  NombreReporte,
  ReporteControlEnvioPorTipoReporteDescargas,
  ReporteExito,
  ReporteReproceso,
};
