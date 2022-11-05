import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize"
import db from "../config/Database"
import { updateStatsAfterMatchEnd } from "../controllers/updateUserInfo"

class Games extends Model<
    InferAttributes<Games>,
    InferCreationAttributes<Games>
> {
    declare id: CreationOptional<number>
    declare whiteUserName: string
    declare blackUserName: CreationOptional<string>
    declare winnerUserName: string
    declare loserUserName: CreationOptional<string>
    declare pgn: CreationOptional<string>
}

Games.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        whiteUserName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blackUserName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        winnerUserName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        loserUserName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pgn: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        hooks: {
            afterCreate: (games, options) => {
                if (games.winnerUserName) {
                    const black =
                        games.winnerUserName == games.blackUserName
                            ? true
                            : false

                    updateStatsAfterMatchEnd(
                        games.winnerUserName,
                        true,
                        false,
                        black
                    )

                    updateStatsAfterMatchEnd(
                        games.loserUserName,
                        false,
                        false,
                        !black
                    )
                }
            },
        },
        sequelize: db,
        tableName: "games",
    }
)

export default Games
