// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract HelloWorld {

    struct Data {
        string str;
    }

    struct CompleteData {
        Data[] data;
    }

    address[] nodes;
    mapping(address => bool) exists;

    mapping(address => Data[]) d;

    function add(string memory _str) public {
        d[msg.sender].push(Data(_str));

        if (!exists[msg.sender]) {
            nodes.push(msg.sender);
            exists[msg.sender] = true;
        }
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function get() public view returns(Data[] memory) {
        return d[msg.sender];
    }

    function getAll() public view returns(CompleteData[] memory) {
        require(msg.sender == 0xc9da01d74bFB7e36DbF1712801733D6f324a6C93, "Only Node A can see anyone's content.");
        
        CompleteData[] memory memoryArray = new CompleteData[](nodes.length + 1);
        Data[] memory n = new Data[](nodes.length);
        
        for (uint i = 0; i < nodes.length; i++) {
            n[i].str = toAsciiString(nodes[i]);
        }

        memoryArray[0].data = n;
        for (uint i = 0; i < nodes.length; i++) {
            memoryArray[i + 1].data = d[nodes[i]];
        }
        return memoryArray;
    }

}