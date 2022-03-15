const { web3Object } = require('../utils/web3');
const crypto = require('crypto');


exports.postCoursesData = (req, res, next) => {

    const code = req.body.code;
    const school = req.body.school;

    let blockchainData = [];

    web3Object.contracts.grades.deployed()
    .then(smartContractObj => {
        return smartContractObj.retrieveCourseGrades.sendTransaction(code, school, { from: web3Object.account });
    })
    .then(result => {
        console.log(result);

        res.render('table.ejs', {
            pageTitle: "Show Records Page",
            blockchainData
        });
    })
    .catch(err => {
        console.log(err);

        res.render('table.ejs', {
            pageTitle: "Show Records Page",
            blockchainData
        });
    })

    
}

exports.postStoreForm = (req, res, next) => {
    const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

    let gradeInfo = {};

    const school = req.body.school;
    const year = req.body.year;
    const period = req.body.period;
    const course = req.body.course;
    const examDate = req.body.exam_date;
    const participants_number = req.body.participants_no;
    const pass_number = req.body.pass_no;
    const grades_asset_url = req.body.grades_asset_url;
    const grades_asset_hash = sha256(req.files.grades_file.data.toString('utf-8'));
    const update_status = req.body.update_status;
    const notes = req.body.notes;

    gradeInfo = {
        school: school,
        year: year,
        period: period,
        course: course,
        examDate: examDate,
        participants_number: participants_number,
        pass_number: pass_number,
        grades_asset_url: grades_asset_url,
        grades_asset_hash: grades_asset_hash,
        update_status: update_status,
        notes: notes
    };

    const key = course + "_" + year + "_" + period;

    web3Object.contracts.grades.deployed()
    .then(smartContractObj => {
        return smartContractObj.addRecord.sendTransaction(school, JSON.stringify(gradeInfo), key, course, { from: web3Object.account });
    })
    .then(result => {
        console.log(result);

        // render page and show respective message
    })
    .catch(err => {
        console.log(err);

        // render page and show respective message
    })
}

exports.postNodePermissions = (req, res, next) => {

    const wallet = req.body.wallet;
    const school = req.body.school;
    const isMaster = req.body.master;

    web3Object.contracts.permissions.deployed()
    .then(smartContractObj => {
        return smartContractObj.addNetworkNode.sendTransaction(wallet, school, isMaster, { from: web3Object.account });
    })
    .then(result => {
        console.log(result);

        // render page and show respective message
    })
    .catch(err => {
        console.log(err);

        // render page and show respective message
    })
}