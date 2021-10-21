const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: '',
  database: 'banco-solar',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillies: 2000,
});
pool.connect()

const guardarUsuario = async (usuario) => {
  const values = Object.values(usuario)
  const consulta = {
    text: 'INSERT INTO usuarios (nombre, balance) VALUES ($1, $2)',
    values,
  }
  try {
    const result = await pool.query(consulta)
    return result;
  } catch (error) {
    console.log(error)
    return error;
  }
};

const getUsuarios = async () => {
  const result = await pool.query('SELECT * from usuarios');
  return result.rows
};

const editUsuario = async (usuario) => {
  const values = Object.values(usuario)
  console.log(values)
  const consulta = {
    text: 'UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *',
    values,
  }
  try {
    const result = await pool.query(consulta)
    return result;
  } catch (error) {
    console.log(error)
    return error;
  }
};

const eliminarUsuario = async (id) => {
  const result = await pool.query(`DELETE FROM usuarios WHERE id = ${id}`);
  return result.rows
};

/*
const nuevaTransferencia = async (emisor, receptor, monto ) => {
  pool.connect( async (error_conexion, client, release) => {

    if(error_conexion) {
      console.log(error_conexion);
    } else {

      try {
        await client.query('BEGIN');
        const sacar = `UPDATE usuarios SET balance = balance - ${monto} WHERE id = ${emisor} RETURNING *;`;
        const descuento = await client.query(sacar);
        console.log('DESCUENTO', descuento)
        
        

        const abonar = `UPDATE usuarios SET balance = balance + ${monto} WHERE id = ${receptor} RETURNING *;`;
        const acreditacion = await client.query(abonar);
        console.log('ACREDITACION', acreditacion)

        const date = new Date();
        const ajuste = `INSERT INTO transferencias (emisor,receptor,monto) VALUES (${emisor},${receptor},${monto}) RETURNING *;`;
        const transaccion = await client.query(ajuste);
        console.log('TRANSACCION', transaccion)

        console.log("Descuento realizado con éxito: ", descuento.rows[0]);
        console.log("Acreditación realizada con éxito: ", acreditacion.rows[0]);
        console.log("Transacción realizada con éxito: ", transaccion.rows[0]);
        
        await client.query('COMMIT');

      } catch (e) {
        await client.query('ROLLBACK');
  
        console.log("Error código: " + e.code);
        console.log("Detalle del error: " + e.detail);
        console.log("Tabla originaria del error: " + e.table);
        console.log("Restricción violada en el campo: " + e.constraint);
        console.log("Error: ", e);
      }
      release();
      pool.end();
    }
      
  })
}*/

const nuevaTransferencia = async (datos) => {

  try {
    const { data } = await axios.get("http://localhost:3000/usuarios");
    const emisor = data.filter((elemento) => {
      return elemento.id == datos[0];
    })

    const receptor = data.filter((elemento) => {
      return elemento.id == datos[1];
    })

    const result = await pool.query( // si te escucho
    `
    BEGIN;
    UPDATE usuarios SET balance = balance - ${datos[2]} WHERE nombre = '${datos[0]}';
    UPDATE usuarios SET balance = balance + ${datos[2]} WHERE nombre = '${datos[1]}';
    INSERT INTO transferencias (emisor,receptor,monto,fecha)
    VALUES (${emisor[0].id},${receptor[0].id},'${datos[2]}',now());
    COMMIT;
    `
    );
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}
const consultarTransferencias = async () => {
  try {
      const result = await pool.query(`
        SELECT t.id, t.monto, t.fecha, em.nombre as emisor, re.nombre as receptor  FROM transferencias t
        INNER JOIN usuarios em ON em.id = t.emisor
        INNER JOIN usuarios re ON re.id = t.receptor
      `);
      return result.rows;
  } catch (error) {
      console.log(error.code);
      return error;
  }
}

pool.connect(async(error_conexion, client, release) => {
  await client.query('BEGIN');

});




module.exports = { guardarUsuario, getUsuarios, editUsuario, eliminarUsuario, nuevaTransferencia, consultarTransferencias }
