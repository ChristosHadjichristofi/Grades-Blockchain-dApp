const { web3Object } = require('../utils/web3');

exports.getIndex = (req, res, next) => {
    res.render('index.ejs', {
        pageTitle: "Landing Page"
    });
}

exports.getForm = (req, res, next) => {
    res.render('form.ejs', {
        pageTitle: "Add Grades Info Page"
    });
}

exports.getCourses = (req, res, next) => {
    let courses = [];

    res.render('courses.ejs', {
        pageTitle: "Courses Page",
        courses
    });
}