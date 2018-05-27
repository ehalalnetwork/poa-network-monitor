const {
    config,
    networkName
} = require('../common/config.js');
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(config.url));
const contracts = require("./contracts/" + networkName + "-contracts.js");
const testData = require("./test-data/blocks.js");
const PoaNetworkConsensusContract = new web3.eth.Contract(contracts.PoaNetworkConsensusAbi, contracts.PoaNetworkConsensusAddress);
const utils = require('web3-utils');
const BN = require('bn.js');

let testHelper = {
    /**
     * Obtains validators from the PoaNetworkConsensus contract
     * @returns {Promise.<*>}
     */
    getValidators: async function () {
        let validatorsArr = await
            PoaNetworkConsensusContract.methods.getValidators().call();
        console.log('getValidators() ');
        return validatorsArr;
    },

    /**
     * Checks if no validator missed a round starting from 0th block in the array of blocks.
     *
     * @param blocks - array of blocks (or objects with fields number and miner)
     * @param validatorsArr
     * @returns {{passed: boolean, missedValidators: Array}}
     * Returns object that contains boolean result (true if no validators missed the round) and array of validators that missed the round
     */
    checkForMissedValidators: function (blocks, validatorsArr) {
        let result = {passed: true, missedValidators: []};
        let previousBlock = -1;
        let previousValidatorIndex = -1;
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            console.log("number: " + block.number);
            console.log("miner: " + block.miner);
            if (previousBlock === -1) {
                previousBlock = block.number;
                previousValidatorIndex = validatorsArr.indexOf(block.miner);
                console.log("make previousValidatorIndex: " + previousValidatorIndex);
                continue;
            }
            let blocksPassed = block.number - previousBlock;
            console.log("blocksPassed: " + blocksPassed);
            let expectedValidatorIndex = (previousValidatorIndex + blocksPassed) % validatorsArr.length;
            console.log("!expValInd: " + expectedValidatorIndex);
            let expectedValidator = validatorsArr[expectedValidatorIndex];
            let isPassed = expectedValidator === block.miner;
            console.log("expectedValidator: " + expectedValidator + ", actual: " + block.miner + ", passed: " + isPassed);
            previousValidatorIndex += blocksPassed;
            previousBlock = block.number;
            if (!isPassed) {
                result.passed = isPassed;
                result.missedValidators.push(expectedValidator);
                //validator missed the round, so next one mined
                previousValidatorIndex += 1;
            }
        }

        return result;
    }
};

module.exports = {
    config,
    web3,
    testData,
    utils,
    BN,
    testHelper,
    networkName
};

