const express = require('express')
const Company = require('../models/company')
const auth = require('../middleware/auth')
const { success, error } = require('../helpers/response-handler')
const router = new express.Router()

router.post('/companies', auth, async (req, res) => {
    if (req.body.companyType !== null) {
        req.body.companyType = parseInt(req.body.companyType);
    } else req.body.companyType = 0;
    const company = new Company(req.body);
    try {
        await company.save();
        success(res, 201, company, 'Company created successfully')
    } catch (e) {
        error(res, 400, e);
    }
});

router.get('/companies', auth, async (req, res) => {
    try {
        const filter = req.query;
        const where = {};

        if (req.query.companyType) {
            where['companyType'] = parseInt(req.query.companyType)
            delete filter.companyType
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

        for (const key in filter) {
            filter[key] && (where[key] = new RegExp(filter[key], 'i'));
        }

        let totalRecords = 0;
        if (filter && Object.keys(where).length > 0) {
            totalRecords = await Company.countDocuments(where);
        } else {
            totalRecords = await Company.countDocuments()
        }
        // console.log(filter, where);
        const companies = await Company.find(where)
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort({_id: -1})

        success(res, 200, companies, 'Companies fetched successfully', totalRecords)
    } catch (e) {
        console.log(e, 'error ....');
        error(res, 500, e);
    }
})

router.get('/companies/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const company = await Company.findOne({ _id })

        if (!company) {
            error(res, 404, { _message: 'Record not found' })
        }

        success(res, 200, company, 'Company fetched successfully')
    } catch (e) {
        error(res, 500, e)
    }
})

router.patch('/companies/:id', auth, async (req, res) => {
    try {
        const company = await Company.findOne({ _id: req.params.id })

        if (!company) {
            error(res, 404, { _message: 'Record not found' })
        }
        req.body.companyType = parseInt(req.body.companyType);
        Object.keys(req.body).forEach(key => {
            if (req.body[key]) {
                company[key] = req.body[key]
            }
        });
        await company.save();
        success(res, 200, company, 'Company updated successfully')
    } catch (e) {
        error(res, 500, e)
    }
})


module.exports = router;