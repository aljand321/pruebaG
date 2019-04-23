var express = require('express');
var router = express.Router();

var pg = require('pg');
/*var consString = "postgres://postgres:1234@localhost/aljand"; // cadena de conexion*/

//coneccion a la vase de datos
const connectionData = {
  user: 'postgres',
  host: 'localhost',
  database: 'aljand',
  password: '1234',
  port: 5432,
}
const client =  new pg.Client(connectionData);
client.connect();

/*var dataNombre = "SELECT row_to_json(fc) FROM ( SELECT array_to_json(array_agg(f) ) As Datos FROM (" +
"SELECT ST_AsGeoJSON(lg.nombre::json As geometry, row_to_json((nombre, apellido)) As properties" +
" FROM alejandro As lg) As f) As fc";*/



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/data', function(req, res){
  var cliente = new pg.Client(consString);
  cliente.connect();
  var query = cliente.query(dataNombre);

  query.on("row", function(row, result){
    result.addRow(row)
  });

  query.on("end", function(result){
    res.json(result.rows[0].row_to_json);
    res.end();  
  });
});

router.get('/ver',function(req,res) {
  const ver = new pg.Client(consString);
  console.log(ver);
  res.status(200).json(ver);
});

//este servicio es para poder enviar datos a postgres
router.post('/enviar', async(req, res) =>{
  var nombre = req.body.nombre;
  var apellido = req.body.apellido;
  console.log(req.body);
  /*client.query("alejandro", req.body, (result)=>{
    if(!result){
      res.send({result:false});
      return;
    }
    console.log(result + " esyo es el resultado");
    res.send(result);
  })*/
  var sql = "INSERT INTO alejandro(nombre, apellido) values('" + nombre + "', '" + apellido + "')";
  console.log(sql);
  client.query(sql);
  //console.log(nombre, apellido);
   res.status(200).json({
      nombre, apellido    
   });
});
// este servicio es para poder sacar datos de postgresql
router.get('/verT', async(req, res) => {
 await client.query("SELECT* FROM alejandro")
  .then(response => {
    console.log(response.rows)
    res.send(response.rows)
    client.end()
})
.catch(err => {
    console.log('no se optuvo una repuesta')
    client.end()
})
});

router.post('/enviar1', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {nombre: req.body.nombre, apellido: req.body.apellido};
  // Get a Postgres client from the connection pool
  pg.connect(connectionData, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO alejandro(nombre, apellido) values($1, $2)',
    [data.nombre, data.apellido]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM alejandro ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});
//`${}` poder envair
//servicio de prueva
router.get('/v', function (req, res, next) {
  var pool = new pg.Pool();
  pool.connect(connectionData ,function(err,client,done) {
     if(err){
         console.log("not able to get connection "+ err);
         res.status(400).send(err);
     } 
     client.query('SELECT * FROM alejandro where id = $1', [1],function(err,result) {
         done(); // closing the connection;
         if(err){
             console.log(err);
             res.status(400).send(err);
         }
         res.status(200).send(result.rows);
     });
  });
});


module.exports = router;
