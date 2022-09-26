import { Sequelize,DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import db from "../config/Database";


class FUsers extends Model<InferAttributes<FUsers>, InferCreationAttributes<FUsers>> {
    declare id : CreationOptional<number>
    declare provider : string
    declare subject : string
//     declare createdAt : CreationOptional<Date>
//     declare updatedAt : CreationOptional<Date>
}


FUsers.init(
    {
        id : {
            type : DataTypes.INTEGER.UNSIGNED,
            primaryKey : true
        },
        provider:{
            type: DataTypes.STRING,
            unique : 'u1'
        },
        subject :{
            type : DataTypes.STRING,
            unique : 'u1'
        },
    }
    ,{
        sequelize : db,
        tableName : 'federated_credentials'
    }
)


export default FUsers;
