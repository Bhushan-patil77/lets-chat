const mongoose = require('mongoose');
const userModel = require('../models/userModel')
const ObjectId = mongoose.Types.ObjectId;


exports.registerUser = async (req, res) => {

  try {
    console.log(req.body)

    const newUser = new userModel(req.body);
console.log(newUser)
    const data = await newUser.save();
    res.status(200).json({ message: 'User Registered Successfully...', data: data })

  } catch (error) {

    res.status(500).json({ error: 'An error occurred while creating user..' })

  }



}

exports.demo = async (req, res) =>{
  res.json({msg:'hello there, this is response from server...'})
}

exports.loginUser = async (req, res) => {

  try {

    const user = await userModel.findOne({ username: req.body.username, password: req.body.password })

    if (user) {
      res.status(200).json({ message: 'User authenticated...', data: user });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  }
  catch (error) {
    res.status(500).json({ error: 'An error occurred while creating user..' })
  }



}

exports.getRecipient= async (req, res) =>{
  try {
    const user = await userModel.find({_id:req.body.userId});

    if (user) {
      res.status(200).json({ user:user[0] });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  }
  catch (error) {
    res.status(500).json({ error: 'An error occurred while creating user..' })
  }
}

exports.getUsers = async (req, res) => {
  try {

    const users = await userModel.find({});
    if (users) {
      res.status(200).json({ message: 'all users', users: users });
    } else {
      res.status(401).json({ error: 'error while getting users...' });
    }

  } catch (error) {

    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });

  }
};

exports.deleteUser = async (req, res) => {
  try {

    const data = await userModel.deleteOne({ _id: req.body._id });
    console.log(data);
    res.json(data)

  } catch (error) {

    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });

  }
};

exports.updateUser = async (req, res) => {
  try {




    const data = await userModel.updateOne({ name: req.body.name }, { $set: { email: req.body.email, name: req.body.name, password: req.body.password } });
    res.json(data)

  } catch (error) {

    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });

  }
};
