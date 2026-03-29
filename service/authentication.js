const jwt = require('jsonwebtoken');
const SECRET = "King-Ragnor = That+is+My+Name"

function createToken(user){
    const payload = {
        id: user.id,
        full_name :user.full_name,
        email: user.email,
        age: user.age,
        bio : user.bio,
       profile_image_url: user.profile_image_url,
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