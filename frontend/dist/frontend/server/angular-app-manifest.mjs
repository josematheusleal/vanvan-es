
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: false,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-PSN23KOG.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-FRH2XGHB.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/register"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-AIP54ECN.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/register-driver-1"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-LGOR3CMN.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/register-driver-2"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-E5ZNFGCJ.js",
      "chunk-UYX2HO3K.js",
      "chunk-KCU4BEP7.js",
      "chunk-735KGLAH.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/buttons"
  },
  {
    "renderMode": 1,
    "redirectTo": "/admin/relatorios",
    "route": "/admin"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-YFUED6BB.js"
    ],
    "route": "/admin/relatorios"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OXVMPSAC.js",
      "chunk-7KVOTXDF.js",
      "chunk-735KGLAH.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/admin/motoristas"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RRAHQU7S.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/admin/clientes"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-F6EV7PGI.js",
      "chunk-7KVOTXDF.js",
      "chunk-735KGLAH.js"
    ],
    "route": "/admin/aprovar-motoristas"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-BIQVPLV3.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/admin/settings"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-OKAFXB3R.js",
      "chunk-UYX2HO3K.js",
      "chunk-KCU4BEP7.js",
      "chunk-735KGLAH.js",
      "chunk-UDYXCG6Q.js"
    ],
    "route": "/home"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-XELFB25N.js",
      "chunk-KCU4BEP7.js",
      "chunk-735KGLAH.js"
    ],
    "route": "/viagens"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-FOKYIGFU.js",
      "chunk-KCU4BEP7.js"
    ],
    "route": "/motorista"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-SOKSWJ7C.js",
      "chunk-KCU4BEP7.js"
    ],
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1061, hash: '759f505dfe34dc93c6932dc0b152dcf665f150106f590bccb305de8b8f351dbf', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1601, hash: '6698e5f1bcb0b1d69c584ea7f7262acd85af1e346852268a17d3962e06a70465', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 4874, hash: '1059ec60f16b1490717e829d7a965ebcb1c6f8fa8e24361b51cc586b34bfd1ed', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 6165, hash: '85ed0afcfe1653fdaba01eb7b8a6e80f91e66451ceaee42005c9045df9e260cd', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'register/index.html': {size: 8373, hash: '80372687ee9d6ee1964a26f1843245b646f57ffa5cbc9c4ecb200e97c7797c63', text: () => import('./assets-chunks/register_index_html.mjs').then(m => m.default)},
    'register-driver-2/index.html': {size: 276, hash: 'bccecf9b4112905d4dabd0ad44df9d587704028579d7278a4a451285ee31ae6a', text: () => import('./assets-chunks/register-driver-2_index_html.mjs').then(m => m.default)},
    'buttons/index.html': {size: 29683, hash: '883f82d179f458821c1b93df98c4cf97c2dbc8fd1bbcfe8b69046f82a158f109', text: () => import('./assets-chunks/buttons_index_html.mjs').then(m => m.default)},
    'register-driver-1/index.html': {size: 8100, hash: '126313f95ef7ccdc29983fa4c1762a757b0c92ac9c2e8ea3f98b5b73f948ec0d', text: () => import('./assets-chunks/register-driver-1_index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 32897, hash: 'a8b009dc6779f00dcc0d99ee6595a5b988db97a90115ac29560e20ccbccd0383', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)}
  },
};
