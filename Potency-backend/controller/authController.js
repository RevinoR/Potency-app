// authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../src/db.js';

// User registration
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if user exists
    const userExists = await query('SELECT * FROM "User" WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user - FIXED: Added name field to match frontend and ERD
    const newUser = await query(
      'INSERT INTO "User" (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
      [name, email, hashedPassword, 'user']
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { 
        id: newUser.rows[0].user_id, 
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check user table
    const userResult = await query('SELECT * FROM "User" WHERE email = $1', [email]);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (isMatch) {
        // Generate JWT token
        const token = jwt.sign(
          { id: user.user_id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        return res.json({
          message: 'Login successful',
          token,
          user: { 
            id: user.user_id, 
            name: user.name,
            email: user.email, 
            role: user.role 
          }
        });
      }
    }
  
    
    // Check admin table if not found in user table
    const adminResult = await query('SELECT * FROM "Admin" WHERE email = $1', [email]);
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      
      if (isMatch) {
        // Generate JWT token for admin
        const token = jwt.sign(
          { id: admin.admin_id, email: admin.email, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        return res.json({
          message: 'Admin login successful',
          token,
          user: { 
            id: admin.admin_id, 
            name: admin.name,
            email: admin.email, 
            role: 'admin' 
          }
        });
      }
    }
    
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add logout handler
export const logoutUser = async (req, res) => {
  try {
    // With JWT, no server-side logout is needed, but we can send a success response
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
