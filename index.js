
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views'));
app.listen(3000, function(){
  console.log("Servidor no ar - Porta: 3000!")
});

var mysql = require('mysql'); 
var conexao = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "avaliacao01"
});
conexao.connect(function(err) {
  if (err) throw err;
  console.log("Banco de Dados Conectado");
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

const Compra = require('./model/Compra');
const Material = require('./model/Material');
const Servidor = require('./model/Servidor');

/* Abrir página inicial do site */
app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

/* Abrir e processar um formulário para cadastro de materiais */
app.get('/listaMaterial', function(req, res){
  var mat = new Material();

  mat.listar(conexao, function(result) {
    res.render('material/lista.ejs', {materiais: result});
  });
});

app.post('/pesquisarMaterial', function(req, res){
  var mat = new Material();
  
  mat.nome = '%' + req.body.nome + '%';

  mat.pesquisar(conexao, function(result) {
    res.render('material/lista.ejs', {materiais: result});
  });
});

app.post('/formMaterial', function(req, res){
  var a = req.body.acao;

  if (a == "Excluir") {
    var m = new Material();
    m.id = req.body.id_material;
    m.excluir(conexao);

    res.render('material/resultado.ejs');
  } else {
    if (a == "Inserir") {
      var m = new Material();

      res.render('material/formulario.ejs', {acao: a, material: m});
    } else {
      var m = new Material();
      m.id = req.body.id_material;
      
      m.selecionarId(conexao, function(result) {
        m.nome = result[0].nome;
        m.descricao = result[0].descricao;
        m.preco = result[0].preco_unitario;
        m.unidade = result[0].unidade;

        res.render('material/formulario.ejs', {acao: a, material: m});
      });

    }
  }	
});

app.post('/processarMaterial', function(req, res){

  var a = req.body.acao;
  var m = new Material();

  m.id = req.body.id;
  m.nome = req.body.nome;
  m.descricao = req.body.descricao;
  m.preco = req.body.preco;
  m.unidade = req.body.unidade; 

  if (a == "Inserir") {
    m.inserir(conexao);
  } else {
    m.atualizar(conexao);
  }

  res.render('material/resultado.ejs');
});

/* Abrir e processar um formulário para cadastro de servidores  - codificar*/
app.get('/listaServidor', function(req, res){
  var ser = new Servidor();

  ser.listar(conexao, function(result) {
    res.render('servidor/lista.ejs', {servidores: result});
  });
});

app.post('/pesquisarServidor', function(req, res){
  var ser = new Servidor();
  
  ser.nome = '%' + req.body.nome + '%';

  ser.pesquisar(conexao, function(result) {
    res.render('servidor/lista.ejs', {servidores: result});
  });
});

app.post('/formServidor', function(req, res){
  var a = req.body.acao;

  if (a == "Excluir") {
    var s = new Servidor();
    s.matricula = req.body.numero_matricula;
    s.excluir(conexao);

    res.render('servidor/resultado.ejs');
  } else {
    if (a == "Inserir") {
      var s = new Servidor();

      res.render('servidor/formulario.ejs', {acao: a, servidor: s});
    } else {
      var s = new Servidor();
      s.matricula = req.body.numero_matricula;
      
      s.selecionarMatricula(conexao, function(result) {
        s.matricula = result[0].numero_matricula;
        s.nome = result[0].nome;
        s.cargo = result[0].cargo;
      
        res.render('servidor/formulario.ejs', {acao: a, servidor: s});
      });

    }
  }	

	res.sendFile(__dirname + '/views/servidor/formulario.html');
});

app.post('/processarServidor', function(req, res){
	var a = req.body.acao;
  var s = new Servidor();

  s.matricula = req.body.numero_matricula;
  s.nome = req.body.nome;
  s.cargo = req.body.cargo;

  if (a == "Inserir") {
    s.inserir(conexao);
  } else {
    s.atualizar(conexao);
  }

  res.render('servidor/resultado.ejs');
});

/* Abrir e processar um formulário para cadastro de compra */
app.get('/listaCompra', function(req, res){
  var comp = new Compra();

  comp.listar(conexao, function(result) {
    res.render('compra/lista.ejs', {compras: result});
  });
});

app.get('/formCompra', function(req, res){
  var ser = new Servidor();
  var mat = new Material();

  ser.listar(conexao, function(result1) {
    mat.listar(conexao, function(result2) {
      res.render('compra/formulario.ejs', {servidores: result1, materiais: result2});
    });
  });
});


app.post('/processarCompra', function(req, res){
  var c = new Compra();

  c.quantidade = req.body.quantidade;
  c.urgencia = req.body.urgencia;
  c.mat.id = req.body.material;
  c.serv.matricula = req.body.matricula;

  /*c.calcularValorCompra();
  c.calcularPrazoEntrega();*/

  c.inserir(conexao);

  res.render('compra/resultado.ejs', {comp: c});
});
