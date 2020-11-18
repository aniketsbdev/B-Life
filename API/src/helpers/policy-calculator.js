const minAge = 65
const minFaceValue = 10000
const maxLifeExpectancy = 10

const calculateAge = (dob) => {
    const dobAsDate = new Date(dob)
    const today = new Date()
    const miliDiff = Math.abs(today.getTime() - dobAsDate.getTime())
    const age = Math.ceil(miliDiff / (1000 * 3600 * 24 * 365.25))
    return age;
}

const checkPolicyEligibility = (data) => {
    if (data.age >= minAge && data.faceValue >= minFaceValue && data.policyPayout < data.faceValue) {
        return true;
    }

    return false;
}

const estimatePolicyAmount = (data) => {
    const policyEstimate = 3 * (data.faceValue - data.annualPremium * data.lifeExpectancy) / 4;
    return policyEstimate.toFixed(2)
}

module.exports = {
    checkPolicyEligibility,
    estimatePolicyAmount,
    calculateAge
}