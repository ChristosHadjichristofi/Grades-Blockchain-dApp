// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Grades {

    /* permissions variables and structs */
    address masterNode = 0x93DA4769fff723eb1aE347B0C7F07b42f8C9664E;
    struct NodePermissions {
        bool hasAccess;
        bool isMaster;
        string school;
    }
    mapping(address => NodePermissions) nodes;

    /* end of permissions */

    /* course grades variables and structs */
    struct CourseGradesData {
        string info;
    }

    struct CoursePeriodsData {
        string key;
    }

    // mapping from school(hashed) to mapping of string(course_year_period - hashed) to courseGradesData information
    mapping(string => mapping(string => CourseGradesData[])) GradesMapping;

    // mapping from course(hashed) to course_year_period(hashed)
    mapping(string => CoursePeriodsData[]) coursePeriods;

    /* end of course grades */

    constructor() {
        nodes[masterNode].hasAccess = true;
        nodes[masterNode].isMaster = true;
    }

    /* grades functions */

    function addRecord(string memory school, string memory info, string memory key, string memory course) public {
        // must make a check to see if the sender has permissions
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
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

    function retrieveCourseGrades(string memory course, string memory school) public view returns(CourseGradesData[] memory) {
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access");

        CourseGradesData[] memory result = new CourseGradesData[](coursePeriods[course].length);

        if (permissions.isMaster) {
            for (uint i = 0; i < coursePeriods[course].length; i++) {
                string memory key = coursePeriods[course][i].key;
                for (uint j = 0; j < GradesMapping[school][key].length; j++) {
                    result[i].info = GradesMapping[school][key][j].info;
                }
            }
        }
        else {
            for (uint i = 0; i < coursePeriods[course].length; i++) {
                string memory key = coursePeriods[course][i].key;
                for (uint j = 0; j < GradesMapping[permissions.school][key].length; j++) {
                    result[i].info = GradesMapping[permissions.school][key][j].info;
                }
            }
        }

        return result;
    }

    /* end grades functions */

    /* permissions functions */
    function retrieveNodePermissions(address node) public view returns(NodePermissions memory) {
        return nodes[node];
    }

    function addNetworkNode(address node, string memory school, bool isMaster) public {
        require(msg.sender == masterNode, "Only a master node can add a node to network.");
        nodes[node].hasAccess = true;
        nodes[node].isMaster = isMaster;
        nodes[node].school = school;
    }

    function removeNetworkNode(address node) public {
        require(msg.sender == masterNode, "Only a master node can add a node to network.");
        require(nodes[node].hasAccess == true, "The node must be a member of the network to be removed.");
        nodes[node].hasAccess = false;
    }
    /* end permission functions */
}