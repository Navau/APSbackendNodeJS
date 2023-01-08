const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/La_Paz");
const { map, forEach, split } = require("lodash");

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
    console.log(array);
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

module.exports = {
  formatearFechaDeInformacion,
  separarStringCamelCasePorCaracter,
  ordenarArray,
};
