import db from "./config/Database"
import User from "./models/UserModel"
import Sequelize from "sequelize"

import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize"

class Match extends Model<
InferAttributes<Match>,
InferCreationAttributes<Match>
> {
    declare opponent: number
    //     declare createdAt : CreationOptional<Date>
    //     declare updatedAt : CreationOptional<Date>
}

Match.init(
    {
        opponent: {
            type: DataTypes.INTEGER.UNSIGNED,
        },

    },
    {
        sequelize: db,
        tableName: "Match",
    }
)

User.hasMany(Match)
Match.belongsTo(User)

const main = async () => {
    await Match.drop()
    await db.sync()
    await db.authenticate()
    console.log("Connected")

    const user = await User.findOne({
        where : {
            name : "fahim"
        }
    })

    
    const user2 = await User.findOne({
        where : {
            name : "Maruf Rudhra"
        }
    })

    await user2.createMatch({
        opponent : 10,
    })
    
    await user.createMatch({
        opponent : 15,
    })

    const allMatches = await user2.getMatches()
    console.log(allMatches)

}

main()
