import { Table } from "../models/Table.model.js";
import { Waiter } from "../models/Waiter.model.js";

export const getTables = async (req, res) => {
    try {
        const tables = await Table.find().populate("assignedWaiter").sort({ number: 1 });
        res.status(200).json(tables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las mesas" });
    }
}

export const getTableById = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id).populate("assignedWaiter");
        if (!table) {
            return res.status(404).json({ message: "Mesa no encontrada" });
        }
        res.status(200).json(table);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la mesa" });
    }
}

export const createTable = async (req, res) => {
    try {
        const { number, capacity, assignedWaiter, status } = req.body;
        
        if (assignedWaiter) {
            const waiterExists = await Waiter.findById(assignedWaiter);
            if (!waiterExists) {
                return res.status(400).json({ message: "Camarero asignado no válido" });
            }
        }

        const existingTable = await Table.findOne({ number: number });
        if (existingTable) {
            return res.status(400).json({ message: "Ya existe una mesa con ese número" });
        }

        const table = new Table({
            number: number,
            capacity: capacity,
            assignedWaiter: assignedWaiter,
            status: status
        });

        const savedTable = await table.save();
        const populatedTable = await savedTable.populate("assignedWaiter");

        res.status(201).json(populatedTable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la mesa" });
    }
}

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, capacity, assignedWaiter, status } = req.body;

    if (assignedWaiter) {
      const waiterExists = await Waiter.findById(assignedWaiter);
      if (!waiterExists) {
        return res.status(400).json({ message: "El mesero asignado no existe" });
      }
    }

    const updatedTable = await Table.findByIdAndUpdate(
      id,
      {
        number,
        capacity,
        assignedWaiter: assignedWaiter || null,
        status,
      },
      { new: true, runValidators: true }
    ).populate("assignedWaiter");

    if (!updatedTable) {
      return res.status(404).json({ message: "Mesa no encontrada" });
    }

    res.status(200).json(updatedTable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la mesa" });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const deletedTable = await Table.findByIdAndDelete(req.params.id);

    if (!deletedTable) {
      return res.status(404).json({ message: "Mesa no encontrada" });
    }

    res.status(200).json({ message: "Mesa eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la mesa" });
  }
};