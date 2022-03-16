const { web3Object } = require('../utils/web3');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

exports.getIndex = (req, res, next) => {
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    models.users.findOne({
        raw: true,
        where: { wallet: process.env.LOCAL_NODE_ADDR },
        include: [{
            model: models.permissions,
            on: {
                col1: sequelize.where(sequelize.col("users_id"), "=", sequelize.col("users.id"))
            }
        }]
    })
    .then(userObj => {
        res.render('index.ejs', {
            pageTitle: "Landing Page",
            isMaster: userObj['permission.isMaster'],
            messages
        });
    })
    
}

exports.getForm = (req, res, next) => {
    let schools = {};

    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    models.courses.findAll({
        raw: true,
        include: [{
            model: models.users,
            on: {
                col1: sequelize.where(sequelize.col("id"), "=", sequelize.col("courses.users_id"))
            }
        }]
    })
    .then(coursesArr => {
        for (const course of coursesArr) {
            if (!schools.hasOwnProperty(course['user.belongsTo'])) {
                schools[course['user.belongsTo']] = []
            }
            schools[course['user.belongsTo']].push({ code: course.code.toString(), name: course.name })
        }
        res.render('form.ejs', {
            pageTitle: "Add Grades Info Page",
            schools,
            school: "SCHOOL OF CIVIL ENGINEERING",
            messages: messages
        });
    })

}

exports.getAddNodeForm = (req, res, next) => {
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    res.render('add-node-form.ejs', {
        pageTitle: "Add Node Page",
        messages: messages
    });
}

exports.getCourseByID = (req, res, next) => {
    let retrievedCourseData = req.flash("retrievedCourseData");
    if (retrievedCourseData.length == 0) retrievedCourseData = [];

    res.render('course-info.ejs', {
        pageTitle: "Course Info Page",
        retrievedCourseData
    });
}

exports.getCourses = (req, res, next) => {
    let schools = {};

    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    models.permissions.findOne({
        raw: true,
        include: [{
            model: models.users,
            on: {
                col1: sequelize.where(sequelize.col("id"), "=", sequelize.col("permissions.users_id"))
            },
            where: { wallet: process.env.LOCAL_NODE_ADDR }
        }] 
    })
    .then(userInfo => {
        if (userInfo.isMaster) {
            return models.courses.findAll({
                raw: true,
                include: [{
                    model: models.users,
                    on: {
                        col1: sequelize.where(sequelize.col("id"), "=", sequelize.col("courses.users_id"))
                    }
                }]
            })
        }
        else {
            return models.courses.findAll({
                raw: true,
                include: [{
                    model: models.users,
                    on: {
                        col1: sequelize.where(sequelize.col("id"), "=", sequelize.col("courses.users_id"))
                    },
                    where: { id: userInfo.users_id }
                }]
            })
        }
    })
    .then(coursesArr => {
        for (const course of coursesArr) {
            if (!schools.hasOwnProperty(course['user.belongsTo'])) {
                schools[course['user.belongsTo']] = []
            }
            schools[course['user.belongsTo']].push({ code: course.code.toString(), name: course.name })
        }
        res.render('courses.ejs', {
            pageTitle: "Courses Page",
            schools,
            messages: messages
        });

    })

}

exports.getShowParticipants = (req, res, next) => {
    let participants = [];

    web3Object.contracts.grades.deployed()
    .then(instance => {
        return instance.retrieveParticipants.call({ from: web3Object.account });
    })
    .then(participantsRetrieved => {
        for (const p of participantsRetrieved) {
            participants.push({ hasAccess: p.hasAccess, isMaster: p.isMaster, school: p.school, wallet: p.addr });
        }
        res.render('show-participants.ejs', {
            pageTitle: "Show Participants Page",
            participants
        });
    })
    .catch(err => {
        req.flash('messages', { type: 'error', value: err.toString() })
        res.redirect('/');
    })   
}