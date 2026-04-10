import { Category } from "../models/category.model.js";
import { Dish } from "../models/dish.model.js";

export const getDishes = async (req, res) => {
    try {
        const dishes = await Dish.find().populate("category").sort({ createdAt: -1 });
        res.status(200).json(dishes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los platos" });
    }
}

export const getDishById = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id).populate("category");
        if (!dish) {
            return res.status(404).json({ message: "Plato no encontrado" });
        }
        res.status(200).json(dish);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el plato" });
    }
}

export const createDish = async (req, res) => {
    try {
        const { name, description, category, price, available } = req.body;

        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(400).json({ message: "Categoría no válida" });
        }

        const existingDish = await Dish.findOne({ name: name.trim() });
        if (existingDish) {
            return res.status(400).json({ message: "Ya existe un plato con ese nombre" });
        }

        const dish = new Dish({
            name: name.trim(),
            description: description.trim(),
            category: category,
            price: price,
            available: available
        });

        const savedDish = await dish.save();
        res.status(201).json(savedDish);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el plato" });
    }
}

export const updateDish = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, available } = req.body;
        const dish = await Dish.findById(id);

        if (!dish) {
            return res.status(404).json({ message: "Plato no encontrado" });
        }

        if (category) {
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                return res.status(400).json({ message: "Categoría no válida" });
            }
            dish.category = category;
        }

        const updatedDish = await Dish.findByIdAndUpdate(
            id,
            { name, description, category, price, available },
            { new: true, runValidators: true }
        ).populate("category");

        if (!updatedDish) {
            return res.status(404).json({ message: "Platillo no encontrado" });
        }

        res.status(200).json(updatedDish);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el platillo" });
    }
}

export const deleteDish = async (req, res) => {
    try {
        const deletedDish = await Dish.findByIdAndDelete(req.params.id);
        if (!deletedDish) {
            return res.status(404).json({ message: "Plato no encontrado" });
        }
        res.status(200).json({ message: "Plato eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el plato" });
    }
}
