const { web3Object } = require('../utils/web3');

exports.postStoreForm = (req, res, next) => {
    let gradeInfo = {};

    const school = req.body.school;
    const period = req.body.period;
    const course = req.body.course;
    const examDate = req.body.exam_date;
    const participants_number = req.body.participants_no;
    const pass_number = req.body.pass_no;
    const grades_asset_url = req.body.grades_asset_url;
    const update_status = req.body.update_status;
    const notes = req.body.notes;

    gradeInfo = {
        school: school,
        period: period,
        course: course,
        examDate: examDate,
        participants_number: participants_number,
        pass_number: pass_number,
        grades_asset_url: grades_asset_url,
        update_status: update_status,
        notes: notes
    }

    console.log(gradeInfo);




}