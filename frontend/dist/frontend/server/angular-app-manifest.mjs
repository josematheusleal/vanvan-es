
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
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
      "chunk-7UHG5ZFZ.js",
      "chunk-XODIVZND.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-AGPUYHW6.js",
      "chunk-XODIVZND.js"
    ],
    "route": "/register"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-5N7XBWG5.js",
      "chunk-XODIVZND.js"
    ],
    "route": "/register-driver-1"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-4QTDGNI4.js",
      "chunk-XODIVZND.js"
    ],
    "route": "/register-driver-2"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-RQMM4BSB.js",
      "chunk-BE4QQK3L.js",
      "chunk-T2PABOKI.js",
      "chunk-XODIVZND.js"
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
      "chunk-CTZKQL73.js"
    ],
    "route": "/admin/relatorios"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-AFSGCVY2.js",
      "chunk-XODIVZND.js"
    ],
    "route": "/admin/motoristas"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-3THWG7FO.js",
      "chunk-T2PABOKI.js",
      "chunk-XODIVZND.js"
    ],
    "route": "/admin/aprovar-motoristas"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-6EWD6QVW.js",
      "chunk-BE4QQK3L.js",
      "chunk-T2PABOKI.js",
      "chunk-XODIVZND.js"
    ],
    "route": "/home"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-7PMHMA7L.js"
    ],
    "route": "/viagens"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-ZP624HBZ.js"
    ],
    "route": "/motorista"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 8665, hash: '066924601c0e0635be633b325ccbf90c6b4de43e178d02777cd40a20dc378315', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1252, hash: '5ca9571d8556d5275a6fe5cf7601e671155ff9161af3bdaae20233fbcedac5f9', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 16188, hash: 'd6cd44caa92d52bea932572045b3ce5d53e96d3d01fdc171d8ee7198943ca231', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 48545, hash: 'c0c9781e15e4fb84d1cf0f2332fba74d9efda150b1799f18e0506c1ab26b314c', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 23715, hash: '378d04e180429b7b158583783ed5972ceee41fba38d575eb2a1e6de656665b92', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'buttons/index.html': {size: 40172, hash: '64aa1a9df5ab8c55124062df8fdd7c5c164ca45c3f500118b8894f73785a833d', text: () => import('./assets-chunks/buttons_index_html.mjs').then(m => m.default)},
    'register/index.html': {size: 25959, hash: '56acbd9a8f1f9a31bf81f2ea331486e563b8598ae13407980bd9ba8f413c8916', text: () => import('./assets-chunks/register_index_html.mjs').then(m => m.default)},
    'register-driver-2/index.html': {size: 276, hash: 'bccecf9b4112905d4dabd0ad44df9d587704028579d7278a4a451285ee31ae6a', text: () => import('./assets-chunks/register-driver-2_index_html.mjs').then(m => m.default)},
    'register-driver-1/index.html': {size: 24966, hash: '6dd5af9721b60dbd6dd12743a9adda954a0e9b7104e7d8cd6ee2b62092f0fee3', text: () => import('./assets-chunks/register-driver-1_index_html.mjs').then(m => m.default)},
    'styles-43HUVI34.css': {size: 41461, hash: 'wMLZzwwTWpo', text: () => import('./assets-chunks/styles-43HUVI34_css.mjs').then(m => m.default)}
  },
};
