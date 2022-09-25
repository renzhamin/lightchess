import Users from "../../models/UserModel";
import bcrypt from "bcrypt";


export const resetPassword = async (req, res) => {
    try {
        const {password} = req.body;
        if (!password)
            return res.send("No data");
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        await Users.update({password: hashPassword, refresh_token: null}, {
            where: {
                id: req.userID
            }
        });
        res.json({msg: "Password Reset Successfull"});


    } catch (error) {
        res.status(404).send("Failed to reset password");
    }
};

export const verifyEmail = async (req, res) => {
    try {
        await Users.update({role: 1}, {where: {id: req.params.userID}});
        res.json({msg: "Email verification successful"});
    } catch (error) {
        res.json({msg: "couldnt verify email"});
        console.log(error);
    }
};

