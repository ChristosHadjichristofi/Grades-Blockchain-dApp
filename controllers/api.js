const { web3Object } = require('../utils/web3');
const crypto = require('crypto');
const formValidate = require('../utils/formValidate');
const moment = require('moment');

exports.postCoursesData = (req, res, next) => {

    const code = req.body.code;
    const school = req.body.school;

    let retrievedCourseData = {};

    web3Object.contracts.grades.deployed()
    .then(instance => {
        return instance.retrieveCourseGrades.call(code, school, { from: web3Object.account });
    })
    .then(JSON_StringArr => {
        if (JSON_StringArr.length == 0) {
            req.flash('messages', { type: 'error', value: "No information found!" })
            return res.redirect('/courses');
        }

        for (const stringified of JSON_StringArr) {
            o = JSON.parse(stringified);
            o.examDate = moment(o.examDate).format("DD/MM/YYYY hh:mm");

            if (!retrievedCourseData.hasOwnProperty(o.period + " - " + o.examDate)) 
                retrievedCourseData[o.period + " - " + o.examDate] = [];
            
            retrievedCourseData[o.period + " - " + o.examDate].push(o);
        }
        res.render('course-info.ejs', {
            pageTitle: "Course Info Page",
            retrievedCourseData,
            school,
            code
        });
        // req.flash('retrievedCourseData', retrievedCourseData);
        // req.flash('school', school);
        // res.redirect('/course/' + code);
    })
    .catch(err => {
        req.flash('messages', { type: 'error', value: err.toString() })
        res.redirect('/courses');
    })    
}

exports.postStoreForm = (req, res, next) => {
    const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

    let gradeInfo = {};

    const school = req.body.school;
    const period = req.body.period;
    const course = req.body.course;
    const examDate = req.body.exam_date;
    const year = new Date(req.body.exam_date).getFullYear();
    const participants_number = req.body.participants_no;
    const pass_number = req.body.pass_no;
    const grades_asset_url = req.body.grades_asset_url;
    const grades_asset_hash = (!req.files) ? null : sha256(req.files.grades_file.data.toString('utf-8'));
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

    mandatoryFields = {
        school: "School",
        year: "Year",
        period: "Period",
        course: "Course",
        examDate: "Exam Date",
        participants_number: "Participants Number",
        pass_number: "Number of Participants Passed",
        grades_asset_url: "Grades Asset (Url)",
        grades_asset_hash: "Grades Asset (File Upload)",
        update_status: "Update Status"
    }

    validationObj = formValidate.gradesInfo(gradeInfo, mandatoryFields);
    if(validationObj.error) {
        req.flash('messages', { type: 'error', value: validationObj.msg })
        return res.redirect('/form');
    }

    const key = course + "_" + year + "_" + period;

    web3Object.contracts.grades.deployed()
    .then(smartContractObj => {
        return smartContractObj.addRecord.sendTransaction(school, JSON.stringify(gradeInfo), course, { from: web3Object.account });
    })
    .then(result => {
        req.flash('messages', {type: 'success', value: 'The content of the form was submitted successfully!'})
        res.redirect('/form');
    })
    .catch(err => {
        req.flash('messages', { type: 'error', value: err.toString() })
        res.redirect('/form');
    })
}

exports.postNodePermissions = (req, res, next) => {

    const wallet = req.body.wallet;
    const school = req.body.school;
    const isMaster = (req.body.master == 'Yes') ? true : false;

    validationObj = formValidate.nodePermissions(wallet, school, isMaster);
    if(validationObj.error) {
        req.flash('messages', { type: 'error', value: validationObj.msg })
        return res.redirect('/add/node/form');
    }

    web3Object.contracts.grades.deployed()
    .then(smartContractObj => {
        return smartContractObj.addNetworkNode.sendTransaction(wallet, school, isMaster, { from: web3Object.account });
    })
    .then(result => {
        req.flash('messages', { type: 'success', value: 'User with Wallet: ' + wallet + " was added successfully as a participant." })
        res.redirect('/add/node/form');
    })
    .catch(err => {
        req.flash('messages', { type: 'error', value: err.toString() })
        res.redirect('/add/node/form');
    })
}