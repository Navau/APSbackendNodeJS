const express = require("express");
const helmet = require("helmet");
const app = express();
const RouterApi = require("./routes");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(helmet());
// const timeZone = "America/La_Paz";
// process.env.TZ = timeZone;
// app.set("trust proxy", true);
// app.set("timezone", timeZone);
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
