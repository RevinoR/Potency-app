// services/userServices.js
import bcrypt from 'bcrypt';
import { query } from "../src/db.js";

export const getUsers = async () => {
  const { rows } = await query('SELECT user_id, email, role FROM "User"');
  return rows;
};

export const getUserByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM "User" WHERE email = $1', [email]);
  return rows[0];
};

export const createUser = async (name, email, password) => {
  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Insert user with default role
  const { rows } = await query(
    'INSERT INTO "User" (email, password, role) VALUES ($1, $2, $3) RETURNING user_id, email, role',
    [email, hashedPassword, 'user']
  );
  
  return rows[0];
};
