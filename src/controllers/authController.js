const UserService = require('../services/userService');  
const AuthService = require('../services/authService');
const register = async (req, res) => {  
    const { name, email, password } = req.body;  
    try {  
        // Check for existing email  
        const existingUser = await UserService.findUserByEmail(email);

        if (existingUser) {  
            return res.status(400).json({ error: 'Email is already in use.' });  
        }  
        // Create a new user  
        const user = await UserService.createUser(name, email, password);   
        const token = await AuthService.generateToken(user);


        res.status(201).json({ user, token });  
    } catch (error) {  
        if (error.code === 11000) {  
            return res.status(400).json({ error: 'Email is already in use.' });  
        }  
        res.status(400).json({ error: error.message });  
    }  
};

const login = async (req, res) => {  
    const { email, password } = req.body;  
    try {  
        const user = await UserService.findUserByEmail(email);  

        if (!user || !(await user.comparePassword(password))) {  
            return res.status(401).json({ error: 'Invalid email or password' });  
        }  
 
        const token = await AuthService.generateToken(user)

        res.json({ user, token });  
    } catch (error) {  
        res.status(500).json({ error: error.message });  
    }  
};  

module.exports = { register, login }; // Export the functions