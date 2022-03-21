const { web3Object } = require('../utils/web3');
const moment = require('moment');

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
    let user;

    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    let findUserPromise = new Promise((resolve, reject) => {
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
            user = userObj;
            resolve();
        })
        .catch(err => {
            console.log(err);
            reject();
        });
    })

    let coursesRetrievePromise = new Promise((resolve, reject) => {
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
            resolve();
        })
        .catch(err => {
            console.log(err);
            reject();
        })
    })
    
    Promise.all([findUserPromise, coursesRetrievePromise]).then(() => {
        res.render('form.ejs', {
            pageTitle: "Add Grades Info Page",
            schools,
            school: user.belongsTo,
            messages: messages,
            isMaster: user['permission.isMaster']
        });
    })
    .catch(err => {
        console.log(err);
        req.flash('messages', {type: 'error', value: 'Something went wrong!'})
        res.redirect('/');
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
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    const code = req.params.code;
    const school = req.params.school;

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
            code,
            messages
        });
    })
    .catch(err => {
        req.flash('messages', { type: 'error', value: err.toString() })
        res.redirect('/courses');
    })
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