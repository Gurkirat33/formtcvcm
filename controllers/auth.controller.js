import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, sex, age, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Un utilisateur avec cette adresse e-mail existe déjà",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      sex,
      age,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = { ...savedUser._doc };
    delete userResponse.password;

    res.cookie("usertoken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error in register controller:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    if (user.accountBanned) {
      return res.status(403).json({
        message:
          "Vous êtes bloqué et ne pouvez pas accéder au site. Veuillez contacter l'administrateur.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.cookie("usertoken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du profil" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("usertoken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};

export const validateToken = (req, res) => {
  try {
    const token = req.cookies.usertoken;

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      valid: true,
      userId: decoded.id,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return res.status(401).json({
      valid: false,
      message: "Invalid token",
    });
  }
};
