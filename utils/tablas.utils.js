const { forEach, includes, isEmpty, split, isEqual, find } = require("lodash");
const pool = require("../database");
const { EscogerInternoUtil } = require("./consulta.utils");
const {
  respErrorServidor500END,
  respResultadoIncorrectoObjeto200,
  respResultadoCorrectoObjeto200,
  respUsuarioNoAutorizado,
} = require("./respuesta.utils");

async function obtenerTablaPorRutaPrincipal(res, mainRoute, section) {
  const query = EscogerInternoUtil("APS_seg_tabla", {
    select: ["*"],
    where: [{ key: "activo", value: true }],
    orderby: {
      field: "orden",
    },
  });
  const tables = await pool
    .query(query)
    .then((result) => {
      if (result.rowCount > 0) {
        return { ok: true, result: result.rows };
      } else {
        return { ok: false, result: result.rows };
      }
    })
    .catch((err) => {
      return { ok: null, err };
    });

  if (tables?.err) {
    respErrorServidor500END(res, tables.err);
    return;
  }
  if (tables.ok === false) {
    respResultadoIncorrectoObjeto200(res, null, tables.result);
    return;
  }

  const sectionBasicTables =
    section === "seguridad"
      ? "seg"
      : section === "auditoria"
      ? "aud"
      : section === "operativo"
      ? "oper"
      : section === "paramatro"
      ? "param"
      : "";

  if (isEmpty(sectionBasicTables)) {
    return null;
  }

  const tableFinal = find(tables.result, (item) => {
    const tableName = split(item.tabla, "APS_")?.[1]?.toLowerCase();
    const routeName = `${sectionBasicTables.toLowerCase()}_${mainRoute.toLowerCase()}`;
    if (isEqual(tableName, routeName)) {
      return true;
    }
  });
  return tableFinal;
}

module.exports = {
  obtenerTablaPorRutaPrincipal,
};
