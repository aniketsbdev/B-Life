const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');

const { Policy, statusTypes } = require('../models/policy');
const Escrow = require('../models/escrow');
const Company = require('../models/company');
const Transaction = require('../models/transaction');
const { success, error } = require('../helpers/response-handler');
const { checkPolicyEligibility, estimatePolicyAmount, calculateAge } = require('../helpers/policy-calculator');
const User = require('../models/user');
// const fileUpload = require('../helpers/file-upload');

const router = new express.Router()

const fileFilter = function (req, file, cb) {
    if (file && !file.originalname.match(/\.(pdf)$/)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "policyDocument"), false);
    }
    cb(null, true);

};

const options = {
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 mb max size
    },
    fileFilter: fileFilter
}

const upload = multer(options).fields([{ name: 'policyDocument', maxCount: 1 }, { name: 'ownerKycDocument', maxCount: 1 }]);

const fileUpload = (req, res, next) => {
    upload(req, res, function (err) {
        console.log(err, 'error from multer ...')
        if (err && err instanceof multer.MulterError) { //instanceof multer.MulterError
            if (err.code == 'LIMIT_FILE_SIZE') {
                return error(res, 400, { name: 'ValidationError', errors: { document: { message: 'Max allowed file size is 5 mb' } } })
            }

            if (err.code == 'LIMIT_UNEXPECTED_FILE') {
                return error(res, 400, { name: 'ValidationError', errors: { document: { message: 'Only pdf file is allowed' } } })
            }

            return error(res, 500, { name: 'ValidationError', errors: { document: { message: 'Document upload failed' } } })
        }

        next()
    })
}

const medUpload = multer(options).single('medicalDocument');

const medFileUpload = (req, res, next) => {
    medUpload(req, res, function (err) {
        // console.log(err, 'error from multer ...')
        if (err && err instanceof multer.MulterError) { //instanceof multer.MulterError
            if (err.code == 'LIMIT_FILE_SIZE') {
                return error(res, 400, { name: 'ValidationError', errors: { medicalDocument: { message: 'Max allowed file size is 5 mb' } } })
            }

            if (err.code == 'LIMIT_UNEXPECTED_FILE') {
                return error(res, 400, { name: 'ValidationError', errors: { medicalDocument: { message: 'Only pdf file is allowed' } } })
            }

            return error(res, 500, { name: 'ValidationError', errors: { medicalDocument: { message: 'Document upload failed' } } })
        }

        next()
    })
}

const transferUpload = multer(options).single('updatedPolicyDocument');

const transferFileUpload = (req, res, next) => {
    transferUpload(req, res, function (err) {
        // console.log(err, 'error from multer ...')
        if (err && err instanceof multer.MulterError) { //instanceof multer.MulterError
            if (err.code == 'LIMIT_FILE_SIZE') {
                return error(res, 400, { name: 'ValidationError', errors: { updatedPolicyDocument: { message: 'Max allowed file size is 5 mb' } } })
            }

            if (err.code == 'LIMIT_UNEXPECTED_FILE') {
                return error(res, 400, { name: 'ValidationError', errors: { updatedPolicyDocument: { message: 'Only pdf file is allowed' } } })
            }

            return error(res, 500, { name: 'ValidationError', errors: { updatedPolicyDocument: { message: 'Document upload failed' } } })
        }

        next()
    })
}

router.post('/policies', auth, fileUpload, async (req, res) => {

    req.body.isPolicyOwner = req.body.isPolicyOwner && req.body.isPolicyOwner === "false" ? false : true
    if (req.body.isPolicyOwner) {
        req.body.policyOwnerName = `${req.user.firstName} ${req.user.lastName}`
        req.body.policyOwnerEmail = req.user.email
        req.body.policyOwnerDob = req.user.dateOfBirth
    }

    // console.log(req.files);
    let policyDocument = req.files['policyDocument'][0] ? req.files['policyDocument'][0].buffer : null;
    let ownerKycDocument = null;
    if (req.files['ownerKycDocument']) {
        ownerKycDocument = req.files['ownerKycDocument'][0] ? req.files['ownerKycDocument'][0].buffer : null
    } else {
        let user = await User.findOne(req.user._id);
        ownerKycDocument = user.kycDocument
    }

    const policy = new Policy({
        ...req.body,
        seller: req.user._id,
        policyDocument,
        ownerKycDocument
    })
    console.log(policy, 'policy')
    try {
        const io = req.app.get('socketio');
        io.sockets.emit('new_notification', {
            _id: "akdjkah88",
            name: "Eligibilty Checked",
            // icon: data.icon,
        });
        await policy.save()
        success(res, 201, policy, 'Policy created successfully')
    } catch (e) {
        // console.log(e, 'policy error after saving');
        error(res, 400, e)
    }
})

router.get('/policies', auth, async (req, res) => {
    try {
        const filter = req.query;
        let where = {};

        if ([5, 6].includes(req.user.userType)) {
            where['seller'] = req.user._id;
        }

        if (req.user.userType === 3) {
            where['company'] = req.user.company
        }

        if (req.user.userType === 4) {
            where['medicalUnderWriterCompany'] = req.user.company
        }

        if (filter.policyStatus) {
            // console.log(filter.policyStatus);
            // For Active Request Page
            if (filter.policyStatus == 2 || filter.policyStatus == 3) {
                if (req.user.userType === 3) {
                    where['$or'] = [
                        { status: 2 }, { status: 6 }
                    ];
                } else if (req.user.userType === 4) {
                    where['status'] = 2
                } else {
                    where['$or'] = [
                        { status: 3 }
                    ];
                }
            }
            // For Offer Created
            else if (filter.policyStatus == 5) {
                where['$or'] = [
                    { status: 4 }, { status: 6 }, { status: 8 }
                ];
            } else if (filter.policyStatus == 6) {
                where['$or'] = [
                    { status: 5 }, { status: 7 }
                ];
            }
            else where.status = parseInt(filter.policyStatus);
        }
        delete filter.policyStatus;

        if (req.query.policyType) {
            where['policyType'] = parseInt(req.query.policyType);
            delete filter.policyType;
        }

        let skip = 0
        if (req.query.skip) {
            skip = parseInt(req.query.skip);
            delete filter.skip;
        }

        let limit = 10
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
            delete filter.limit;
        }

        for (const key in filter) {
            filter[key] && (where[key] = new RegExp(filter[key], 'i'));
        }
        // console.log(where, 'where condition');
        let totalRecords = 0;
        if (filter && Object.keys(where).length > 0) {
            totalRecords = await Policy.countDocuments(where);
        } else {
            totalRecords = await Policy.countDocuments();
        }
        const policies = await Policy.find(where)
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })

        success(res, 200, policies, 'Policies fetched successfully', totalRecords)
    } catch (e) {
        // console.log(e, 'error ....')
        error(res, 500, e)
    }
});

router.get('/policies/broker-stats', auth, async (req, res) => {
    // console.log(req, 'this is request')
    try {
        if (req.user.userType !== 5) {
            error(res, 400, { _message: 'You are not allowed to view stats' })
        }
        let policyStats = await Policy.aggregate([
            { $match: { seller: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        let soldPolicies = policyStats.filter(policy => policy._id == 8);
        // console.log(policyStats);
        const policy = {
            totalPolicies: policyStats.reduce((a, b) => a + (b['count'] || 0), 0),
            soldPolicies: soldPolicies[0] ? soldPolicies[0].count : 0
        };
        success(res, 200, policy, 'Policy Stats')
    } catch (e) {
        // console.log(e);
        error(res, 500, e)
    }
})

router.get('/policies/lsp-stats', auth, async (req, res) => {
    // console.log(req, 'this is request')
    try {
        if (req.user.userType !== 2) {
            error(res, 400, { _message: 'You are not allowed to view stats' })
        }
        let policyStats = await Policy.aggregate([
            { $match: {} },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        let activeRequests = 0, cancelledRequests = 0, offersCreated = 0;
        policyStats.forEach(policy => {
            if (policy._id == 3) {
                activeRequests += policy.count;
            }
            if (policy._id == 5 || policy._id == 7) {
                cancelledRequests += policy.count;
            }
            if (policy._id == 4 || policy._id == 6 || policy._id == 8 || policy._id == 9) {
                offersCreated += policy.count;
            }
        });
        const policy = {
            activeRequests, cancelledRequests, offersCreated
        };
        success(res, 200, policy, 'Policy Stats')
    } catch (e) {
        error(res, 500, e)
    }
})

router.post('/policies/eligibility', (req, res) => {
    try {
        if (!checkPolicyEligibility(req.body)) {
            return error(res, 400, { name: 'ValidationError', _message: 'Policy is not eligible for selling' })
        }
        const io = req.app.get('socketio');
        io.sockets.emit('new_notification', {
            _id: "akdjkah88",
            name: "Eligibilty Checked",
            // icon: data.icon,
        });
        success(res, 200, {}, "Your Policy is eligible to be sold")
    } catch (e) {
        console.log(e);
        error(res, 500, e)
    }
})

router.post('/policies/estimation', (req, res) => {
    try {
        if (!checkPolicyEligibility(req.body)) {
            return error(res, 400, { name: 'ValidationError', _message: 'Policy is not eligible for selling' })
        }

        const policyEstimatedAmount = estimatePolicyAmount(req.body)

        success(res, 200, {}, `Your policy should estimate worth $${policyEstimatedAmount}`)
    } catch (e) {
        error(res, 500, e)
    }

})

router.get('/policies/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const policy = await Policy.findOne({ _id, seller: req.user._id })

        if (!policy) {
            error(res, 404, { _message: 'Record not found' })
        }

        success(res, 200, policy, 'Policy fetched successfully')
    } catch (e) {
        error(res, 500, e)
    }
})

router.patch('/policies/update-medical-report/:id', auth, medFileUpload, async (req, res) => {
    try {
        // console.log(req.body, 'req body one ...');
        const where = { _id: req.params.id }

        const policy = await Policy.findOne(where)

        if (!policy) {
            return error(res, 404, { _message: 'Record not found' })
        }

        policy.lifeExpectancy = req.body.lifeExpectancy
        policy.medicalDocument = req.file ? req.file.buffer : null
        policy.processedByUnderwriter = true
        policy.verifiedByUnderwriter = true

        if (policy.verifiedByInsurer && policy.verifiedByUnderwriter && policy.status === 2) {
            policy.status = 3
        }

        await policy.save()
        success(res, 200, policy, 'Policy medical document updated successfully')
    } catch (e) {
        // console.log(e, 'error ....')
        error(res, 500, e)
    }
});

router.patch('/policies/update-transfer-document/:id', auth, transferFileUpload, async (req, res) => {
    try {
        const where = { _id: req.params.id }

        const policy = await Policy.findOne(where)

        if (!policy) {
            return error(res, 404, { _message: 'Record not found' })
        }

        policy.updatedPolicyDocument = req.file ? req.file.buffer : null
        policy.status = 8

        const escrow = await Escrow.findOne({ policy: policy._id })
        const user = await User.findOne({ _id: policy.seller });

        await User.updateOne({
            _id: policy.seller
        }, {
            wallet: parseInt(user.wallet) + parseInt(escrow.amount)
        });
        // await logTransaction(parseInt(user.wallet), parseInt(user.wallet) + parseInt(escrow.amount), policy.seller, policy.seller);
        escrow.transferDone = true;
        await escrow.save()

        await policy.save()
        success(res, 200, policy, 'Transfer document updated successfully')
    } catch (e) {
        // console.log(e, 'error ....')
        error(res, 500, e)
    }
});

router.patch('/policies/:id', auth, async (req, res) => {
    try {
        console.log(req.body, 'req body one ...');
        const where = { _id: req.params.id }

        if ([5, 6].includes(req.user.userType)) {
            where['seller'] = req.user._id
        }

        const policy = await Policy.findOne(where)

        if (!policy) {
            return error(res, 404, { _message: 'Record not found' })
        }

        if (req.body.isPolicyOwner) {
            req.body.policyOwnerName = `${req.user.firstName} ${req.user.lastName}`
            req.body.policyOwnerEmail = req.user.email
            req.body.policyOwnerDob = req.user.dateOfBirth
        }

        // console.log(req.body, policy, 'req body');
        Object.keys(req.body).forEach(key => {
            policy[key] = req.body[key]
        })

        // update the status if insurance company and medical under writer comapny verified the policy
        if (policy.verifiedByInsurer && policy.verifiedByUnderwriter && policy.status === 2) {
            policy.status = 3
        }
        // console.log(policy, 'policy document .....');

        if (policy.status === 4) {
            policy.lspCompany = req.user.company
            // fetch the company details
            const company = await Company.findById(policy.lspCompany);

            const wallet = parseFloat(company.wallet) - parseFloat(policy.offerAmount)
            // console.log(wallet, company, 'company details ...', policy.offerAmount, company.name)
            await logTransaction(company.wallet, wallet, req.user._id, company.id);
            company.wallet = wallet;
            company.userId = req.user._id;
            await company.save();

            const escrow = new Escrow({
                policy: policy._id,
                seller: policy.seller,
                purchaser: policy.lspCompany,
                amount: policy.offerAmount
            })

            try {
                await escrow.save()
            } catch (error) {
                // console.log(error, 'error')
            }
            // policy.status = 5
        }

        if (policy.status === 8) {
            // fetch the policy amount from escrow account
            const escrow = await Escrow.findOne({ policy: policy._id })
            const user = await User.findOne({ _id: policy.seller });

            await User.updateOne({
                _id: policy.seller
            }, {
                wallet: parseInt(user.wallet) + parseInt(escrow.amount)
            });
            // await logTransaction(parseInt(user.wallet), parseInt(user.wallet) + parseInt(escrow.amount), policy.seller, policy.seller);
            escrow.transferDone = true;
            await escrow.save()
        }

        await policy.save()
        success(res, 200, policy, 'Policy updated successfully')
    } catch (e) {
        console.log(e, 'error ....')
        error(res, 500, e)
    }
});

async function logTransaction(previousWalletAmount, updatedWalletAmount, userId, id) {
    console.log(previousWalletAmount, updatedWalletAmount);
    try {
        let transactionObj = { transactionDoneBy: userId, company: id };
        previousWalletAmount = parseFloat(previousWalletAmount);
        if (previousWalletAmount < updatedWalletAmount) {
            transactionObj.typeOfTransaction = 1;
            transactionObj.amount = updatedWalletAmount - previousWalletAmount;
        }
        if (previousWalletAmount > updatedWalletAmount) {
            transactionObj.typeOfTransaction = 2;
            transactionObj.amount = previousWalletAmount - updatedWalletAmount;
        }

        const transaction = new Transaction(transactionObj);

        await transaction.save();
    } catch (error) {
        console.log(error, 'error')
    }
}

router.get('/policies/:id/document', auth, async (req, res) => {
    try {
        console.log(req.params.id, 'policy id')
        const policy = await Policy.findById(req.params.id)

        if (!policy) {
            throw new Error()
        }
        // console.log(policy, 'policy details')
        if (req.query.type === 'policyDocument') {
            return res.send(Buffer.from(policy.policyDocument, 'binary'))
        }
        if (req.query.type === 'leReport') {
            return res.send(Buffer.from(policy.medicalDocument, 'binary'))
        }
        if (req.query.type === 'updatedPolicyDocument') {
            return res.send(Buffer.from(policy.updatedPolicyDocument, 'binary'))
        }
        if (req.query.type === 'ownerKycDocument') {
            return res.send(Buffer.from(policy.ownerKycDocument, 'binary'))
        }

        // res.contentType('application/pdf')
        // res.send(policy.policyDocument)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router;
