const express = require('express');
const DbService = require('./db.service');

const app = express();

app.use(express.json());

app.post('/clientes', (request, response) => {

  DbService.inserirCliente(request.body)
    .then(cliente => {
      response.status(201).send(cliente);
    })
    .catch(erro => {
      console.error('Erro ao inserir cliente', erro);
      response.status(500).send("Ocorreu um erro ao inserir o cliente no banco de dados");
    });

});

app.get('/clientes', (request, response) => {

  let promiseBuscaBanco = null;

  if (request.query.nome != null) {
    promiseBuscaBanco = DbService.consultarClientePorNome(request.query.nome);
  } else {
    promiseBuscaBanco = DbService.listarTodosClientes();
  }

  promiseBuscaBanco
    .then(clientes => {
      if (clientes.length > 0) {
        response.send(clientes);
      } else {
        response.status(204).send();
      }
    })
    .catch(erro => {
      console.error('Erro ao listar clientes', erro);
      response.status(500).send("Ocorreu um erro ao listar clientes do banco de dados");
    });

});

app.get('/clientes/:id', (request, response) => {

  DbService.consultarClientePorId(request.params.id)
    .then(cliente => {
      if (cliente) {
        response.send(cliente);
      } else {
        response.status(404).send(`Cliente com ID ${request.params.id} não encontrado`);
      }
    })
    .catch(erro => {
      console.error('Erro ao consultar cliente por id', erro);
      response.status(500).send("Ocorreu um erro ao consultar cliente por id do banco de dados");
    });

});

const server = app.listen(3000, () => {
  console.log('Servidor iniciado');

  DbService.conectar({
    host: 'localhost', 
    porta: 3306, 
    banco: 'pet_shop', 
    usuario: 'root', 
    senha: '123456'
  })
    .catch(erro => {
      console.log('Devido erro ao conectar com o banco de dados a aplicação será encerrada');
      console.error(erro);
      server.close();
    });
});