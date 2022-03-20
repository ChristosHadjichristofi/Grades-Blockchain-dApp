// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Grades {

    /* permissions variables and structs */
    address masterNode = 0x93DA4769fff723eb1aE347B0C7F07b42f8C9664E;
    struct NodePermissions {
        bool hasAccess;
        bool isMaster;
        string school;
        address addr;
    }
    mapping(address => NodePermissions) nodes;
    address[] keysOfNodes;
    /* end of permissions */

    /* course grades variables and structs */
    struct CourseGradesData {
        string info;
    }

    // mapping from school(hashed) to mapping of string(course_year_period - hashed) to courseGradesData information
    mapping(string => mapping(string => CourseGradesData[])) GradesMapping;

    /* end of course grades */

    constructor() {
        keysOfNodes.push(masterNode);
        nodes[masterNode].hasAccess = true;
        nodes[masterNode].isMaster = true;
        nodes[masterNode].addr = masterNode;
        nodes[masterNode].school = "DEPARTMENT OF STUDIES NTUA";
    }

    /* grades functions */

    function addRecord(string memory school, string memory info, string memory course) public {
        // must make a check to see if the sender has permissions
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access");

        if (permissions.isMaster) GradesMapping[school][course].push(CourseGradesData(info));
        else GradesMapping[permissions.school][course].push(CourseGradesData(info));
    }

    function retrieveCourseGrades(string memory course, string memory school) public view returns(CourseGradesData[] memory) {
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access");
        if (keccak256(bytes(permissions.school)) != keccak256(bytes(school))) require(permissions.isMaster, "Only a master node can retrieve any schools' data");

        CourseGradesData[] memory result = new CourseGradesData[](GradesMapping[school][course].length);

        for (uint i = 0; i < GradesMapping[school][course].length; i++) {
            result[i].info = GradesMapping[school][course][i].info;
        }

        return result;
    }

    /* end grades functions */

    /* permissions functions */
    function retrieveNodePermissions(address node) public view returns(NodePermissions memory) {
        return nodes[node];
    }

    function retrieveParticipants() public view returns(NodePermissions[] memory) {
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
        require(permissions.isMaster == true, "You must be a master node to see participants");

        NodePermissions[] memory result = new NodePermissions[](keysOfNodes.length);

        for (uint i = 0; i < keysOfNodes.length; i++) {
            address _addr = keysOfNodes[i];
            result[i].hasAccess = nodes[_addr].hasAccess;
            result[i].isMaster = nodes[_addr].isMaster;
            result[i].school = nodes[_addr].school;
            result[i].addr = nodes[_addr].addr;
        }

        return result;
    }

    function addNetworkNode(address node, string memory school, bool isMaster) public {
        require(msg.sender == masterNode, "Only a master node can add a node to network.");
        keysOfNodes.push(node);
        nodes[node].hasAccess = true;
        nodes[node].isMaster = isMaster;
        nodes[node].school = school;
        nodes[node].addr = node;
    }

    function removeNetworkNode(address node) public {
        require(msg.sender == masterNode, "Only a master node can add a node to network.");
        require(nodes[node].hasAccess == true, "The node must be a member of the network to be removed.");
        nodes[node].hasAccess = false;
    }
    /* end permission functions */
}