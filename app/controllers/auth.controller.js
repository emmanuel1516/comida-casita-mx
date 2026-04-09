import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

export const loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "Correo no registrado" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
            );

            res.status(200).json({
            message: "Login correcto",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
        message: "Error al iniciar sesión",
        error: error.message,
        });
    }
}