// userController.js
import * as userServices from "../services/userServices.js"

export const getUsers = async(req, res) => {
  try {
    const users = await userServices.getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('error fetching client', error);
    res.status(500).json({ message: 'internal server error'});
  }
};

export const getUserById = async(req, res) => {
  try {
    const userId = req.params.id;
    const user = await userServices.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
