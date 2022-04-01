// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Grades {

    /* permissions variables, vote system and structs */

    // master node (should be the address that deployes the contract)
    address masterNode = 0xd173b52741866b40587489D843E0Cc977F965410;
    // permissions of nodes
    struct NodePermissions {
        bool hasAccess;
        bool isMaster;
        string school;
        address addr;
    }
    // hold each node's permissions
    mapping(address => NodePermissions) nodes;
    // holds the keys of the nodes
    address[] keysOfNodes;
    // holds the number of the nodes
    uint nodesNumber;

    // information for voting in order a new node to be added
    struct VotesInfo {
        uint yes;                           // number of nodes said yes
        uint no;                            // number of nodes said no
        uint index;                         // used to bind votes mapping with iterateVotes (for iteration)
        mapping(address => bool) voted;     // which nodes (participants) voted for this specific node
        bool ongoing;                       // if there is an ongoing vote for this specific node
    }

    // number of nodes that have applied (increases/decreases based on the status of all votes)
    uint nodesApplied;
    // bind addresses with a uint (index of VotesInfo) so as to iterate the votes mapping
    mapping(uint => address) iterateVotes;
    // holds the votes information for every node that tries to be inserted to the network
    mapping(address => VotesInfo) votes;

    // used to constract the voting list that will be sent to a participant
    // to see all nodes that applied to be inserted to the network
    // a participant node will have the opportunity to vote for every node
    struct VoteList {
        address node;
        uint yes;
        uint no;
    }
    /* end of permissions */

    /* course grades variables and structs */
    struct CourseGradesData {
        string info;
    }

    // mapping from school to mapping of string(course_year_period) to courseGradesData information
    mapping(string => mapping(string => CourseGradesData[])) GradesMapping;

    /* end of course grades */

    constructor() {
        keysOfNodes.push(masterNode);
        nodes[masterNode].hasAccess = true;
        nodes[masterNode].isMaster = true;
        nodes[masterNode].addr = masterNode;
        nodes[masterNode].school = "DEPARTMENT OF STUDIES NTUA";

        nodesNumber++;
        nodesApplied = 0;
    }

    /* grades functions */

    function addRecord(string memory school, string memory info, string memory course) public {
        // must make a check to see if the sender has permissions
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access.");

        if (permissions.isMaster) GradesMapping[school][course].push(CourseGradesData(info));
        else GradesMapping[permissions.school][course].push(CourseGradesData(info));
    }

    function retrieveCourseGrades(string memory course, string memory school) public view returns(CourseGradesData[] memory) {
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access.");
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
        require(permissions.isMaster == true, "You must be a master node to see participants.");

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
        require(votes[node].ongoing == false, "There is already a vote ongoing for this node.");
        require(nodes[node].hasAccess == false, "The node is already in the network.");        
        // for voting
        votes[node].ongoing = true;
        votes[node].index = nodesApplied;
        iterateVotes[nodesApplied++] = node;
        // node's info, now the node has no access. All the other nodes must vote
        nodes[node].hasAccess = false;
        nodes[node].isMaster = isMaster;
        nodes[node].school = school;
        nodes[node].addr = node;
    }

    function voteAdd(address node, bool v) public {
        NodePermissions memory permissions = retrieveNodePermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master node to have access.");
        require(votes[node].ongoing == true, "A vote for this node has not been initialized.");
        require(votes[node].voted[msg.sender] == false, "You have already voted for this particular node.");

        votes[node].voted[msg.sender] = true;
        if (v) votes[node].yes++;
        else votes[node].no++;

        if (votes[node].yes + votes[node].no == nodesNumber) {

            if (votes[node].no == 0) {
                keysOfNodes.push(node);
                nodes[node].hasAccess = true;
                nodesNumber++;
            }

            nodesApplied--;
            
            for (uint i = 0; i < keysOfNodes.length; i++)
                votes[node].voted[keysOfNodes[i]] = false;

            delete iterateVotes[votes[node].index];
            delete votes[node];
        }
    }

    function voteList() public view returns(VoteList[] memory) {
        require(nodes[msg.sender].hasAccess == true, "You must be inserted by a master node to have access.");

        // determine result length
        uint resultLength = 0;
        for (uint i = 0; i < nodesApplied; i++)
            if (votes[iterateVotes[i]].voted[msg.sender] == false) resultLength++;

        // create array of structs with length eq to resultLength
        VoteList[] memory result = new VoteList[](resultLength);

        for (uint i = 0; i < nodesApplied; i++) {
            address nodeAddr = iterateVotes[i];
            VotesInfo storage v = votes[nodeAddr];
            if (v.voted[msg.sender] == false) {
                result[i].node = nodeAddr;
                result[i].yes = v.yes;
                result[i].no = v.no;
            }
        }

        return result;

    }
    /* end permission functions */
}