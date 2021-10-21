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

module.exports = { guardarUsuario, getUsuarios, editUsuario, eliminarUsuario, nuevaTransferencia, consultarTransferencias }
