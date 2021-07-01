const errors = {

    // Register
    REGISTER:{
        USERNAME_EMPTY: 'R001',
        USERNAME_EXIST: 'R002',
        USERTYPE_INVALID: 'R003',

    },

    LOGIN: {
        TOKEN_EMPTY: 'L001',
        TOKEN_INVALID: 'L002'
    },

    SYSTEM: {
        UNKNOWN_ERROR: 'S001',
        PERMISSION_DENIED: 'S002'
    }, 

    BLOCKCHAIN: {
        CANNOT_CREATE_ACCOUNT: 'B001',
        TOKEN_NOT_SUPPORT: 'B002',
        INVALID_RECEIVER: 'B003',
        INVALID_SENDER: 'B004',
        SENDER_NOT_FOUND:'B005',
        COULD_NOT_BROADCAST_TX: 'B006',
        INVALID_AMOUNT: 'B007',
        INSUFFICIENT_FUND:'B008'
    },
    
    MED: {

    }
}

module.exports = errors;