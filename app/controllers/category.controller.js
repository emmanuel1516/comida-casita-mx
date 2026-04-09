import { Category } from "../models/category.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(400).json({ message: "La categoría ya existe" });
    }

    const category = new Category({
      name,
      description,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);

  } catch (error) {
    res.status(500).json({ message: "Error al crear la categoría" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la categoría" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.status(200).json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la categoría" });
  }
};