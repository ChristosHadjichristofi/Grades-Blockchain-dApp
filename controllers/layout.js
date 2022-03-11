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

exports.getData = (req, res, next) => {
    res.render('table.ejs', {
        pageTitle: "Show Records Page",
        blockchainData: []
    });
}