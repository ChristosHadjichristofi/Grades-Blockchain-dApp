# Grades-Blockchain-dApp

<p align="center">
  <b>A dApp that manages Grades of a University through a private Ethereum network. Because this dApp was initially created with the technologies I was familiar with, it reads the wallet from a .env file. After finishing this implementation, the project was also created with NextJS so as it is more product like (Uses MetaMask to connect to a wallet and then interract with the smart contracts with that wallet).</b> </br>
  <img alt="Byte Code Size" src="https://img.shields.io/github/languages/code-size/ChristosHadjichristofi/Grades-Blockchain-dApp?color=red" />
	<img alt="# Lines of Code" src="https://img.shields.io/tokei/lines/github/ChristosHadjichristofi/Grades-Blockchain-dApp?color=red" />
	<img alt="# Languages Used" src="https://img.shields.io/github/languages/count/ChristosHadjichristofi/Grades-Blockchain-dApp?color=yellow" />
	<img alt="Top language" src="https://img.shields.io/github/languages/top/ChristosHadjichristofi/Grades-Blockchain-dApp?color=yellow" />
	<img alt="Last commit" src="https://img.shields.io/github/last-commit/ChristosHadjichristofi/Grades-Blockchain-dApp?color=important" />
</p>

## Technologies Used
* NodeJS
* ExpressJS
* EJS
* MySQL (For retrieving courses of a University's schools)
* Solidity (for the smart contract)

## General Idea
* The users of the private blockchain network are the secretaries of the university schools
* A master user can retrieve all participants
* A master user can start a vote to add a new participant in the network. Several users can be voted to participate and have access to the blockchain's data. Many users can belong to a School
* When a vote has began for a specific wallet to be added as a participant, all the participants can vote for or against. There must be unanimity so as this wallet is added as a participant
* Multiple votes can be started together
* Grades information are saved based on the school and period of the exam. A corrective state can be added to the grades information (of a school's course at a specific exam period). The information can be retrieved and the full history can be shown (if more information are saved regarding a school's course at a specific exam period). Always the latest record of a school's course at a specific exam period is the current, and all the previous are the history
* At any time a user can check if the file's content that is uploaded to a server matches the content of the file that was saved in the blockchain. Unified diff string output produced and shown (if differences are found)
* Participants can retrieve a school's course grade info (this will show all the records grouped by exam period). Participants who are not master users can only retrieve the information that their wallet is bound to (for example if a wallet is bound to school A, then this wallet can only retrieve courses information of that school)

## Functions of Smart Contract
* addRecord: To add grades information of a school's course at a specific exam period
* retrieveCourseGrades: Retrieve the grades information of a specific course
* retrieveUserPermissions: Retrieves wallet's permissions (hasAccess, isMaster)
* retrieveParticipants: Retrieve all participants and their permissions
* addNetworkUser: Starts a vote so as a new wallet can participate in the network and interract with the contracts
* voteAdd: Vote for or against a candidate
* voteList: Retrieve all ongoing votes that you didn't vote

## Save Grades Information
A form is filled, which has the following fields:
* School
* Period
* Course ID
* Professor
* Exam Date
* Number of Participants
* Participants passed
* Grades Asset (the same file that is uploaded to the dApp and eventually its content is saved in the blockchain)
* Update Status
* Grades File (Upload) - This file has a specific extention (.bau) and a specific format (which is similar to csv)

After the submission, a check is being made to check if all mandatory fields are filled and contain valid data. Then the grades' file content is been read and converted to base64. Then from the form's information an object is created and then submitted to the blockchain.

## Creation of Dummy .bau files
A script was created to generate a specified number of files that have the exact structure of the desired form. This was implemented so as this files can be used for demonstration of the dApp.

## .Env File template
```
# RPC Host
IP = ""
# port running the nodejs server
PORT = 3001
# network variable mentioned in truffle-config.js
MODE = "development"
# RPC server to connect to the private local blockchain network 
LOCAL_NODE  = "http://127.0.0.1:8501"
LOCAL_NODE_PORT = 8501
# Identification of the blockchain network
NETWORK_ID = ""
# Wallet that is used to interract with the smart contracts
LOCAL_NODE_ADDR = ""
# gas
GAS = 0x47b760
# session string (used to save error messages and output them)
SECRET_SESSION_STRING=grades-blockchain-app
# database to retrieve the courses and users
DB=[Database Name]
DB_USER=[DB User]
DB_PASS=[DB Pass]
DB_HOST=[DB Host]
DB_PORT=[DB Port]
```

## Thesis Information
Implementation of a private permissioned blockchain for University grades management
* Dipl thesis by Christos Hadjichristofi (christoshadjichristofi@hotmail.com)
* Supervisors: Prof.Vassilios Vescoukis, Mr.Ioannis Tzannetos, PhD Cand

### Abstract
A Blockchain is a distributed and decentralized immutable public ledger, that exists across a network. The Blockchain acts as a distributed database that is shared among the nodes of a network. More specifically, it stores information in digital format that can not be edited. Thus, it guarantees the integrity and security of any record of data and therefore, is capable of working without the need of a trusted third party. It is a well-known technology which bloomed over the past years, due to its capability to maintain transactions securely.

This diploma thesis aims to the development of a private Blockchain network with the respective smart contracts and front-end to manage University grades. The problem that this thesis solves, will be addressed and a complete solution will be discussed, among with concepts and basic principles like Blockchain, smart contracts, consensus algorithms but also with the difficulties that were encountered during the implementation of this system.

Finally, it is concluded that a system of such capability can be developed, deployed, exist and co-operate with any other legacy system and offer all the perks of Blockchain technology. In addition, ideas for further expansions of the examined system are discussed, along with the benefits that they may offer.
