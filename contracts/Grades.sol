// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface PermissionGrades {
    
    function retrieveNodePermissions(address node) view external returns(NodePermissionsLib.NodePermissions memory);
}

library NodePermissionsLib {
    struct NodePermissions {
        bool hasAccess;
        bool isMaster;
        uint64 school;
    }
}

contract Grades {

    PermissionGrades pg;

    struct CourseGradesData {
        string info;
    }

    struct CoursePeriodsData {
        uint64 key;
    }

    // mapping from school(hashed) to mapping of string(course_year_period - hashed) to courseGradesData information
    mapping(uint64 => mapping(uint64 => CourseGradesData[])) GradesMapping;

    // mapping from course(hashed) to course_year_period(hashed)
    mapping(uint64 => CoursePeriodsData[]) coursePeriods;

    function addRecord(uint64 school, string memory info, uint64 key, uint64 course) public {
        // must make a check to see if the sender has permissions
        NodePermissionsLib.NodePermissions memory permissions = pg.retrieveNodePermissions(msg.sender); 
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access");
        
        if (permissions.isMaster) {
            GradesMapping[school][key].push(CourseGradesData(info));
            coursePeriods[course].push(CoursePeriodsData(key));
        }
        else {
            GradesMapping[permissions.school][key].push(CourseGradesData(info));
            coursePeriods[course].push(CoursePeriodsData(key));
        }
    }
    
    function retrieveCourseGrades(uint64 course, uint64 school) public view returns(CourseGradesData[] memory) {
        NodePermissionsLib.NodePermissions memory permissions = pg.retrieveNodePermissions(msg.sender); 
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access");

        CourseGradesData[] memory result = new CourseGradesData[](coursePeriods[course].length);

        if (permissions.isMaster) {
            for (uint i = 0; i < coursePeriods[course].length; i++) {
                uint64 key = coursePeriods[course][i].key;
                for (uint j = 0; j < GradesMapping[school][key].length; j++) {
                    result[i].info = GradesMapping[school][key][j].info;
                }
            }
        }
        else {
            for (uint i = 0; i < coursePeriods[course].length; i++) {
                uint64 key = coursePeriods[course][i].key;
                for (uint j = 0; j < GradesMapping[permissions.school][key].length; j++) {
                    result[i].info = GradesMapping[permissions.school][key][j].info;
                }
            }
        }

        return result;
    }
}