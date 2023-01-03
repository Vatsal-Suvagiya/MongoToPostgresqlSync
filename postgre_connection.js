const Pool = require('pg').Pool
try{
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hirest_mongo',
  password: 'Qwert@92659',
  port: 5432,
})

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })

pool.connect().then((client) => {
  console.log("connection established with postgresql..");
})
module.exports = pool
}catch(err){
  console.log("connection error:",err);
}

