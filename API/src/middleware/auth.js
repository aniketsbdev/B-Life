const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { error } = require('../helpers/response-handler')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        // console.log(user, 'user .....');
        if (!user) {
            error(res, 401, {_message: "Please login to continue" });
        }

        req.token = token;
        req.user = user;
        next()
    } catch (e) {
        console.log(e);
        error(res, 401, {_message: "Please login to continue" });
    }
}

module.exports = auth