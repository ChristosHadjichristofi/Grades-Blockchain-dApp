const { web3Object } = require('../utils/web3');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

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

exports.getAddNodeForm = (req, res, next) => {
    res.render('add-node-form.ejs', {
        pageTitle: "Add Node Page"
    });
}

exports.getCourses = (req, res, next) => {
    let schools = {};

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
        console.log(userInfo)
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
            // let c = {
            //     code: course.code.toString(),
            //     name: course.name,
            //     belongsTo: course['user.belongsTo']
            // };
            // courses.push(c);
        }
        res.render('courses.ejs', {
            pageTitle: "Courses Page",
            schools
        });

    })

}