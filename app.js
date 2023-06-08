const express = require("express");
const helmet = require("helmet");
const app = express();
const RouterApi = require("./routes");
const storage = require("node-persist");
(async () => {
  try {
    await storage.init();
    console.log("TOKEN", await storage.getItem("token"));
  } catch (error) {
    console.error("Error:", error);
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
const timeZone = "America/La_Paz";
process.env.TZ = timeZone;
app.set("trust proxy", true);
app.set("timezone", timeZone);
//Configure Header HTTP
app.use((req, res, next) => {
  //CONFIGURACION DE HEADERS PARA YA NO USAR LA EXTENCION MOESIF CORS, Y NO DE EL ERROR DE CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

//Router
RouterApi(app);

module.exports = app;
