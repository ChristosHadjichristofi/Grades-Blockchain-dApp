// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Grades {

    /* permissions variables, vote system and structs */

    // permissions of users
    struct UserPermissions {
        bool hasAccess;
        bool isMaster;
        string school;
        address addr;
    }
    // hold each user's permissions
    mapping(address => UserPermissions) users;
    // holds the keys of the users
    address[] keysOfUsers;
    // holds the number of the users
    uint usersNumber;

    // information for voting in order a new user to be added
    struct VotesInfo {
        uint yes;                           // number of users said yes
        uint no;                            // number of users said no
        uint index;                         // used to bind votes mapping with iterateVotes (for iteration)
        mapping(address => bool) voted;     // which users (participants) voted for this specific user
        bool ongoing;                       // if there is an ongoing vote for this specific user
    }

    // number of users that have applied (increases/decreases based on the status of all votes)
    uint usersApplied;
    // bind addresses with a uint (index of VotesInfo) so as to iterate the votes mapping
    mapping(uint => address) iterateVotes;
    // holds the votes information for every user that tries to be inserted to the network
    mapping(address => VotesInfo) votes;

    // used to constract the voting list that will be sent to a participant
    // to see all users that applied to be inserted to the network
    // a participant user will have the opportunity to vote for every user
    struct VoteList {
        address user;
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
        address masterUser = msg.sender;
        keysOfUsers.push(masterUser);
        users[masterUser].hasAccess = true;
        users[masterUser].isMaster = true;
        users[masterUser].addr = masterUser;
        users[masterUser].school = "DEPARTMENT OF STUDIES NTUA";

        usersNumber++;
        usersApplied = 0;
    }

    /* grades functions */

    function addRecord(string memory school, string memory info, string memory course) public {
        // must make a check to see if the sender has permissions
        UserPermissions memory permissions = retrieveUserPermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master user to have access.");

        if (permissions.isMaster) GradesMapping[school][course].push(CourseGradesData(info));
        else GradesMapping[permissions.school][course].push(CourseGradesData(info));
    }

    function retrieveCourseGrades(string memory course, string memory school) public view returns(CourseGradesData[] memory) {
        UserPermissions memory permissions = retrieveUserPermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master user to have access.");
        if (keccak256(bytes(permissions.school)) != keccak256(bytes(school))) require(permissions.isMaster, "Only a master user can retrieve any schools' data");

        CourseGradesData[] memory result = new CourseGradesData[](GradesMapping[school][course].length);

        for (uint i = 0; i < GradesMapping[school][course].length; i++) {
            result[i].info = GradesMapping[school][course][i].info;
        }

        return result;
    }

    /* end grades functions */

    /* permissions functions */
    function retrieveUserPermissions(address user) public view returns(UserPermissions memory) {
        return users[user];
    }

    function retrieveParticipants() public view returns(UserPermissions[] memory) {
        UserPermissions memory permissions = retrieveUserPermissions(msg.sender);
        require(permissions.isMaster == true, "You must be a master user to see participants.");

        UserPermissions[] memory result = new UserPermissions[](keysOfUsers.length);

        for (uint i = 0; i < keysOfUsers.length; i++) {
            address _addr = keysOfUsers[i];
            result[i].hasAccess = users[_addr].hasAccess;
            result[i].isMaster = users[_addr].isMaster;
            result[i].school = users[_addr].school;
            result[i].addr = users[_addr].addr;
        }

        return result;
    }

    function addNetworkUser(address user, string memory school, bool isMaster) public {
        require(users[msg.sender].isMaster, "Only a master user can add a user to network.");
        require(votes[user].ongoing == false, "There is already a vote ongoing for this user.");
        require(users[user].hasAccess == false, "The user is already in the network.");        
        // for voting
        votes[user].ongoing = true;
        votes[user].index = usersApplied;
        iterateVotes[usersApplied] = user;
        usersApplied++;
        // user's info, now the user has no access. All the other users must vote
        users[user].hasAccess = false;
        users[user].isMaster = isMaster;
        users[user].school = school;
        users[user].addr = user;
    }

    function voteAdd(address user, bool v) public {
        UserPermissions memory permissions = retrieveUserPermissions(msg.sender);
        require(permissions.hasAccess == true, "You must be inserted by a master user to have access.");
        require(votes[user].ongoing == true, "A vote for this user has not been initialized.");
        require(votes[user].voted[msg.sender] == false, "You have already voted for this particular user.");

        votes[user].voted[msg.sender] = true;
        if (v) votes[user].yes++;
        else votes[user].no++;

        if (votes[user].yes + votes[user].no == usersNumber) {

            if (votes[user].no == 0) {
                keysOfUsers.push(user);
                users[user].hasAccess = true;
                usersNumber++;
            }

            uint start = votes[user].index + 1;
            for (uint i = start; i < usersApplied; i++) {
                iterateVotes[i - 1] = iterateVotes[i];
                votes[iterateVotes[i - 1]].index--;
            }

            delete iterateVotes[usersApplied - 1];
            usersApplied--;
            votes[user].ongoing = false;
            
            for (uint i = 0; i < keysOfUsers.length; i++)
                if (keysOfUsers[i] != user)
                    votes[user].voted[keysOfUsers[i]] = false;

            delete votes[user];
        }
    }

    function voteList() public view returns(VoteList[] memory) {
        require(users[msg.sender].hasAccess == true, "You must be inserted by a master user to have access.");

        // determine result length
        uint resultLength = 0;
        for (uint i = 0; i < usersApplied; i++)
            if (votes[iterateVotes[i]].voted[msg.sender] == false && votes[iterateVotes[i]].ongoing) resultLength++;

        // create array of structs with length eq to resultLength
        VoteList[] memory result = new VoteList[](resultLength);

        for (uint i = 0; i < usersApplied; i++) {
            address userAddr = iterateVotes[i];
            VotesInfo storage v = votes[userAddr];
            if (v.voted[msg.sender] == false) {
                result[i].user = userAddr;
                result[i].yes = v.yes;
                result[i].no = v.no;
            }
        }

        return result;

    }
    /* end permission functions */
}