const http = require('http');
const fs = require('fs');
const url = require('url')

const { guardarUsuario, getUsuarios, editUsuario, eliminarUsuario } = require('./script')

http.createServer(async (req, res) => {

  if (req.url == '/' && req.method == 'GET') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end();
      } else {
        res.setHeader('content-type', 'text/html');
        res.end(data);
      }
    });
  }
  //agregar un nuevo usuario
  if (req.url == "/usuario" && req.method == "POST") {
    let body = "";
    req.on("data", (chunck) => {
      body = chunck.toString();
    });
    req.on("end", async () => {
      const usuario = JSON.parse(body);
      try {
        const result = await guardarUsuario(usuario);
        res.statusCode = 201;
        res.end(JSON.stringify(result));
      } catch (e) {
        res.statusCode = 500;
        res.end("Ocurrio un dilema en el servidor. " + e);
      }
    });
  }
  //muestra el nuevo usuario en la tabla correspondiente
  if (req.url == "/usuarios" && req.method == "GET") {
    try {
      const usuarios = await getUsuarios();
      res.end(JSON.stringify(usuarios));
    } catch (e) {
      res.statusCode = 500;
      res.end("Ocurrio un dilema en el servidor. " + e);
    }
  }
  //edita un usuario
  if (req.url.startsWith("/usuario") && req.method == "PUT") {
    let body = "";
    req.on("data", (chunck) => {
      body = chunck.toString();
    });
    req.on("end", async () => {
      let { id } = url.parse(req.url, true).query;

      const usuario = JSON.parse(body);
      try {
        const result = await editUsuario({ ...usuario, id });
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } catch (e) {
        res.statusCode = 500;
        res.end("Ocurrio un dilema en el servidor. " + e);
      }
    });
  }
  //eliminar un usuario 
  if (req.url.startsWith("/usuario?id") && req.method == "DELETE") {
    try {
      let { id } = url.parse(req.url, true).query;
      await eliminarUsuario(id);
      res.end("Candidato eliminado");
    } catch (e) {
      res.statusCode = 500;
      res.end("Ocurrio un dilema en el servidor. " + e);
    }
  }
})
  .listen(3000, () => { console.log("Puerto conectado mi mlady") })