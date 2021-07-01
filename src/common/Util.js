"use strict"

const _ = require("lodash");
const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256');
const { base64encode, base64decode } = require('nodejs-base64');
const jwt = require('jsonwebtoken');

const ETH = require('../blockchain/ETH');
const Util = {}

/**
 * Create merkle tree root from an array
 */
Util.createMerkleRoot = function(args = ['']) {
    let leaves = args.map(x => SHA256(x));
    const tree = new MerkleTree(leaves, SHA256);

    return tree.getRoot().toString('hex');
}

Util.objectToMerkleRoot = function(obj) {
    let fArray = _.flattenDepth(Util.objectToArray(obj));
    let merkleRoot = Util.createMerkleRoot(fArray);

    return merkleRoot;
}

Util.sign = function(data, key) {
    let message  = data instanceof String?data: JSON.stringify(data);
    return ETH.sign(message, key)
}

Util.generateSignature = function(obj, privateKey) {
    let sg = Util.sign(obj, privateKey);
    let { messageHash,v,r,s,signature } = sg;
    let merkleRoot = Util.objectToMerkleRoot({ messageHash,v,r,s,signature });
        
    obj = {...obj, sg, merkleRoot};
    return obj;
}

/**
 * Verify one leave in merkle tree
 */
Util.verifyLeave = function(leave = '', args = ['']) {
    let leaves = args.map(x => SHA256(x));
    let tree = new MerkleTfgfree(leaves, SHA256);
    let leaf = SHA256(leave)
    let proof = tree.getProof(leaf)
    return tree.verify(proof, leaf, root);
}

Util.generateJWT = function(payload, secretKey) {
    if (typeof payload !== 'string') {
        payload = JSON.stringify(payload);
    }

    let tokenOriginal = jwt.sign(payload, secretKey);
    let token = Util.base64encode(tokenOriginal);

    return token;
}

Util.base64encode = function(str) {
    return base64encode(str);
}

Util.base64decode = function(encodedStr) {
    return base64decode(encodedStr);
}

Util.objectToArray = function(obj) {
    return Object.keys(obj).map(function (key) { 
        return [key, obj[key]]; 
    }); 
}

Util.generateResponse = function (statusCode, obj) {
    let template = {code: statusCode, msg: status[statusCode], data: obj};
    return template;
}

module.exports = Util;