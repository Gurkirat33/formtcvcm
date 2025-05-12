import jwt from "jsonwebtoken";

export const verifyUserToken = (req, res, next) => {
  try {
    const token = req.cookies.usertoken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Veuillez vous connecter." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("Error in verifyUserToken middleware:", error);
    return res.status(401).json({
      message: "Session invalide ou expirée. Veuillez vous reconnecter.",
    });
  }
};

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
