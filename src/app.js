const express = require("express");

const TwitterService = require("./twitter.service");
const DbService = require("./db.service");

const app = express();

app.use(express.json());

app.get("/listaEventosPorEmpresa", (request, response) => {
  /*
    entrada:
    {
      "empresa"   : "hitbra"
    }

    saída
    [
      {
        "data": "19/10/2019",
        "eventos": [
          {
            "horario": "12:00",
            "categoria": "reuniao"
            "descricao": "vamos pra sala de reuniao",
            "pessoas": [
              "giovane",
              "rubens"
            ]
          },
          {
            "horario": "21:00",
            "categoria": "churrasco"
            "descricao": "niver do Rubao",
            "pessoas": [
              "giovane",
              "rubens",
              "marcos"
            ]
          }
        ]
      }
    ]
  */

  TwitterService.listarTweetsHitBRA(request.body)
    .then(eventos => {
      response.status(200).send(eventos);
    })
    .catch(erro => {
      console.error("Erro so listar eventos", erro);
      response
        .status(500)
        .send("Ocorreu um erro ao listar os eventos no banco de dados");
    });

  response.send();
});

app.get("/listaEventosPorData", (request, response) => {
  /*
    entrada:
    {
      "empresa"   : "hitbra"
      "dataInicio"  : "19/10/2019",
      "dataFim"    : "20/10/2019"
    }	
    
    saída:
    [
      {
        "empresa": "hitbra",
        "data": "19/10/2019",
        "eventos": [
          {
            "horario": "12:00",
            "categoria": "reuniao"
            "descricao": "vamos pra sala de reuniao",
            "pessoas": [
              "giovane",
              "rubens"
            ]
          },
          {
            "horario": "21:00",
            "categoria": "churrasco"
            "descricao": "niver do Rubao",
            "pessoas": [
              "giovane",
              "rubens",
              "marcos"
            ]
          }
        ]
      }
    ]
  */
  response.send();
});

app.get("/listaEventosPorPessoa", (request, response) => {
  /*
    entrada:
    {
      "pessoa" : "giovane"
      "ordenacao" : "ASC"
    }	

    saída:
    [
      {
        "data": "19/10/2019",
        "eventos": [
          {
            "horario": "12:00",
            "descricao": "vamos pro almoço",
            "pessoas": [
              "giovane",
              "rubens",
              "marcos"
            ]
          },
          {
            "horario": "13:00",
            "descricao": "vamos reencontrar a turma",
            "pessoas": [
              "rubens"
            ]
          }
        ]
      }
    ]
  */
  response.send();
});

app.get("/listaEventosRepetitivos", (request, response) => {
  /*
    entrada:
    {
    }	

    saída:
    [
      {
        "pessoa": "giovane",
        "quantidade": 150
      },
      {
        "pessoa": "rubens",
        "quantidade": 100
      },
      {
        "pessoa": "marcos",
        "quantidade": 0
      }
    ]
  */
  response.send();
});

app.get("/listaHorarios", (request, response) => {
  /*
    entrada:
    {
      "mes" : "Outubro",
      "ano" : "2019"
    }	

    saída:
    [
      {
        "horario": "12:00",
        "quantidade": 10
      },
      {
        "horario": "18:00",
        "quantidade": 8
      },
      {
        "horario": "21:00",
        "quantidade": 5
      }
    ]
  */
  response.send();
});

const server = app.listen(3000, () => {
  console.log("Servidor iniciado");

  DbService.conectar({
    host: "localhost",
    porta: 3306,
    banco: "EVENTOS",
    usuario: "root",
    senha: "123456"
  })
    .then(() => {
      console.log("Conexão com banco de dados estabelecida");

      TwitterService.newClient({
        consumer_key: "URKM9MWFpwZgKfbxwsGqNE0MT",
        consumer_secret: "HXOZCQPhv2MhAaLSj07Ss2ODhQh64IObDYstYUwG8EyLzYQOFD",
        access_token_key: "187744844-EHU5axWK55BmRappDWkoVlI6eSpfZ3NV1W7z2kMJ",
        access_token_secret: "DHx58GbWYrC87Fs026RitPaNYyojNJ8L8d47MvmRbj9uh"
      });
      console.log("Client do Twitter criado");

      TwitterService.listarTweetsHitBRA()
        .then(tweet => {
          console.log(`Recebido ${tweet.length} para processar`);
          /*
            *** Implemente aqui sua lógica para ler o tweets ***
            
            O parâmetro "tweets" é um array de objetos com a seguinte estrutura:
            {
              "texto": "string",
              "hashtags": [
                "string"
              ]
            }

            Exemplo: 
            {
              "texto": "#hackathonhitbra hitbra festa 10/11/2019 21:00 vamos comemorar o hackathon  *marcos *rubens *giovane",
              "hashtags": [
                "hackathonhitbra"
              ]
            }
          */

          function ValidarData(Data) {
            let dia = Data.substring(0, 2);
            let mes = Data.substring(3, 5);
            let ano = Data.substring(6, Data.length);
          }
          let tweets = {};
          let categoria = [
            "festa",
            "churrasco",
            "reunião",
            "férias",
            "reuniao",
            "ferias"
          ];

          tweet.forEach((element, index) => {
            let texto = element.texto.replace(/\s{2,}/g, " ").split(" ");
            let validacao = [];

            validacao.push(texto.includes("#hackathonhitbra"));
            validacao.push(texto.includes("hitbra"));
            let aux = [];
            categoria.forEach((element2, index2) => {
              aux.push(texto.includes(element2));
            });

            validacao.push(aux.includes(true));

            /*tweet.push({
                nome = texto[1],
                categoria = texto[2],
                data:texto[3],
                hora:
              })*/
            let descricao = "";
            let pessoas = [];
            for (let i = 5; i < texto.length; i++) {
              if (texto[i].indexOf("*") == -1) descricao += texto[i] + " ";
              else {
                pessoas.push(texto[i]);
              }
            }
            tweets.nomeEmpresa = texto[1];
            tweets.categoria = texto[2];
            tweets.data = texto[3];
            tweets.hora = texto[4];
            tweets.descricao = descricao;
            tweets.nomePessoa = pessoas;
            

            if (!validacao.includes(false)) {
              DbService.inserirTweets(tweets)
                .then(tweet => {
                  response.status(201).send(tweet);
                })
                .catch(erro => {
                  console.error("Erro ao inserir cliente", erro);
                  response
                    .status(500)
                    .send(
                      "Ocorreu um erro ao inserir o cliente no banco de dados"
                    );
                });
            }
          });
        })
        .catch(erro => {
          console.error("Erro ao listar Tweets da Hit-BRA:", erro);
          server.close();
        });
    })
    .catch(erro => {
      console.log(
        "Devido erro ao conectar com o banco de dados a aplicação será encerrada"
      );
      console.error(erro);
      server.close();
    });
});
