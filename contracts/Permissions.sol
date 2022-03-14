// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Permissions {

    struct NodePermissions {
        bool hasAccess;
        bool isMaster;
        uint64 school;
    }

    address masterNode;
    mapping(address => NodePermissions) nodes;

    constructor() {
        masterNode = 0xc9da01d74bFB7e36DbF1712801733D6f324a6C93;
    }

    function retrieveNodePermissions(address node) view external returns(NodePermissions memory) {
        return nodes[node];
    }

    function addNetworkNode(address node, uint64 school, bool isMaster) public {
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
}