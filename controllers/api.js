const { web3Object } = require('../utils/web3');
const crypto = require('crypto');
const formValidate = require('../utils/formValidate');
const fetch = require('node-fetch');
const Diff = require('diff');
const fs = require('fs');
const Diff2html = require('diff2html');

exports.postStoreForm = (req, res, next) => {
    const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

    let gradeInfo = {};
    
    let fileData;
    if (!req.files) fileData = null;
    else fileData = req.files.grades_file.data.toString('utf-8');

    const school = req.body.school;
    const period = req.body.period;
    const course = req.body.course;
    const examDate = req.body.exam_date;
    const year = new Date(req.body.exam_date).getFullYear();
    const participants_number = req.body.participants_no;
    const pass_number = req.body.pass_no;
    const grades_asset_url = req.body.grades_asset_url;
    const grades_asset_hash = sha256(fileData);
    const grades_asset_content = Buffer.from(fileData).toString('base64');
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
        grades_asset_content: grades_asset_content,
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
        req.flash('messages', { type: 'success', value: 'User with Wallet: ' + wallet + " was added successfully to the vote list." })
        res.redirect('/add/node/form');
    })
    .catch(err => {
        req.flash('messages', { type: 'error', value: err.toString() })
        res.redirect('/add/node/form');
    })
}

exports.postValidate = (req, res, next) => {
    let courseInfo = JSON.parse(req.body.courseInfo);
    const school = courseInfo.school;
    const course = courseInfo.course;
    const belongs = courseInfo.period + " - " + courseInfo.examDate;

    let grades_asset_url = courseInfo.grades_asset_url;
    fetch(grades_asset_url)
    .then(response => response.text())
    .then(data => {
        // convert from base64 to ascii
        let grades_asset_content;
        let asset_url_content;
        
        getDataPromise = new Promise((resolve, reject) => {
            grades_asset_content = Buffer.from(courseInfo.grades_asset_content, 'base64').toString('ascii');
            asset_url_content = data;
            resolve();
        })

        Promise.all([getDataPromise]).then(() => {
            // check the content of the grades_asset (which is on the blockchain)
            // with the content of the url
            // keep all added and removed parts to construct a file (if anything has changed)
            let added = [], removed = [];
            const diff = Diff.diffLines(grades_asset_content, asset_url_content);

            diff.forEach(part => {
                if (part.added) added.push(part.value);
                if (part.removed) removed.push(part.value);
            });

            const diffJson = Diff2html.parse(Diff.createTwoFilesPatch('file_from_blockchain.bau', 'file_from_url.bau', grades_asset_content, asset_url_content));
            const diffHtml = Diff2html.html(diffJson, { 
                drawFileList: true,
                fileListToggle: false,
                fileListStartVisible: false,
                fileContentToggle: false,
                matching: 'lines',
                outputFormat: 'side-by-side',
                synchronisedScroll: true,
                highlight: true,
                renderNothingWhenEmpty: false,
            });
            
            if (added.length == 0 && removed.length == 0) {
                req.flash('messages', { type: 'success', value: "The file located at the URL has not been changed!" })
                res.redirect('/' + school.split(' ').join('-') + '/course/' + course);
            }
            else {
                fs.writeFileSync('public/downloads/file_from_blockchain.bau', grades_asset_content);
                fs.writeFileSync('public/downloads/file_from_url.bau', asset_url_content);
                
                res.render('diff.ejs', {
                    pageTitle: "Diff Page",
                    diffHtml: diffHtml,
                    school: school,
                    course: course,
                    belongs: belongs
                });
            }
        })
    });
}

exports.postVote = (req, res, next) => {
    const vote = req.query.vote === 'true';
    const address = req.params.address;

    web3Object.contracts.grades.deployed()
    .then(smartContractObj => {
        return smartContractObj.voteAdd.sendTransaction(address, vote, { from: web3Object.account });
    })
    .then(result => {
        req.flash('messages', { type: 'success', value: 'Your vote for user with Wallet ' + address + ' has been submitted.'})
        res.redirect('/show/vote-list');
    })
    .catch(err => {
        req.flash('messages', { type: 'error', value: err.toString() })
        res.redirect('/show/vote-list');
    })

}