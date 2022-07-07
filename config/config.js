module.exports = {
    gitee: {
        username: 'GITEE帐号',
        password: 'GITEE密码',
        clientId: '应用id',
        clientSecret: '应用密钥',

        apiUrl: 'https://gitee.com/api/v5/',
        tokenUrl: 'https://gitee.com/oauth/token',
        scope: 'user_info',
    },

    token: {
        tokenPath: './data/',
        tokenFileName: 'token.json',
    },

    repoCache: {
        repoCachePath: './data/repo/',
        repoCacheExpires: 259200
    }
}
