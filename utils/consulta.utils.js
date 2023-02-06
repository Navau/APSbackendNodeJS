const moment = require("moment");
const {
  map,
  size,
  groupBy,
  forEach,
  set,
  find,
  filter,
  split,
  isUndefined,
  isArray,
} = require("lodash");
const pool = require("../database");

//TO DO: Rehacer las consultas y verificar que cosas se usan y cuales no, para simplificar y hacer el codigo mas legible, por ejemplo en el ListarUtil

function ObtenerRolUtil(table, data, idPK) {
  let query = "";

  data &&
    (query = query + `SELECT * FROM public."${table}" WHERE activo = true`);

  query &&
    map(data, (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      if (item !== null && typeof item !== "undefined") {
        if (idPK === true) {
          if (
            index !== "nbf" &&
            index !== "exp" &&
            index !== "iat" &&
            index !== "id_rol"
          ) {
            if (typeof item === "string") {
              index && (query = query + ` AND ${index} = '${item}'`);
            } else if (typeof item === "number") {
              index && (query = query + ` AND ${index} = ${item}`);
            } else if (typeof item === "boolean") {
              index && (query = query + ` AND ${index} = ${item}`);
            }
          }
        } else if (idPK === false) {
          if (index !== "nbf" && index !== "exp" && index !== "iat") {
            if (typeof item === "string") {
              index && (query = query + ` AND ${index} = '${item}'`);
            } else if (typeof item === "number") {
              index && (query = query + ` AND ${index} = ${item}`);
            } else if (typeof item === "boolean") {
              index && (query = query + ` AND ${index} = ${item}`);
            }
          }
        }
      }
    });
  data && (query = query = query + ";");

  console.log(query);

  return query;
}

function ObtenerMenuAngUtil(data) {
  let query = "";
  let querydet = `select text, 'my_library_books' as icon, routerLink || 
  replace(replace(replace(replace(replace(text, 'á', 'a'), 'ó', 'o'), ' ', ''), 'ú', 'u'), 'í', 'i')  as routerLink 
  from (
    select DISTINCT public."APS_seg_modulo".id_modulo, public."APS_seg_tabla".orden, public."APS_seg_tabla".descripcion as text, '/' || 
    replace(replace(replace(replace(replace(
      public."APS_seg_modulo".modulo, 'á', 'a'), 'ó', 'o'), ' ', ''), 'ú', 'u'), 'í', 'i') || '/' as routerLink 
      from public."APS_seg_tabla" 
      inner join public."APS_seg_modulo" on public."APS_seg_tabla".id_modulo = public."APS_seg_modulo".id_modulo 
      inner join public."APS_seg_tabla_accion" on public."APS_seg_tabla_accion".id_tabla = public."APS_seg_tabla".id_tabla 
      inner join public."APS_seg_permiso" on public."APS_seg_permiso".id_tabla_accion = public."APS_seg_tabla_accion".id_tabla_accion 
      where public."APS_seg_permiso".activo = true AND 
      id_rol = ${data.id_rol} order by public."APS_seg_modulo".id_modulo, public."APS_seg_tabla".orden) as children`;

  query = `SELECT text, icon, children FROM (select DISTINCT modulo as text, case 
    when modulo like 'Tablas Básicas' then 'tab' 
    when modulo like 'Datos Operativos' then 'tab' 
    when modulo like 'tab' 
    then 'tab' else 'tab' end as icon, null as children, "APS_seg_modulo".orden 
    from public."APS_seg_modulo" 
    inner join public."APS_seg_tabla" 
    on public."APS_seg_modulo".id_modulo = public."APS_seg_tabla".id_modulo 
    inner join public."APS_seg_tabla_accion" 
    on public."APS_seg_tabla_accion".id_tabla = public."APS_seg_tabla".id_tabla 
    inner join public."APS_seg_permiso" 
    on public."APS_seg_permiso".id_tabla_accion = public."APS_seg_tabla_accion".id_tabla_accion 
    where public."APS_seg_modulo".activo = true and id_rol = ${data.id_rol.toString()} 
    order by "APS_seg_modulo".orden) as menu`;

  // query = `SELECT text, icon, children FROM (select DISTINCT modulo as text, case
  //   when modulo like 'Tablas Básicas' then 'view_list'
  //   when modulo like 'Datos Operativos' then 'keyboard'
  //   when modulo like 'Seguridad'
  //   then 'vpn_key' else 'tab' end as icon, null as children, "APS_seg_modulo".orden
  //   from public."APS_seg_modulo"
  //   inner join public."APS_seg_tabla"
  //   on public."APS_seg_modulo".id_modulo = public."APS_seg_tabla".id_modulo
  //   inner join public."APS_seg_tabla_accion"
  //   on public."APS_seg_tabla_accion".id_tabla = public."APS_seg_tabla".id_tabla
  //   inner join public."APS_seg_permiso"
  //   on public."APS_seg_permiso".id_tabla_accion = public."APS_seg_tabla_accion".id_tabla_accion
  //   where public."APS_seg_modulo".activo = true and id_rol = ${data.id_rol.toString()}
  //   order by "APS_seg_modulo".orden) as menu`;

  // console.log(querydet);
  // console.log(query);
  // console.log("ID ROL OBTENER MENU ANGULAR", data.id_rol);

  return {
    querydet,
    query,
  };
}

function ObtenerColumnasDeTablaUtil(table, params) {
  let query = "";
  query = `SELECT ${
    params?.select ? params.select : "*"
  } FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name  = '${table}'`;

  return query;
}

function FormatearObtenerMenuAngUtil(data) {
  // console.log(data);
  let result = data.result;
  map(data.result, (item, index) => {
    let text = item.text;
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    text = text.replace(/\s+/g, "");
    let arrayChildren = [];
    map(data.result2, (item2, index2) => {
      // console.log(item2.routerlink.split("/")[1]);
      if (item2.routerlink.split("/")[1] === text) {
        // console.log("ITEM", item);
        // console.log("ITEM2", item2);
        arrayChildren.push(item2);
      }
    });
    result = [
      ...result,
      {
        ...result[index],
        children: arrayChildren,
      },
    ];
  });
  let resultFinal = result.filter((f) => {
    return f.children !== null;
  });

  console.log("resultFinal", resultFinal);

  return resultFinal;
}

function CargarArchivoABaseDeDatosUtil(table, params) {
  let query = "";
  // console.log(params);
  if (params.action === "update") {
    console.log("UPDATE");
  } else if (params.action === "insert") {
    query = `COPY public."${table}"`;
    query && (query = query + " (");
    map(params.paramsFile.headers, (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      index && (query = query + `${index}, `);
    });
    query && (query = query.substring(0, query.length - 2));
    query && (query = query + ") ");
    query &&
      (query =
        query + `FROM '${params.paramsFile.filePath}' DELIMITER ',' CSV;`);
  }

  console.log(query);
  return query;
}

function ValorMaximoDeCampoUtil(table, params) {
  let query = "";
  query = `SELECT max(${params.fieldMax}) FROM public."${table}"`;
  if (params?.where) {
    map(params.where, (item, index) => {
      if (item?.like === true) {
        query = query + ` AND ${item.key} like '${item.value}%'`;
      } else {
        if (typeof item.value === "string") {
          query = query + ` AND ${item.key} = '${item.value}'`;
        } else if (typeof item.value === "number") {
          query = query + ` AND ${item.key} = ${item.value}`;
        } else if (typeof item.value === "boolean") {
          query = query + ` AND ${item.key} = ${item.value}`;
        }
      }
    });
  }
  if (!query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  query && (query = query + ";");
  console.log(query);
  return query;
}

function ObtenerUltimoRegistro(table, params) {
  let query = "";
  query = `SELECT * FROM public."${table}"`;
  if (params?.where) {
    map(params.where, (item, index) => {
      console.log(item);
      if (item?.like === true) {
        query = query + ` AND ${item.key} like '${item.value}%'`;
      } else {
        if (typeof item.value === "string") {
          query = query + ` AND ${item.key} = '${item.value}'`;
        } else if (typeof item.value === "number") {
          query = query + ` AND ${item.key} = ${item.value}`;
        } else if (typeof item.value === "boolean") {
          query = query + ` AND ${item.key} = ${item.value}`;
        } else {
          query = query + ` AND ${item.key} = '${item.value}'`;
        }
      }
    });
  }
  if (params?.orderby) {
    query += ` ORDER BY ${params.orderby.field} DESC LIMIT 1`;
  }
  if (!query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  query && (query = query + ";");
  console.log(query);
  return query;
}

function ResetearIDUtil(table, params) {
  let query = "";
  query = `ALTER SEQUENCE "${table}_${params.field}_seq" RESTART WITH ${params.resetValue};`;
  console.log(query);
  return query;
}

function ListarCamposDeTablaUtil(table) {
  const query = `SELECT * FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name  = '${table}'`;

  // console.log(query);

  return query;
}

function ListarUtil(table, params) {
  let query = "";
  if (params?.clasificador) {
    let indexId = table.indexOf("_", 5);
    let idTable = "id" + table.substring(indexId, table.length);
    console.log("ID", {
      idTable,
      idClasificadorComunGrupo: params.idClasificadorComunGrupo,
      valueId: params.valueId,
    });
    query = `SELECT * FROM public."APS_param_clasificador_comun"`;
    query =
      query +
      " WHERE id_clasificador_comun_grupo = " +
      params.idClasificadorComunGrupo;
    if (params?.activo !== null) {
      if (isArray(params?.activo))
        query = query + ` AND activo IN (${params.activo})`;
      else query = query + ` AND activo IN (true, false)`;
    }
  } else {
    query = `SELECT * FROM public."${table}" `;
    if (params?.activo !== null) {
      if (isArray(params?.activo))
        query = query + ` AND activo IN (${params.activo})`;
      else query = query + ` AND activo IN (true, false)`;
    }
    if (params?.idKey && params?.idValue) {
      query = query + ` WHERE ${params.idKey} = ${params.idValue}`;
    } else if (params?.whereIn) {
      let valuesAux = [];
      map(params.whereIn.values, (itemV, indexV) => {
        valuesAux.push(itemV);
      });
      query = query + ` WHERE ${params.whereIn.key} in (${valuesAux.join()})`;
    }
    query && (query = query + ";");
  }

  if (!query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, "WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }

  console.log(query);

  return query;
}

function BuscarUtil(table, params) {
  let query = "";
  params.body && (query = query + `SELECT * FROM public."${table}" `);
  if (params?.activo !== null) {
    query = query + " AND activo IN (true, false)";
  }

  query &&
    map(params.body, (item, index) => {
      // console.log(
      //   "TIPO: " + typeof item + " CLAVE:" + index + " VALOR: " + item
      // );
      index = ponerComillasACamposConMayuscula(index);
      if (item !== null && typeof item !== "undefined") {
        if (typeof item === "string") {
          index &&
            (query =
              query +
              ` AND lower(${index}::TEXT) like lower('${item}%'::TEXT)`);
        } else if (typeof item === "number") {
          index && (query = query + ` AND ${index} = ${item}`);
        } else if (typeof item === "boolean") {
          index && (query = query + ` AND ${index} = ${item}`);
        }
      }
    });
  params.body && (query = query = query + ";");

  if (!query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, "WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  console.log(query);

  return query;
}

async function BuscarDiferenteUtil(table, params) {
  let query = "";
  params.body && (query = query + `SELECT * FROM public."${table}" `);
  query = query + " WHERE activo = true";

  query &&
    map(params.body, (item, index) => {
      // console.log(
      //   "TIPO: " + typeof item + " CLAVE:" + index + " VALOR: " + item
      // );
      index = ponerComillasACamposConMayuscula(index);
      if (item !== null && typeof item !== "undefined") {
        if (typeof item === "string") {
          index &&
            (query = query + ` AND lower(${index}) not like lower('${item}%')`);
        } else if (typeof item === "number") {
          index && (query = query + ` AND ${index} <> ${item}`);
        } else if (typeof item === "boolean") {
          index && (query = query + ` AND ${index} <> ${item}`);
        }
      }
    });
  params.body && (query = query = query + ";");

  console.log(query);

  return query;
}

function EscogerLlaveClasificadorUtil(table, params) {
  let query = "";
  if (params?.idClasificadorComunGrupo) {
    query = `SELECT llave 
  FROM public."${table}" 
  WHERE id_clasificador_comun_grupo = ${params?.idClasificadorComunGrupo}`;
  } else {
    query = null;
  }
  // Posibles Resultados:
  // --1 = id_bolsa
  // --2 = id_calificacion_seg
  // --3 = id_calificacion_cuota
  // --4 = id_calificacion
  // --5 = id_calificacion_rvariable
  // --6 = id_calificacion_rdeuda
  // --7 = id_calificadora_rnacional
  // --8 = id_calificadora_nrsro
  // --10 = id_tipo_mercado
  // --11 = id_g_tipo_instrumento
  // --12 = id_tipo_renta
  // --13 = id_fondo_inv
  // --14 = id_tipo_lugar_negociacion
  // --15 = id_tipo_cuenta
  // --16 = id_tipo_tasa
  // --17 = id_periodo_envio
  // --18 = id_tendencia_mercado
  // --19 = id_custodia
  // --20 = id_prepago
  // --21 = id_subordinado
  // --22 = id_tipo_valuacion
  // --23 = id_tipo_interes
  // --24 = id_periodo_vencimiento
  // --25 = id_tipo_amortizacion
  // --26 = id_tipo_entidad
  // --27 = id_sector_economico_grupo
  // --28 = id_tipo_accion
  // --29 = id_tipo_rpt

  console.log("QUERY LLAVE", query);

  return query;
}

function EscogerUtil(table, params) {
  let query = "";
  if (params?.clasificador) {
    let indexId = table.indexOf("_", 5);
    let idTable = "id" + table.substring(indexId, table.length);
    console.log("ID", {
      idTable,
      idClasificadorComunGrupo: params.idClasificadorComunGrupo,
      valueId: params.valueId,
    });

    query = `SELECT ${idTable} AS ${params.valueId}, 
    id_clasificador_comun_grupo, descripcion, sigla,
    es_sistema, activo, id_usuario
    FROM public."APS_param_clasificador_comun" 
    WHERE ${idTable}_grupo = ${params.idClasificadorComunGrupo}`;

    query = query + " AND activo = true;";
  } else {
    params.body && (query = query + `SELECT * FROM public."${table}" `);
    if (params?.activo !== null) {
      query = query + " AND activo IN (true, false)";
    }

    query &&
      map(params.body, (item, index) => {
        index = ponerComillasACamposConMayuscula(index);
        if (item !== null && typeof item !== "undefined") {
          if (params?.whereIn) {
            let valuesAux = [];
            map(params.whereIn.values, (itemV, indexV) => {
              valuesAux.push(itemV);
            });
            query =
              query + ` AND ${params.whereIn.key} in (${valuesAux.join()})`;
          } else {
            if (item instanceof Date) {
              index &&
                (query =
                  query +
                  ` AND ${index} = '${moment(item).format(
                    "YYYY-MM-DD HH:mm:ss.SSS"
                  )}'`);
            } else if (Array.isArray(item)) {
              index && (query = query + ` AND ${index} IN (${item.join()})`);
            } else if (typeof item === "string") {
              if (index === "password") {
                index &&
                  (query =
                    query + ` AND ${index} = crypt('${item}',gen_salt('bf'))`);
              } else if (index === "fecha_activo") {
                index &&
                  (query =
                    query +
                    ` AND ${index} = '${moment(item).format(
                      "YYYY-MM-DD HH:mm:ss.SSS"
                    )}'`);
              } else {
                index && (query = query + ` AND ${index} = '${item}'`);
              }
            } else if (typeof item === "number") {
              index && (query = query + ` AND ${index} = ${item}`);
            } else if (typeof item === "boolean") {
              index && (query = query + ` AND ${index} = ${item}`);
            }
          }
        }
      });

    if (!query.includes("WHERE")) {
      let queryAux = query.split("");
      queryAux.splice(query.indexOf(" AND"), 0, "WHERE");
      queryAux.splice(query.indexOf("AND"), 4);
      queryAux.join("");
      query = queryAux.join("");
    }

    params.body && (query = query = query + ";");
  }

  console.log(query);

  return query;
}

function EscogerInternoUtil(table, params) {
  let query = "";
  let blockAux = false;
  const whereFunction = (item, block) => {
    const operatorSQL = item?.operatorSQL ? item.operatorSQL : "AND";
    if (blockAux === false) {
      query =
        query + ` ${block === true ? `${operatorSQL} (` : `${operatorSQL}`}`;
      blockAux = true;
    } else {
      query = query + ` ${operatorSQL}`;
    }
    if (item?.like === true) {
      query = query + ` ${item.key} like '${item.value}%'`;
    } else if (item?.whereIn === true) {
      const searchCriteriaWhereIn = item?.searchCriteriaWhereIn
        ? item.searchCriteriaWhereIn
        : "IN";
      let valuesAux = [];
      map(item.valuesWhereIn, (itemV, indexV) => {
        valuesAux.push(itemV);
      });
      query =
        query +
        ` ${item.key} ${searchCriteriaWhereIn} (${valuesAux.join(", ")})`;
    } else {
      if (typeof item.value === "string") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} '${
            item.value
          }'`;
      } else if (typeof item.value === "number") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} ${item.value}`;
      } else if (typeof item.value === "boolean") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} ${item.value}`;
      }
    }
  };
  query = `SELECT ${params?.select ? params.select.join(", ") : "*"} FROM ${
    table !== "INFORMATION_SCHEMA.COLUMNS" &&
    table !== "INFORMATION_SCHEMA.TABLES"
      ? `public."${table}"`
      : `${table}`
  }`;
  if (params?.innerjoin) {
    const innerjoin = params.innerjoin;

    map(innerjoin, (item, index) => {
      query += ` INNER JOIN "${item.table}"`;
      query += ` ON "${item.on[0].table}".${item.on[0].key} = "${item.on[1].table}".${item.on[1].key}`;
    });
  }
  if (params?.where) {
    const where = params.where;
    map(where, (item, index) => {
      blockAux = false;
      if (item?.block) {
        map(item.block, (itemB, indexB) => {
          whereFunction(itemB, true);
        });
        query = query + ")";
      } else {
        whereFunction(item, false);
      }
    });
  }
  if (params?.orderby) {
    query += ` ORDER BY ${params.orderby.field}`;
  }
  if (params?.where && !query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  query && (query = query + ";");
  console.log(query);
  return query;
}

function EjecutarFuncionSQL(functionName, params) {
  let query = "";
  query += `SELECT * FROM public.${functionName}(`;
  const whereFunction = (item, block) => {
    const operatorSQL = item?.operatorSQL ? item.operatorSQL : "AND";
    if (blockAux === false) {
      query =
        query + ` ${block === true ? `${operatorSQL} (` : `${operatorSQL}`}`;
      blockAux = true;
    } else {
      query = query + ` ${operatorSQL}`;
    }
    if (item?.like === true) {
      query = query + ` ${item.key} like '${item.value}%'`;
    } else if (item?.whereIn === true) {
      const searchCriteriaWhereIn = item?.searchCriteriaWhereIn
        ? item.searchCriteriaWhereIn
        : "IN";
      let valuesAux = [];
      map(item.valuesWhereIn, (itemV, indexV) => {
        valuesAux.push(itemV);
      });
      query =
        query +
        ` ${item.key} ${searchCriteriaWhereIn} (${valuesAux.join(", ")})`;
    } else {
      if (typeof item.value === "string") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} '${
            item.value
          }'`;
      } else if (typeof item.value === "number") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} ${item.value}`;
      } else if (typeof item.value === "boolean") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} ${item.value}`;
      }
    }
  };

  map(params.body, (item, index) => {
    if (item instanceof Date) {
      query += `'${moment(item).format("YYYY-MM-DD")}, '`;
    } else if (typeof item === "string") {
      query += `'${item}', `;
    } else if (typeof item === "number") {
      query += `${item}, `;
    } else if (typeof item === "boolean") {
      query += `${item}, `;
    }
  });
  query = query.substring(0, query.length - 2);
  query && (query = query + ")");

  if (params?.innerjoin) {
    const innerjoin = params.innerjoin;

    map(innerjoin, (item, index) => {
      query += ` INNER JOIN "${item.table}"`;
      query += ` ON"${item.on[0].table}".${item.on[0].key} = "${item.on[1].table}".${item.on[1].key}`;
    });
  }
  if (params?.where) {
    const where = params.where;
    map(where, (item, index) => {
      blockAux = false;
      if (item?.block) {
        map(item.block, (itemB, indexB) => {
          whereFunction(itemB, true);
        });
        query = query + ")";
      } else {
        whereFunction(item, false);
      }
    });
  }
  if (params?.orderby) {
    query += ` ORDER BY ${params.orderby.field}`;
  }
  if (params?.where && !query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  query && (query = query + ";");
  console.log(query);
  return query;
}

function EjecutarProcedimientoSQL(procedureName, params) {
  let query = "";
  query += `CALL ${procedureName}(`;
  const whereFunction = (item, block) => {
    const operatorSQL = item?.operatorSQL ? item.operatorSQL : "AND";
    if (blockAux === false) {
      query =
        query + ` ${block === true ? `${operatorSQL} (` : `${operatorSQL}`}`;
      blockAux = true;
    } else {
      query = query + ` ${operatorSQL}`;
    }
    if (item?.like === true) {
      query = query + ` ${item.key} like '${item.value}%'`;
    } else if (item?.whereIn === true) {
      const searchCriteriaWhereIn = item?.searchCriteriaWhereIn
        ? item.searchCriteriaWhereIn
        : "IN";
      let valuesAux = [];
      map(item.valuesWhereIn, (itemV, indexV) => {
        valuesAux.push(itemV);
      });
      query =
        query +
        ` ${item.key} ${searchCriteriaWhereIn} (${valuesAux.join(", ")})`;
    } else {
      if (typeof item.value === "string") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} '${
            item.value
          }'`;
      } else if (typeof item.value === "number") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} ${item.value}`;
      } else if (typeof item.value === "boolean") {
        query =
          query +
          ` ${item.key} ${item?.operator ? item.operator : "="} ${item.value}`;
      }
    }
  };

  map(params.body, (item, index) => {
    if (item instanceof Date) {
      query += `'${moment(item).format("YYYY-MM-DD")}, '`;
    } else if (typeof item === "string") {
      query += `'${item}', `;
    } else if (typeof item === "number") {
      query += `${item}, `;
    } else if (typeof item === "boolean") {
      query += `${item}, `;
    }
  });
  query = query.substring(0, query.length - 2);
  query && (query = query + ")");

  if (params?.innerjoin) {
    const innerjoin = params.innerjoin;

    map(innerjoin, (item, index) => {
      query += ` INNER JOIN "${item.table}"`;
      query += ` ON"${item.on[0].table}".${item.on[0].key} = "${item.on[1].table}".${item.on[1].key}`;
    });
  }
  if (params?.where) {
    const where = params.where;
    map(where, (item, index) => {
      blockAux = false;
      if (item?.block) {
        map(item.block, (itemB, indexB) => {
          whereFunction(itemB, true);
        });
        query = query + ")";
      } else {
        whereFunction(item, false);
      }
    });
  }
  if (params?.orderby) {
    query += ` ORDER BY ${params.orderby.field}`;
  }
  if (params?.where && !query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  query && (query = query + ";");
  console.log(query);
  return query;
}

function InsertarUtil(table, params) {
  let query = "";
  params.body && (query = query + `INSERT INTO public."${table}"`);
  query && (query = query + " (");

  let idAux = ValidarIDActualizarUtil(table, params.body, params?.newID);

  query &&
    map(params.body, (item, index) => {
      if (idAux.idKey !== index) {
        index = ponerComillasACamposConMayuscula(index);
        index && (query = query + `${index}, `);
      }
    });

  query && (query = query.substring(0, query.length - 2));
  query && (query = query + ") VALUES (");

  map(params.body, (item, index) => {
    if (idAux.idKey !== index) {
      if (item instanceof Date) {
        index &&
          (query =
            query + `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
      } else {
        if (typeof item === "string") {
          if (index === "password") {
            index && (query = query + `crypt('${item}', gen_salt('bf')), `);
          } else if (
            index === "fecha_activo" ||
            index === "fecha_emision" ||
            index === "fecha_vencimiento" ||
            index === "vencimiento_1er_cupon"
          ) {
            index &&
              (query =
                query +
                `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
          } else {
            index && (query = query + `'${item}', `);
          }
        } else if (typeof item === "number") {
          index && (query = query + `${item}, `);
        } else if (typeof item === "boolean") {
          index && (query = query + `${item}, `);
        } else if (typeof item === "object" && item === null) {
          index && (query = query + `${item}, `);
        } else {
          if (index === "fecha_activo") {
            index &&
              (query =
                query +
                `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
          } else {
            index && (query = query + `'${item}', `);
          }
        }
      }
    }
  });

  query && (query = query.substring(0, query.length - 2));

  query && (query = query + ")");

  params?.returnValue && (query = query = query + ` RETURNING `);

  map(params.returnValue, (item, index) => {
    query = query + `${item},`;
  });

  params?.returnValue && (query = query.substring(0, query.length - 1));

  params.body && (query = query = query + ";");

  console.log(query);
  return query;
}

function InsertarVariosUtil(table, params) {
  let query = "";
  params.body && (query = query + `INSERT INTO public."${table}"`);
  query && (query = query + " (");
  query &&
    map(params.body[0], (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      index && (query = query + `${index}, `);
    });

  query && (query = query.substring(0, query.length - 2));
  query && (query = query + ") VALUES (");

  map(params.body, (item2, index2) => {
    map(item2, (item, index) => {
      if (item instanceof Date) {
        index &&
          (query =
            query + `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
      } else if (item?.toString()?.includes("$2a$")) {
        // index && (query = query + `crypt('${item}', ${index}), `);
      } else {
        if (typeof item === "string") {
          if (index === "password") {
            index && (query = query + `crypt('${item}', gen_salt('bf')), `);
          } else if (
            index === "fecha_activo" ||
            index === "fecha_emision" ||
            index === "fecha_vencimiento" ||
            index === "vencimiento_1er_cupon"
          ) {
            index &&
              (query =
                query +
                `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
          } else {
            index && (query = query + `'${item}', `);
          }
        } else if (typeof item === "number") {
          index && (query = query + `${item}, `);
        } else if (typeof item === "boolean") {
          index && (query = query + `${item}, `);
        } else if (typeof item === "object" && item === null) {
          index && (query = query + `${item}, `);
        } else {
          if (index === "fecha_activo") {
            index &&
              (query =
                query +
                `'${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}', `);
          } else {
            index && (query = query + `'${item}', `);
          }
        }
      }
    });
    query && (query = query.substring(0, query.length - 2));

    query && (query = query + "),(");
  });
  query && (query = query.substring(0, query.length - 2));

  params?.returnValue && (query = query = query + ` RETURNING `);

  map(params.returnValue, (item, index) => {
    query = query + `${item},`;
  });

  query && (query = query.substring(0, query.length - 1));

  params.body && (query = query = query + ";");

  // console.log(query);

  return query;
}

function ActualizarUtil(table, params) {
  let query = "";

  delete params.body[params.idKey];

  params.body && (query = query + `UPDATE public."${table}" SET`);
  query &&
    map(params.body, (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      if (item instanceof Date) {
        index &&
          (query =
            query +
            ` ${index} = '${moment(item).format("YYYY-MM-DD HH:mm:ss.SSS")}',`);
      } else if (typeof item === "string") {
        if (index === "password") {
          index &&
            (query = query + ` ${index} = crypt('${item}',gen_salt('bf')),`);
        } else if (
          index === "fecha_activo" ||
          index === "fecha_emision" ||
          index === "fecha_vencimiento" ||
          index === "vencimiento_1er_cupon"
        ) {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      } else if (typeof item === "number") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "boolean") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "object" && item === null) {
        index && (query = query + ` ${index} = ${item},`);
      } else {
        if (index === "fecha_activo") {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      }
    });

  query = query.substring(0, query.length - 1);

  params.idKey &&
    (query = query + ` WHERE ${params.idKey} = '${params.idValue}'`);

  params?.returnValue && (query = query = query + ` RETURNING `);

  map(params.returnValue, (item, index) => {
    query = query + `${item},`;
  });

  params?.returnValue && (query = query.substring(0, query.length - 1));

  params.body && (query = query = query + ";");
  console.log(query);

  return query;
}

function DeshabilitarUtil(table, params) {
  let query = "";

  delete params.body[params.idKey];

  params.body && (query = query + `UPDATE public."${table}" SET`);
  query &&
    map(params.body, (item, index) => {
      index = ponerComillasACamposConMayuscula(index);
      if (typeof item === "string") {
        if (index === "password") {
          index &&
            (query = query + ` ${index} = crypt('${item}',gen_salt('bf')),`);
        } else if (index === "fecha_activo") {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      } else if (typeof item === "number") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "boolean") {
        index && (query = query + ` ${index} = ${item},`);
      } else if (typeof item === "object" && item === null) {
        index && (query = query + ` ${index} = ${item},`);
      } else {
        if (index === "fecha_activo") {
          index &&
            (query =
              query +
              ` ${index} = '${moment(item).format(
                "YYYY-MM-DD HH:mm:ss.SSS"
              )}',`);
        } else {
          index && (query = query + ` ${index} = '${item}',`);
        }
      }
    });

  query = query.substring(0, query.length - 1);

  params.idKey &&
    (query = query + ` WHERE ${params.idKey} = '${params.idValue}';`);

  console.log(query);

  return query;
}

function EliminarUtil(table, params) {
  let query = "";
  params?.where && (query = query + `DELETE FROM public."${table}"`);

  if (params?.where) {
    map(params.where, (item, index) => {
      if (typeof item === "string") {
        query = query + ` AND ${index} = '${item}'`;
      } else if (typeof item === "number") {
        query = query + ` AND ${index} = ${item}`;
      } else if (typeof item === "boolean") {
        query = query + ` AND ${index} = ${item}`;
      }
    });
  }
  if (!query.includes("WHERE")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  query && (query = query + ";");

  console.log(query);
  return query;
}

function EliminarMultiplesTablasUtil(tables, params) {
  let querys = [];
  let queryFinal = "";
  map(tables, (item, index) => {
    let query = `DELETE FROM public."${item}"`;
    if (params?.where) {
      const where = params.where;
      map(where, (item, index) => {
        if (item?.like === true) {
          query = query + ` AND ${item.key} like '${item.value}%'`;
        } else if (item?.whereIn === true) {
          let valuesAux = [];
          map(item.valuesWhereIn, (itemV, indexV) => {
            valuesAux.push(itemV);
          });
          query = query + ` AND ${item.key} in (${valuesAux.join(", ")})`;
        } else {
          if (typeof item.value === "string") {
            query =
              query +
              ` AND ${item.key} ${item?.operator ? item.operator : "="} '${
                item.value
              }'`;
          } else if (typeof item.value === "number") {
            query =
              query +
              ` AND ${item.key} ${item?.operator ? item.operator : "="} ${
                item.value
              }`;
          } else if (typeof item.value === "boolean") {
            query =
              query +
              ` AND ${item.key} ${item?.operator ? item.operator : "="} ${
                item.value
              }`;
          }
        }
      });
    }
    if (params?.where && !query.includes("WHERE") && query.includes("AND")) {
      let queryAux = query.split("");
      queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
      queryAux.splice(query.indexOf("AND"), 4);
      queryAux.join("");
      query = queryAux.join("");
    }
    query && (query = query + ";");
    querys.push(query);
  });

  map(querys, (item, index) => {
    queryFinal += `${item} \r\n`;
  });

  // console.log(querys);
  console.log(queryFinal);
  return queryFinal;
}

function AlterarSequenciaMultiplesTablasUtil(sequences, params) {
  let querys = [];
  let queryFinal = "";

  map(sequences, (item, index) => {
    let query = `ALTER SEQUENCE "${item.table}_${item.id}_seq"`;
    if (params?.restartValue) {
      query += ` RESTART WITH ${params.restartValue[index]}`;
    }
    query && (query = query + ";");
    querys.push(query);
  });

  map(querys, (item, index) => {
    queryFinal += `${item} \r\n`;
  });

  // console.log(querys);
  console.log(queryFinal);
  return queryFinal;
}

function AlterarSequenciaUtil(sequence, params) {
  let query = `ALTER SEQUENCE "${sequence.table}_${sequence.id}_seq"`;
  if (params?.restartValue) {
    query += ` RESTART WITH ${params.restartValue}`;
  }
  query && (query = query + ";");

  // console.log(querys);
  console.log(query);
  return query;
}

function ValorMaximoDeCampoMultiplesTablasUtil(tables, params) {
  let querys = [];
  let queryFinal = "";

  map(tables, (item, index) => {
    let query = `SELECT max(${params.fieldMax[index]}) FROM public."${item}"`;
    if (params?.where) {
      map(params.where, (item, index) => {
        if (item?.like === true) {
          query = query + ` AND ${item.key} like '${item.value}%'`;
        } else {
          if (typeof item.value === "string") {
            query = query + ` AND ${item.key} = '${item.value}'`;
          } else if (typeof item.value === "number") {
            query = query + ` AND ${item.key} = ${item.value}`;
          } else if (typeof item.value === "boolean") {
            query = query + ` AND ${item.key} = ${item.value}`;
          }
        }
      });
    }
    if (!query.includes("WHERE") && query.includes("AND")) {
      let queryAux = query.split("");
      queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
      queryAux.splice(query.indexOf("AND"), 4);
      queryAux.join("");
      query = queryAux.join("");
    }
    query && (query = query + ";");
    querys.push(query);
  });
  map(querys, (item, index) => {
    queryFinal += `${item} \r\n`;
  });

  // console.log(querys);
  console.log(queryFinal);
  return queryFinal;
}

function VerificarPermisoUtil(table, params) {
  let query = "";
  query += `SELECT * FROM public."${table}"`;

  if (params?.where) {
    map(params.where, (item, index) => {
      if (item?.like === true) {
        query = query + ` AND ${item.key} like '${item.value}%'`;
      } else {
        if (typeof item.value === "string") {
          query = query + ` AND ${item.key} = '${item.value}'`;
        } else if (typeof item.value === "number") {
          query = query + ` AND ${item.key} = ${item.value}`;
        } else if (typeof item.value === "boolean") {
          query = query + ` AND ${item.key} = ${item.value}`;
        }
      }
    });
  }
  if (!query.includes("WHERE") && query.includes("AND")) {
    let queryAux = query.split("");
    queryAux.splice(query.indexOf(" AND"), 0, " WHERE");
    queryAux.splice(query.indexOf("AND"), 4);
    queryAux.join("");
    query = queryAux.join("");
  }
  query && (query = query + ";");
  console.log(query);
  return query;
}

//TO DO: Cambiar el nombre de ValidarIDActualizarUtil a infoIDPorTabla, y reorganizarlo en otro archivo
function ValidarIDActualizarUtil(nameTable, body, newID) {
  let indexId = nameTable.indexOf("_", 5);
  let idKey = newID
    ? newID
    : "id" + nameTable.substring(indexId, nameTable.length);
  let idOk = false;
  let idValue = null;

  forEach(body, (item, index) => {
    if (idKey === index && (item || item === 0)) {
      idOk = true;
      idValue = item;
      return;
    }
  });

  return {
    idOk,
    idKey,
    idValue,
  };
}

function ObtenerIDDeTabla(nameTable, data, newID) {
  let indexId = nameTable.indexOf("_", 5);
  let idKey = newID
    ? newID
    : "id" + nameTable.substring(indexId, nameTable.length);
  let idOk = false;
  let idValue = null;

  map(data, (item, index) => {
    if (idKey === index && item) {
      idOk = true;
      idValue = item;
      return;
    }
  });

  return {
    idOk,
    idKey,
    idValue,
  };
}

function ponerComillasACamposConMayuscula(index) {
  let auxArreglarMayuscula = false;
  let comilla = '"';
  map(index, (itemStr, indexStr) => {
    if (
      index.charAt(indexStr) === index.charAt(indexStr).toUpperCase() &&
      itemStr !== "_" &&
      auxArreglarMayuscula === false
    ) {
      index = comilla + index + comilla;
      index = index.slice(0, index.length);
      auxArreglarMayuscula = true;
      return;
    }
  });
  return index;
}

async function ObtenerInstitucion(user) {
  const { id_usuario, id_rol } = user;
  const queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
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
      if (result.rowCount >= 1) {
        return { ok: true, result: result?.rows?.[0] };
      } else {
        return { ok: false, result: result?.rows?.[0] };
      }
    })
    .catch((err) => {
      return { ok: false, err };
    });
  return resultFinal;
}

async function ObtenerUsuario(user) {
  const { id_usuario } = user;
  const queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
    select: [`*`],
    where: [{ key: `"APS_seg_usuario".id_usuario`, value: id_usuario }],
  });

  const resultFinal = await pool
    .query(queryInstitucion)
    .then((result) => {
      if (result.rowCount >= 1) {
        return { ok: true, result: result?.rows };
      } else {
        return { ok: false, result: result?.rows };
      }
    })
    .catch((err) => {
      return { ok: false, err };
    });
  return resultFinal;
}

async function ObtenerUsuariosPorRol(user) {
  const { id_rol } = user;
  const query = EscogerInternoUtil("APS_seg_usuario", {
    select: [`*`],
    innerjoin: [
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
      {
        table: `APS_seg_rol`,
        on: [
          {
            table: `APS_seg_rol`,
            key: "id_rol",
          },
          {
            table: `APS_seg_usuario_rol`,
            key: "id_rol",
          },
        ],
      },
    ],
    where: [{ key: `"APS_seg_usuario_rol".id_rol`, value: id_rol }],
  });

  const resultFinal = await pool
    .query(query)
    .then((result) => {
      if (result.rowCount >= 1) {
        return { ok: true, result: result?.rows };
      } else {
        return { ok: false, result: result?.rows };
      }
    })
    .catch((err) => {
      return { ok: false, err };
    });
  return resultFinal;
}

async function EjecutarVariosQuerys(querys = [], newID, newTable) {
  if (size(querys) < 0) return null;
  const resultFinal = [];
  const errors = [];
  let counterAux = 0;
  for await (const query of querys) {
    const table = query;
    const y = table.indexOf("FROM");
    const z = table.substring(y, table.indexOf(`"`));
    const w = table.substring(
      table.lastIndexOf(z[z.length - 1]) + 2,
      table.length
    );
    const v = w.substring(0, w.indexOf(`"`));
    await pool
      .query(query)
      .then((result) => {
        resultFinal.push({
          data: result.rows,
          table: newTable?.[counterAux] ? newTable[counterAux] : v,
          order: counterAux,
          fields: map(result?.fields, (field) => field.name),
          id:
            newID?.order === counterAux
              ? newID?.id
              : ObtenerIDDeTabla(v, result.rows)?.idKey,
        });
      })
      .catch((err) => {
        errors.push({
          err,
          message: err?.message,
          table: v,
          order: counterAux,
        });
      })
      .finally(() => {
        counterAux += 1;
      });
  }
  // const groupByTableResultFinal = groupBy(resultFinal, (item) => item.table);
  if (size(errors) > 0) return { ok: false, errors };
  if (size(resultFinal) > 0) return { ok: true, result: resultFinal };
  return { ok: null, result: [errors, resultFinal] };
}

async function EjecutarQuerysReportes(opciones = {}, tipoReporte) {
  if (size(opciones) < 0)
    return {
      ok: null,
      result: "No se envio ninguna opcion para obtener el reporte",
    };
  const resultFinal = [];
  const errors = [];
  const TIPOS_REPORTES = {
    ESTADISTICOS: async () => {
      let counterAux = 0;
      for await (const opcion of opciones) {
        counterAux = 0;
        for await (const item of opcion) {
          await pool
            .query(item.query)
            .then((result) => {
              resultFinal.push({
                id: item.id,
                name: item.header.name,
                mainValuesAux: item.mainValuesAux,
                header: item.header,
                fun: item.fun,
                table: item.header.tables[counterAux],
                fields: map(result?.fields, (field) => field.name),
                data: result.rows,
              });
            })
            .catch((err) => {
              errors.push({
                err,
                message: err?.message,
                table: item.fun,
              });
            })
            .finally(() => {
              counterAux += 1;
            });
        }
      }
      if (size(errors) > 0) return { ok: false, result: errors };
      if (size(resultFinal) > 0)
        return {
          ok: true,
          result: groupBy(
            resultFinal,
            (item) => `${item.id}(-separador-)${item.name}`
          ),
        };
      return { ok: null, result: [errors, resultFinal] };
    },
  };

  return await TIPOS_REPORTES[tipoReporte]();
}

function AsignarInformacionCompletaPorUnaClave(result, options) {
  let newResult = result;
  let indexAux = 0;
  if (size(options) > 0) {
    forEach(options, (option) => {
      const itemChange = find(
        newResult,
        (item, index) => {
          if (option.table === item.table) {
            indexAux = index;
            return true;
          }
        },
        indexAux + 1
      );
      if (!isUndefined(itemChange)) {
        const item = newResult[indexAux];
        set(item, "id_new", option.key);
        forEach(item.data, (itemAux) => {
          const valueIdAux = isUndefined(itemAux[item.id])
            ? itemAux[item.id_new]
            : itemAux[item.id];
          !(option.key in itemAux) ? (itemAux[option.key] = valueIdAux) : "";
          delete itemAux[item.id];
        });
      }
    });
  }

  const main = newResult?.[0];
  forEach(newResult, (itemResult) => {
    const idFind = itemResult?.id_new ? itemResult.id_new : itemResult.id;
    if (itemResult.table !== main.table) {
      forEach(main.data, (itemMain) => {
        // console.log("itemMain", itemMain);
        // console.log("itemResult", itemResult);
        const findValue = find(itemResult.data, (itemFind) => {
          // console.log("itemFind", itemFind);
          // console.log("itemMain", itemMain);
          if (itemFind[idFind] === itemMain[idFind]) return true;
        });
        // set(itemMain, idFind, findValue);
        // console.log(findValue);
        let x = "";
        forEach(split(idFind, "_"), (itemSplit, indexSplit) => {
          indexSplit > 0 ? (x += `_${itemSplit}`) : (x += "");
        });
        // !([`data${x}`] in itemMain)
        // ? (itemMain[`data${x}`] = isUndefined(findValue) ? null : findValue)
        // : "";
        forEach(findValue, (itemAux, indexAux) => {
          const nameIndex = `${x}_${indexAux}`;
          !([nameIndex] in itemMain)
            ? (itemMain[nameIndex] = isUndefined(itemAux) ? null : itemAux)
            : "";
        });
      });
    }
  });
  return main?.data || [];
}

module.exports = {
  ListarUtil,
  ListarCamposDeTablaUtil,
  BuscarUtil,
  BuscarDiferenteUtil,
  EscogerUtil,
  EscogerInternoUtil,
  EscogerLlaveClasificadorUtil,
  InsertarUtil,
  InsertarVariosUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  EliminarUtil,
  ValidarIDActualizarUtil,
  ObtenerRolUtil,
  ValorMaximoDeCampoUtil,
  ResetearIDUtil,
  ObtenerMenuAngUtil,
  FormatearObtenerMenuAngUtil,
  CargarArchivoABaseDeDatosUtil,
  ObtenerColumnasDeTablaUtil,
  ObtenerUltimoRegistro,
  VerificarPermisoUtil,
  EliminarMultiplesTablasUtil,
  AlterarSequenciaMultiplesTablasUtil,
  AlterarSequenciaUtil,
  ValorMaximoDeCampoMultiplesTablasUtil,
  ObtenerInstitucion,
  EjecutarFuncionSQL,
  ObtenerUsuario,
  ObtenerUsuariosPorRol,
  EjecutarProcedimientoSQL,
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
  EjecutarQuerysReportes,
};
