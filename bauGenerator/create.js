let faker = require('faker');
var fs = require('fs');

DUMMY_DATA_NUMBER = 50;
DUMMY_FILES = 15;

for (let files = 0; files < DUMMY_FILES; files++) {
    let content = "U\n"
            + "{\n"
            + "#;School Code;" + faker.datatype.number({'min': 1,'max': 9}) + ";#\n"
            + "#;School Title;" + faker.lorem.word() + ";#\n"
            + "#;Exam Period Code Ticket;" + faker.datatype.number({'min': 1,'max': 9}) + ";#\n"
            + "#;Verbal Exam Period Ticket;" + faker.lorem.word() + ";#\n"
            + "#;Academic Year;" + faker.datatype.number({'min': 2000,'max': 2022}) + ";#\n"
            + "#;Semester Code X/0;" + faker.datatype.number({'min': 1,'max': 9}) + ";#\n"
            + "#;Semester Verbal X/0;" + faker.lorem.word() + ";#\n"
            + "#;Ticket Code;" + faker.datatype.number({'min': 1,'max': 9}) + ";#\n"
            + "#;Ticket Verbal;unified;#\n"
            + "#;Course Title;" + faker.lorem.word() + ";#\n"
            + "#;Course ID;"+ faker.datatype.number({'min': 1,'max': 9999}) + ";With grades;YES;#\n"
            + "#;Course's Semester;" + faker.datatype.number({'min': 1,'max': 9}) + ";#\n"
            + "#;Professors;" + faker.name.findName() + ";#\n"
            + "#;A/A;STUDENT.ID;LASTNAME;FIRSTNAME;FATHERNAME;STUDENT.SEMESTER;NN;GRADE;GRADE REVISED;FORA.ID;IMPROVEMENT;#\n";

    for (i = 0; i < DUMMY_DATA_NUMBER; i++) {
        [firstName, lastName] = faker.name.findName().split(" ");
        [fatherName, _] = faker.name.findName().split(" ");
        content += "#;" + (i+1) + ";" 
                + faker.datatype.number({'min': 1000000,'max': 9999999}) + ";" 
                + firstName + ";" + lastName + ";" 
                + fatherName + ";" 
                + faker.datatype.number({'min': 1,'max': 40}) + ";"
                + faker.datatype.number({'min': 1,'max': 40}) + ";"
                + faker.datatype.number({'min': 0,'max': 10}) + ";"
                + ";"
                + faker.datatype.number({'min': 1,'max': 10})
                + ";#\n"
    }

    content += "}";

    fs.writeFile('bauGenerator/dummy/dummy_bau_' + files + '.bau', content, (err) => {
    if (err) throw err;
    console.log('File is created successfully.');
    });
}