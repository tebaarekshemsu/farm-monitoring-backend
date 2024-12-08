"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
// Function to sign up a new user
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Hash the user's password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Insert the user into the database
        const result = yield db_1.default.query('INSERT INTO "user" (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword]);
        // Retrieve the newly created user
        const user = result.rows[0];
        // Respond with success message and user details (without the password)
        res.status(201).json({ message: 'User created', user: Object.assign(Object.assign({}, user), { password: undefined }) });
    }
    catch (error) {
        // Handle potential errors gracefully
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Error creating user' });
    }
});
exports.signup = signup;
// Function to log in an existing user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Query the database for the user
        const result = yield db_1.default.query('SELECT * FROM "user" WHERE email = $1', [email]);
        // Check if the user exists
        if (result.rows.length === 0) {
            res.status(400).json({ error: 'Invalid email or password' });
        }
        // Retrieve the user details
        const user = result.rows[0];
        // Compare the provided password with the hashed password
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid email or password' });
        }
        // Generate a JSON Web Token
        const token = jsonwebtoken_1.default.sign({ userId: user.user_id, name: user.name }, process.env.JWT_SECRET || 'default_secret', // Provide a fallback for JWT_SECRET
        { expiresIn: '1h' });
        // Respond with the token
        res.status(200).json({ token });
    }
    catch (error) {
        // Handle potential errors gracefully
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Error logging in' });
    }
});
exports.login = login;
