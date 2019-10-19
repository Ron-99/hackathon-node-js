const mysql = require("mysql");

let conexao = null;

module.exports = {
  conectar,
  inserirTweets,
  inserirPessoaTweet
};

function conectar(options) {
  if (conexao == null) {
    return new Promise((resolve, reject) => {
      console.log("Iniciando conexão em banco de dados");

      conexao = mysql.createConnection({
        host: options.host,
        port: options.porta,
        database: options.banco,
        user: options.usuario,
        password: options.senha
      });

      conexao.connect(erro => {
        if (erro) {
          console.error("Erro ao conectar no banco de dados", erro);
          reject(erro);
        } else {
          console.log("Conectado ao banco de dados");
          resolve();
        }
      });
    });
  } else {
    console.log("Aplicação ja esta conectada ao banco de dados");
    return Promise.resolve(conexao);
  }
}

function inserirTweets(tweet) {
  return new Promise((resolve, reject) => {
    conexao.beginTransaction(erro => {
      if (erro) {
        conexao.rollback(() => {
          console.log("Feito rollback em transação");
          reject(erro);
        });
      } else {
        const tweets = {
          NomeEmpresa: tweet.nomeEmpresa,
          Categoria: tweet.categoria,
          Descricao: tweet.descricao,
          Data: tweet.data,
          Hora: tweet.hora
        };

        // const sql = 'INSERT INTO CLIENT SET name=?, birthday = ?';
        // conexao.query(sql, [cliente.nome, cliente.dataNascimento], (erro, results, fields) => {
        const sql = "INSERT INTO Evento SET ?";
        conexao.query(sql, tweets, (erro, results, fields) => {
          if (erro) {
            conexao.rollback(() => {
              console.log("Feito rollback em transação");
              reject(erro);
            });
          } else {
            const idTweet = results.insertId;
            console.log(tweet.nomePessoa)
            if (Array.isArray(tweet.nomePessoa)) {
              const promisesPessoa = tweet.nomePessoa.map(pessoa => {
                console.log(pessoa)
                return inserirPessoaTweet(pessoa, idTweet);
              });

              Promise.all(promisesPessoa)
                .then(resultadoPessoas => {
                  conexao.commit(erro => {
                    if (erro) {
                      console.log("Feito rollback em transação");
                      conexao.rollback(() => {
                        reject(erro);
                      });
                    } else {
                      console.log("Transação finalizada com sucesso");

                      resolve(tweets);
                    }
                  });
                })
                .catch(erros => {
                  if (!Array.isArray(erros)) {
                    erros = [erros];
                  }

                  erros.forEach(erro => console.error(erro));

                  console.log("Feito rollback em transação");
                  conexao.rollback(() => {
                    reject(erros);
                  });
                });
            } else {
              conexao.commit(erro => {
                if (erro) {
                  console.log("Feito rollback em transação");
                  conexao.rollback(() => {
                    reject(erro);
                  });
                } else {
                  console.log("Transação finalizada com sucesso");
                  console.log(
                    `Pessoa ${tweets.nomePessoa} adicionado com ID ${results.insertId}`
                  );
                  console.log("Sem evento cadastrado");

                  resolve(tweets);
                }
              });
            }
          }
        });
      }
    });
  });
}

function inserirPessoaTweet(pessoa, idTweet) {
  return new Promise((resolve, reject) => {
    
    const registroPessoa = {
      Nome: pessoa,
      id_evento: idTweet
    };

    const sql = "INSERT INTO Pessoa SET ?";

    conexao.query(sql, registroPessoa, (erro, results, fields) => {
      if (erro) {
        reject(erro);
      } else {
        resolve(results);
      }
    });
  });
}
