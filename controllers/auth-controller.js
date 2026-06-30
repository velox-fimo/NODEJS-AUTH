const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//register controller
const registerUser = async (req, res) => 
{

    try 
    {
      //extract user information from our request body 
      const { username, email, password,role } = req.body;
      //check if user already exists in our database
      const checkExistingUser = await User.find({ $or: [{ username }, { email }] });
      if (checkExistingUser.length > 0) 
        {
          return res.status(400).json({
            success: false,
            message: "User already exists with either with same username or email, please try again with a diifferent username or email",
          });
        }
      else 
        {
            //hash the password before saving it to the database
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            //create a new user and save it to the database
            const newlyCreatedUser = new User({
              username,
              email,
              password: hashedPassword,
              role: role || "user", //default role is 'user' if not provided
            });

              const savedUser = await newlyCreatedUser.save();
              if (savedUser) 
              {
                res.status(201).json({
                success: true,
                message: "User registered successfully",
               }); 
              }
              
        }     
    } 
    catch (e) 
    {
      console.log(e);
      res.status(500).json({ 
        success: false,
        message: "some error occurred! please try again" });
    } 
  }
  //login controller  
  const loginUser = async (req, res) => {
    try {
      const { username, password } = req.body;
      //find if the current user exists in our database or not
      const user = await User.findOne({ username });
      if(!user)
      {
        return res.status(400).json({
          success: false,
          message: "User not found"
        });
      }
      //if the password is correct or not
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if(!isPasswordMatch)
      {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials"
        });
      }
    const accessToken = jwt.sign({
        userId: user._id,
        username: user.username,
        role: user.role
    }, process.env.JWT_SECRET_KEY, { expiresIn: "1h"  });
     res.status(200).json({
        success: true,
        message: "User logged in successfully",
        accessToken
      });
    } catch (e) 
    {
      console.log(e);
      res.status(500).json({ 
        success: false,
        message: "some error occurred! please try again" });
    } 
}

const changePassword = async (req, res) => {
try {
  const userId = req.userinfo.userId;
  //extract old and new password
  const { oldPassword, newPassword } = req.body;
  //find the current logged in user in our database
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  //check if the old password is correct
  const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: "Old password is incorrect! please try again",
    });
  }
  //hash the new password before saving it to the database 
  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(newPassword, salt);
  //update the user's password in the database
  user.password = newHashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
} catch (error) {
    console.log(error);
      res.status(500).json({ 
        success: false,
        message: "some error occurred! please try again" });
}

}



module.exports = { registerUser, loginUser, changePassword };