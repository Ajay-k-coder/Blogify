const jwt = require('jsonwebtoken');
const SECRET = "King-Ragnor = That+is+My+Name"

function createToken(user){
    const payload = {
        _id: user._id,
        name :user.name,
        email: user.email,
        contact : user.contact,
        age: user.age,
        profilePicture: user.profilePicture,
    };
    const token = jwt.sign(payload, SECRET, {expiresIn: "24h"});
    return token;
}

function verifyToken(token){
    try{
        const decoded = jwt.verify(token, SECRET);
        return decoded;
    }
    catch(err){
        return null;
    }
}


module.exports = {
    createToken,
    verifyToken
}