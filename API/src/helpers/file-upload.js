const multer = require('multer')
const error = require('./response-handler')

// const allowedExtensions = ['pdf'];

const fileFilter = function (req, file, cb) {
    if (file && !file.originalname.match(/\.(pdf)$/)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
    cb(null, true);

};

const options = {
    limits: {
        fileSize: 1024 * 5 // 5 mb max size
    },
    fileFilter: fileFilter
}

const upload = multer(options).single('policyDocument')

const fileUpload = (req, res) => {
    upload(req, res, function (err) {
        if (err && err instanceof multer.MulterError) { //instanceof multer.MulterError
            if (err.code == 'LIMIT_FILE_SIZE') {
                error(res, 400, { name: 'ValidationError', _message: 'Max allowed file size is 5 mb' })
            }

            if (err.code == 'LIMIT_UNEXPECTED_FILE') {
                error(res, 400, { name: 'ValidationError', _message: 'Only pdf file are allowed' })
            }

            error(res, 500, { _message: 'Only pdf file are allowed' })
        }
    })
}

module.exports = fileUpload