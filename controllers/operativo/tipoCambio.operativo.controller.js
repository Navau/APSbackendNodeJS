const { map } = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
} = require("../../utils/consulta.utils");

const {
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoVacio404END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_oper_tipo_cambio";
const nameTableFK1 = "APS_param_moneda";

async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable, { activo: null }),
      ListarUtil(nameTableFK1),
    ];
    const resultQuerys = await EjecutarVariosQuerys(querys);
    if (resultQuerys.ok === null) {
      throw resultQuerys.result;
    }
    if (resultQuerys.ok === false) {
      throw resultQuerys.errors;
    }
    const resultFinal = AsignarInformacionCompletaPorUnaClave(
      resultQuerys.result
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ValorMaximo(req, res) {
  const { body } = req;
  const whereFinal = [];
  map(body, (item, index) => {
    whereFinal.push({
      key: index,
      value: item,
    });
  });
  const query = ValorMaximoDeCampoUtil(nameTable, {
    fieldMax: "fecha",
    where: whereFinal,
  });

  const maxFecha = await pool
    .query(query)
    .then((result) => {
      if (!result.rows?.[0].max) {
        return { ok: false, value: result.rows[0].max };
      } else {
        return { ok: true, value: result.rows[0].max };
      }
    })
    .catch((err) => {
      return { ok: null, err };
    });

  if (maxFecha?.err) {
    respErrorServidor500END(res, maxFecha.err);
    return null;
  }
  if (maxFecha.ok === false) {
    respResultadoVacio404END(
      res,
      "No se encontró ninguna fecha para esta moneda"
    );
    return null;
  }

  respResultadoCorrectoObjeto200(res, maxFecha.value);
}

async function UltimoRegistro(req, res) {
  function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join("-") +
      " " +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(":") +
      "." +
      [padTo2Digits(date.getMilliseconds())].join()
    );
  }
  const { id_moneda } = req.body;
  const query = ValorMaximoDeCampoUtil(nameTable, {
    fieldMax: "fecha",
    where: [
      {
        key: "id_moneda",
        value: id_moneda,
      },
    ],
  });

  const maxFecha = await pool
    .query(query)
    .then((result) => {
      if (!result.rows?.[0].max) {
        return { ok: false, value: result.rows[0].max };
      } else {
        return { ok: true, value: result.rows[0].max };
      }
    })
    .catch((err) => {
      return { ok: null, err };
    });

  if (maxFecha?.err) {
    respErrorServidor500END(res, maxFecha.err);
    return null;
  }
  if (maxFecha.ok === false) {
    respResultadoVacio404END(
      res,
      "No se encontró ninguna fecha para esta moneda"
    );
    return null;
  }

  const queryLastInfo = ObtenerUltimoRegistro(nameTable, {
    where: [
      {
        key: "fecha",
        value: formatDate(maxFecha.value),
      },
      {
        key: "id_moneda",
        value: id_moneda,
      },
    ],
    orderby: {
      field: "id_tipo_cambio",
    },
  });

  const lastInfo = await pool
    .query(queryLastInfo)
    .then((result) => {
      if (result.rows.length === 0) {
        respResultadoVacio404END(
          res,
          "No se encontró ninguna fecha para esta moneda"
        );
        return null;
      } else {
        return result.rows[0];
      }
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500END(res, maxFecha.err);
      return null;
    });

  if (lastInfo === null) return null;

  respResultadoCorrectoObjeto200(res, lastInfo);
}

// OBTENER TODOS LOS TIPO CAMBIO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN TIPO CAMBIO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN TIPO CAMBIO, CON ID DEL TIPO CAMBIO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN TIPO CAMBIO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN TIPO CAMBIO
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  ValorMaximo,
  UltimoRegistro,
  ListarCompleto,
};
