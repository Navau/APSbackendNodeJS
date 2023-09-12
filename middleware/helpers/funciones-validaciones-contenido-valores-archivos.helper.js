const funcionesValidacionesContenidoValores = {
  tipoInstrumento: (params) => {
    console.log("TIPO INSTRUMENTO 1", params);
    return params;
  },
  tipoInstrumento2: (params) => {
    console.log("TIPO INSTRUMENTO 2", params);
  },
  moneda: (params) => {
    console.log("MONEDA", params);
  },
  tipoAmortizacion: (params) => {
    console.log("TIPO AMORTIZACION", params);
  },
  tipoInteres: (params) => {
    console.log("TIPO INTERES");
  },
  tipoTasa: (params) => {
    console.log("TIPO TASA");
  },
  tasaEmision: (params) => {
    console.log("TASA EMISION");
  },
  plazoEmisionTiposDeDatos: (params) => {
    console.log("PLAZO EMISION TIPO DE DATOS");
  },
  nroPago: (params) => {
    console.log("NRO PAGOS");
  },
  plazoCupon: (params) => {
    console.log("PLAZO CUPON");
  },
  prepago: (params) => {
    console.log("PREPAGO");
  },
  subordinado: (params) => {
    console.log("SUBORDINADO");
  },
  calificacion: (params) => {
    console.log("CALIFICACION");
  },
  calificadora: (params) => {
    console.log("CALIFICADORA");
  },
  custodio: (params) => {
    console.log("CUSTODIO");
  },
  pais: (params) => {
    console.log("PAIS");
  },
  emisor: (params) => {
    console.log("EMISOR");
  },
  tipoAccion: (params) => {
    console.log("TIPO ACCION");
  },
  serieEmision: (params) => {
    console.log("SERIE EMISION");
  },
  mayorACero: (params) => {
    console.log("MAYOR A CERO");
  },
  mayorIgualACero: (params) => {
    console.log("MAYOR IGUAL A CERO");
  },
  operacionMatematica: (params) => {
    console.log("OPERACION MATEMATICA");
  },
};

module.exports = {
  funcionesValidacionesContenidoValores,
};
