import User from "../model/user.model.js";
import Event from "../model/event.model.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, email, age, sex } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Le nom et l'email sont requis" });
    }

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.userId },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Cette adresse email est déjà utilisée" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        email,
        age: age || undefined,
        sex: sex || undefined,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await Event.updateMany(
      { registeredUsers: req.userId },
      { $pull: { registeredUsers: req.userId } }
    );

    await User.findByIdAndDelete(req.userId);

    res.clearCookie("usertoken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({
      message: "Compte supprimé avec succès",
    });
  } catch (error) {
    console.error("Error in deleteAccount controller:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du compte" });
  }
};
