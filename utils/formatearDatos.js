const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/La_Paz");
const { map, forEach, split, trim, parseInt, replace } = require("lodash");

function formatearFechaDeInformacion(data) {
  const resultFinal = data;
  forEach(data, (item, index) => {
    if (typeof item === "object") {
      forEach(item, (item2, index2) => {
        if (index2.includes("fecha")) {
          resultFinal[index] = {
            ...item,
            [index2]: dayjs(item2).add(-4, "hours"),
          };
        }
      });
    }
  });
  return resultFinal;
}

function separarStringCamelCasePorCaracter(string, characterSplit) {
  let stringFinal = "";
  for (let i = 0; i < string.length; i++) {
    const item = i !== 0 ? string[i] : string[i].toLowerCase();
    if (item === item.toUpperCase()) {
      stringFinal += characterSplit + item;
    } else {
      stringFinal += item;
    }
  }
  return stringFinal;
}

function separarStringPorCaracter(string, currentCharacter, newCharacter) {
  const stringFinal = split(string, currentCharacter).join(newCharacter);
  return replace(stringFinal, "_main", "").toUpperCase();
}

function ordenarArray(array, propiedad, tipo = "ASC") {
  if (tipo === "ASC") {
    // console.log(array);
    return array.sort((a, b) => {
      const valueA =
        typeof a === "string" ? a[propiedad].toLowerCase() : a[propiedad];
      const valueB =
        typeof b === "string" ? b[propiedad].toLowerCase() : b[propiedad];
      if (valueA < valueB) {
        return -1;
      }
      if (valueA > valueB) {
        return 1;
      }
      return 0;
    });
  } else if ("DESC") {
    return array.sort((a, b) => {
      const valueA =
        typeof a === "string" ? a[propiedad].toLowerCase() : a[propiedad];
      const valueB =
        typeof b === "string" ? b[propiedad].toLowerCase() : b[propiedad];
      if (valueA > valueB) {
        return -1;
      }
      if (valueA < valueB) {
        return 1;
      }
      return 0;
    });
  }
}

function obtenerFechaActual() {
  const splitDate = new Date()
    .toLocaleString("es-MX", {
      timeZone: "America/La_Paz",
    })
    .split(",");
  const date = map(splitDate[0].split("/"), (item) => parseInt(trim(item)));
  const hours = splitDate[1];
  const dateFinal = new Date();
  dateFinal.setDate(date[0]);
  dateFinal.setMonth(date[1] - 1);
  dateFinal.setFullYear(date[2]);
  const hoursFinal = map(hours.split(":"), (item) => parseInt(trim(item)));
  dateFinal.setHours(hoursFinal[0]);
  console.log(dateFinal);
  return dateFinal;
}

const formatoMiles = (number) => {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = "$1,";
  return number.toString().replace(exp, rep);
};

const TransformarArrayAObjeto = (array) => {
  let arrayAux;
  forEach(array, (item) => {
    arrayAux = { ...arrayAux, [item]: item };
  });
  return arrayAux;
};

const nombreSeccionTabla = (table) => {
  const underscoreIndex = table.indexOf("_");
  const segundoUnderscoreIndex = table.indexOf("_", underscoreIndex + 1);

  if (underscoreIndex !== -1 && segundoUnderscoreIndex !== -1) {
    const textoRestante = table.substring(segundoUnderscoreIndex + 1);
    const textoSinGuiones = textoRestante.replace(/_/g, " ");
    const primeraLetraMayuscula = textoSinGuiones.charAt(0).toUpperCase();
    const restoTextoMinusculas = textoSinGuiones.slice(1).toLowerCase();

    return primeraLetraMayuscula + restoTextoMinusculas;
  }

  return table;
};

const padTo2Digits = (num) => {
  return num.toString().padStart(2, "0");
};

const formatearFecha = (date = new Date()) => {
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
};

function tipoReporteControlEnvio(id) {
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
    31: {
      folder: "cartera",
      nameSheet: "Cartera (Pensiones)",
      nameExcel: "Cartera Valorada Pensiones.xlsx",
    },
  };

  return ID_REPORTES[id];
}

function validateEmail(email) {
  const res =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return res.test(String(email).toLowerCase());
}

const agregarDias = (date, days) => {
  date.setDate(date.getDate() + days);
  return date;
};
const agregarMeses = (date, months) => {
  date.setMonth(date.getMonth() + months);
  return date;
};

module.exports = {
  formatearFechaDeInformacion,
  separarStringCamelCasePorCaracter,
  ordenarArray,
  obtenerFechaActual,
  formatoMiles,
  TransformarArrayAObjeto,
  separarStringPorCaracter,
  nombreSeccionTabla,
  formatearFecha,
  tipoReporteControlEnvio,
  validateEmail,
  agregarDias,
  agregarMeses,
};
