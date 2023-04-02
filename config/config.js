module.exports = {
    gitee: {
        username: 'EliaukU',
        password: 'zangzang5200.',
        clientId: 'e54074af5eff20fd6363221d363e1953432c876353a1de424815fe19a9e94e7a',
        clientSecret: '95338f37e501ff2de882e6e08eceb568154fa39772dfd71cf9483ed35b2a2f3b',

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
