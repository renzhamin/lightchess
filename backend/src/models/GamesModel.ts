import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize"
import db from "../config/Database"

class Games extends Model<
    InferAttributes<Games>,
    InferCreationAttributes<Games>
> {
    declare id: CreationOptional<number>
    declare whiteUsername: string
    declare blackUsername: CreationOptional<string>
    declare winnerUsername: string
    declare loserUsername: CreationOptional<string>
    declare pgn: CreationOptional<string>
}

Games.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        whiteUsername: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blackUsername: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        winnerUsername: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        loserUsername: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pgn: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        tableName: "games",
        // timestamps: false,
    }
)

export default Games
