import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Utilisateur from "./Utilisateur.model";


// Définition des attributs du Todo
interface TodoAttributes {
    id?: number;
    task: string;
    completed?: boolean;
    addedAt?: Date;
    userId: number; // FK vers Utilisateur
}

class Todo extends Model<TodoAttributes> implements TodoAttributes {
    public id!: number;
    public task!: string;
    public completed!: boolean;
    public addedAt!: Date;
    public userId!: number;
}

// Définition du modèle avec Sequelize
Todo.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        task: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // ✅ Par défaut, une tâche n'est pas complétée
        },
        addedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW, // ✅ Équivalent de `default: Date.now`
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Utilisateur,
                key: "id",
            },
        },
    },
    {
        sequelize,
        tableName: "todos",
        timestamps: false, // Désactivation de `createdAt` et `updatedAt` (optionnel)
    }
);

// 🔗 Définition de la relation avec l'utilisateur
Utilisateur.hasMany(Todo, { foreignKey: "userId", onDelete: "CASCADE" });
Todo.belongsTo(Utilisateur, { foreignKey: "userId" });

export default Todo;
