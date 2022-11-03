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
    declare whiteUserId: string
    declare blackUserId: CreationOptional<string>
    declare winnerUserId: string
    declare loserUserId: CreationOptional<string>
    declare pgn: CreationOptional<string>
}

Games.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        whiteUserId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blackUserId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        winnerUserId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        loserUserId: {
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
