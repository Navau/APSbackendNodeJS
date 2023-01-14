const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/La_Paz");
const { map, forEach, split, trim, parseInt } = require("lodash");

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

module.exports = {
  formatearFechaDeInformacion,
  separarStringCamelCasePorCaracter,
  ordenarArray,
  obtenerFechaActual,
  formatoMiles,
};
