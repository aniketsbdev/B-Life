const success = (res, status, data, message, totalRecords = 0) => {
	const responseData = { data, status: 1, message }
	if (totalRecords) {
		responseData['count'] = totalRecords
	}
	// console.log(responseData, 'responseData ...')
	return res.status(status).send(responseData);
};

const error = (res, status, data) => {
	// console.log(data, 'error data')
	if (data && data.name && data.name === 'ValidationError') {
		let validationMessages = null;

		if (data.errors) {
			validationMessages = convertValidationMessages(data.errors)
		}

		const responseData = { errors: validationMessages, status: 0, message: data._message }
		return res.status(400).send(responseData);
	}

	if (status === 401) {
		const responseData = { errors: null, status: 0, message: data._message }
		return res.status(401).send(responseData);
	}

	if (status === 404) {
		const responseData = { errors: null, status: 0, message: data._message }
		return res.status(404).send(responseData);
	}

	const responseData = { errors: null, status: 0, message: 'Server Error' }
	return res.status(500).send(responseData);

};

const convertValidationMessages = (validations) => {
	const validationMessages = {};

	Object.keys(validations).forEach(key => {
		validationMessages[key] = validations[key].message
	})

	return validationMessages;
}

module.exports = {
	success,
	error
}