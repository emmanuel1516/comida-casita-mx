import { Waiter } from "../models/waiter.model.js";
import { User } from "../models/user.model.js";

export const getWaiters = async (req, res) => {
  try {
    const waiters = await Waiter.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(waiters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los meseros" });
  }
};

export const getWaiterById = async (req, res) => {
  try {
    const waiter = await Waiter.findById(req.params.id).populate(
      "user",
      "name email role"
    );

    if (!waiter) {
      return res.status(404).json({ message: "Mesero no encontrado" });
    }

    res.status(200).json(waiter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el mesero" });
  }
};

export const createWaiter = async (req, res) => {
  try {

    const { name, email, phone, shift, user } = req.body;

    if (user) {

      const existingUser = await User.findById(user);

      if (!existingUser) {
        return res.status(400).json({ message: "El usuario asociado no existe" });
      }

      if (existingUser.role !== "mesero") {
        return res.status(400).json({ message: "El usuario debe tener rol mesero" });
      }
    }


    const existingWaiter = await Waiter.findOne({ email });

    if (existingWaiter) {
      return res.status(400).json({ message: "Ya existe un mesero con ese email" });
    }

    const waiter = new Waiter({
      name,
      email,
      phone,
      shift,
      user: user || null,
    });

    const savedWaiter = await waiter.save();
    const populatedWaiter = await savedWaiter.populate("user", "name email role");

    res.status(201).json(populatedWaiter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el mesero" });
  }
};

export const updateWaiter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, shift, user } = req.body;

    if (user) {
      const existingUser = await User.findById(user);

      if (!existingUser) {
        return res.status(400).json({ message: "El usuario asociado no existe" });
      }

      if (existingUser.role !== "mesero") {
        return res.status(400).json({ message: "El usuario debe tener rol mesero" });
      }
    }

    const updatedWaiter = await Waiter.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        shift,
        user: user || null,
      },
      { new: true, runValidators: true }
    ).populate("user", "name email role");

    if (!updatedWaiter) {
      return res.status(404).json({ message: "Mesero no encontrado" });
    }

    res.status(200).json(updatedWaiter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el mesero" });
  }
};

export const deleteWaiter = async (req, res) => {
  try {
    const deletedWaiter = await Waiter.findByIdAndDelete(req.params.id);

    if (!deletedWaiter) {
      return res.status(404).json({ message: "Mesero no encontrado" });
    }

    res.status(200).json({ message: "Mesero eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el mesero" });
  }
};