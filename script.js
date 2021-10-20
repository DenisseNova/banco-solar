const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "",
  database: "banco-solar",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillies: 2000,
});

const guardarUsuario = async (usuario) => {
  const values = Object.values(usuario)
  const consulta = {
    text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2)",
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
  const result = await pool.query("SELECT * from usuarios");
  return result.rows
};

const editUsuario = async (usuario) => {
  const values = Object.values(usuario)
  console.log(values)
  const consulta = {
    text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *",
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

module.exports = { guardarUsuario, getUsuarios, editUsuario, eliminarUsuario }
