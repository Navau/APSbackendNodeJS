const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/La_Paz");
const { map, forEach } = require("lodash");

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

module.exports = {
  formatearFechaDeInformacion,
};
