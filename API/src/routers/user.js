const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const Company = require('../models/company');
const auth = require('../middleware/auth');
// const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');
const { success, error } = require('../helpers/response-handler');
const router = new express.Router();

const fileFilter = function (req, file, cb) {
    if (file && !file.originalname.match(/\.(pdf)$/)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "kycDocument"), false);
    }
    cb(null, true);

};

const options = {
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 mb max size
    },
    fileFilter: fileFilter
}

const kycUpload = multer(options).single('kycDocument');

const fileUpload = (req, res, next) => {
    kycUpload(req, res, function (err) {
        // console.log(err, 'error from multer ...')
        if (err && err instanceof multer.MulterError) { //instanceof multer.MulterError
            if (err.code == 'LIMIT_FILE_SIZE') {
                return error(res, 400, { name: 'ValidationError', errors: { kycDocument: { message: 'Max allowed file size is 5 mb' } } })
            }

            if (err.code == 'LIMIT_UNEXPECTED_FILE') {
                return error(res, 400, { name: 'ValidationError', errors: { kycDocument: { message: 'Only pdf file is allowed' } } })
            }

            return error(res, 500, { name: 'ValidationError', errors: { kycDocument: { message: 'Document upload failed' } } })
        }

        next()
    })
}

router.post('/register', fileUpload, async (req, res) => {
    if (req.body.userType !== null) {
        req.body.userType = parseInt(req.body.userType);
    } else req.body.userType = 0;
    // console.log(req.body);
    const user = new User({
        ...req.body,
        kycDocument: req.file ? req.file.buffer : null
    });
    try {
        await user.save();
        // sendWelcomeEmail(user.email, user.name)
        const data = user.filterFields(["firstName", "lastName", "email"])
        success(res, 201, data, 'You are registered successfully')
    } catch (e) {
        // console.log(e, 'error')
        error(res, 400, e)
    }
});

router.post('/login', async (req, res) => {
    try {
        // console.log(req, 'requested body');
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        const userData = user.filterFields(["_id", "firstName", "lastName", "email", "dateOfBirth", "userType", "kycChecked", "isActive"]);
        const data = { ...userData, token };
        success(res, 200, data, 'You are logged in successfully');
    } catch (e) {
        // console.log(e, 'error ...')
        error(res, 400, e)
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save({ validateBeforeSave: false })

        success(res, 200, {}, 'You are logged out successfully')
    } catch (e) {
        error(res, 400, e)
    }
})

router.post('/logout-all-devices', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save({ validateBeforeSave: false })
        success(res, 200, {}, 'You are logged out of all devices successfully')
    } catch (e) {
        error(res, 400, e)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save()
        // sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/users/wallet', auth, async (req, res) => {
    const user = req.user;
    const wallet = req.body.wallet;
    console.log(user.userType);
    if (user.userType == 2) {
        req.body.userId = req.user._id;
        let company = await Company.findOne({ _id: user.company });
        await company.updateOne(req.body);
    }
    else if (user.userType === 5 || user.userType === 6) {
        await User.updateOne({ _id: req.user._id }, req.body);
    }
    try {
        res.status(201).send({ wallet });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.patch('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });

        if (!user) {
            error(res, 404, { _message: 'Record not found' });
        }
        let updatedUser = {};
        const password = req.body.password;
        if (password && password != '') {
            const hashedPass = await bcrypt.hash(password, 8);
            req.body.password = hashedPass;
        }
        else delete req.body.password;
        Object.keys(req.body).forEach(key => {
            updatedUser[key] = req.body[key]
        });
        console.log(user.wallet, updatedUser.wallet);
        await user.updateOne(updatedUser);
        success(res, 200, user, 'User updated successfully');
    } catch (e) {
        // console.log(e);
        error(res, 500, e)
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        // sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.updateOne(req.user);
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/wallet', auth, async (req, res) => {
    try {
        const user = req.user;
        let walletDetails = {};
        if (user.userType == 2) {
            walletDetails = await Company.findOne({ _id: user.company });
        }
        else if (user.userType == 5 || user.userType == 6) {
            walletDetails = await User.findOne({ _id: user._id });
        }
        // const walletData = walletDetails.filterFields(["_id", "wallet"]);
        success(res, 200, walletDetails, 'Wallet amount');
    } catch (e) {
        // console.log(e, 'error ....');
        error(res, 500, e);
    }
});

router.get('/users', auth, async (req, res) => {
    try {
        const filter = req.query;
        let where = {};

        if (req.query.userType) {
            where['userType'] = parseInt(req.query.userType)
            delete filter.userType
        }

        let skip = 0
        if (req.query.skip) {
            skip = parseInt(req.query.skip)
            delete filter.skip
        }

        let limit = 10
        if (req.query.limit) {
            limit = parseInt(req.query.limit)
            delete filter.limit
        }
        if (filter.externalUser === 'true') {
            where = {
                $and: [
                    {
                        $or: [
                            { userType: 5 }, { userType: 6 }
                        ]
                    },
                    // { kycChecked: false }
                ]
            };
        }
        delete filter.externalUser;

        for (const key in filter) {
            filter[key] && (where[key] = new RegExp(filter[key], 'i'));
        }

        let totalRecords = 0;
        if (filter && Object.keys(where).length > 0) {
            totalRecords = await User.countDocuments(where);
        } else {
            totalRecords = await User.countDocuments()
        }
        // console.log(filter, where);
        const users = await User.find(where)
            .select('-__v, -password')
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })

        // const updatedPolicies = policies.map(p => {
        //     const updatedValues = { v1: p.faceValue.toString(),
        //     v2: p.deathBenefit.toString(),
        //     v3: p.annualPremium.toString(),
        //     v4: p.cashSurrenderValue.toString() }
        //     return {...p, ...updatedValues };
        // })

        success(res, 200, users, 'Users fetched successfully', totalRecords)
    } catch (e) {
        // console.log(e, 'error ....')
        error(res, 500, e)
    }
});

router.get('/users/transactions', auth, async (req, res) => {
    try {
        const filter = req.query;
        let where = {};
        where.transactionDoneBy = req.user._id;

        let skip = 0
        if (req.query.skip) {
            skip = parseInt(req.query.skip)
            delete filter.skip
        }

        let limit = 10
        if (req.query.limit) {
            limit = parseInt(req.query.limit)
            delete filter.limit
        }

        let totalRecords = 0;
        if (filter && Object.keys(where).length > 0) {
            totalRecords = await Transaction.countDocuments(where);
        } else {
            totalRecords = await Transaction.countDocuments();
        }
        // console.log(filter, where);
        const transactions = await Transaction.find(where)
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })

        success(res, 200, transactions, 'Transactions fetched successfully', totalRecords);
    } catch (e) {
        console.log(e, 'error ....');
        error(res, 500, e);
    }
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
});

router.get('/users/:id/kycDocument', auth, async (req, res) => {
    try {
        console.log(req.params.id, 'user id')
        const user = await User.findById(req.params.id)
        if (!user) {
            throw new Error()
        }
        return res.send(Buffer.from(user.kycDocument, 'binary'))
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/users/:id', auth, async (req, res) => {
    console.log("lfijjdsfl");
    const _id = req.params.id

    try {
        const user = await User.findOne({ _id })

        if (!user) {
            error(res, 404, { _message: 'Record not found' })
        }

        success(res, 200, user, 'User fetched successfully')
    } catch (e) {
        error(res, 500, e)
    }
});

module.exports = router