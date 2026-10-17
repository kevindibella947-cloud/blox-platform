'use strict';
const T = THREE, $ = i => document.getElementById(i);
let bridge = false, hitMode = false, side = 0, combo = 0, comboT = 0, mode = 'bot', charge = 0;
const score = { b: 0, r: 0 }, hits = { me: 0, bot: 0 }, WINS = 5, HITS = 100;
const SW = [{ d: 4, kb: 9, cd: .42, r: 4 }, { d: 5, kb: 10, cd: .38, r: 4.3 }, { d: 6, kb: 11, cd: .34, r: 4.6 }, { d: 8, kb: 12.5, cd: .3, r: 5 }];

const Net = {
  id: 'p_' + Math.random().toString(36).slice(2, 8),
  room: 'room1', db: null, t: 0, remote: new Map(),
  init(cfg) {},
  ref(p) { return this.db ? this.db.ref('rooms/' + this.room + '/' + p) : null; },
  pushPlayer(s) { if (this.db) this.ref('players/' + this.id).set(s); },
  pushBed(team, alive) { if (this.db) this.ref('beds/' + team).set(alive); },
  pushBlock(op, x, y, z, type) { if (!this.db) return; const r = this.ref('blocks/' + x + '_' + y + '_' + z); op === 'add' ? r.set(type) : r.remove(); },
  tick(dt) {}
};

/* SCENA E LUCI */
const scene = new T.Scene(); scene.background = new T.Color(0x87ceeb); scene.fog = new T.Fog(0x87ceeb, 40, 120);
const cam = new T.PerspectiveCamera(75, innerWidth / innerHeight, .1, 200); cam.rotation.order = 'YXZ'; scene.add(cam);
const ren = new T.WebGLRenderer({ antialias: true }); ren.setPixelRatio(Math.min(devicePixelRatio, 2)); ren.setSize(innerWidth, innerHeight);

if (document.getElementById('bedwarsCanvasContainer')) {
  document.getElementById('bedwarsCanvasContainer').appendChild(ren.domElement);
}

scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1));
const sun = new THREE.DirectionalLight(0xffffff, .55); sun.position.set(30, 50, 20); scene.add(sun);

/* GENERAZIONE TERRENO E MAPPA BEDWARS */
function tex(c, stripe) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d');
  g.fillStyle = c; g.fillRect(0, 0, 16, 16);
  if (stripe) { g.fillStyle = '#fff'; g.fillRect(0, 5, 16, 6); }
  const t = new T.CanvasTexture(cv); t.magFilter = T.NearestFilter; return t;
}

const M = {};
[['grass', '#5fae3a'], ['dirt', '#8a5a2b'], ['stone', '#8c8c8c'], ['wool', '#3b6cff'], ['wood', '#c89b5a'], ['bedB', '#2255dd', 1], ['bedR', '#dd2222', 1], ['gold', '#ffd23f']]
  .forEach(([n, c, s]) => M[n] = new T.MeshLambertMaterial({ map: tex(c, s) }));

const blocks = new Map(), geo = new T.BoxGeometry(1, 1, 1);
function setBlock(x, y, z, type) {
  const k = x + ',' + y + ',' + z; if (blocks.has(k)) return;
  const m = new T.Mesh(geo, M[type]); m.position.set(x + .5, y + .5, z + .5);
  scene.add(m); blocks.set(k, m);
}

function island(cx, cz, r) {
  for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
    const d = Math.max(Math.abs(x), Math.abs(z));
    for (let i = 0; i <= r - d + 1 && i < 4; i++) setBlock(cx + x, -i, cz + z, i ? (i > 2 ? 'stone' : 'dirt') : 'grass');
  }
}

function buildBedwarsMap() {
  island(0, 0, 4); island(18, 0, 2); island(36, 0, 4);
  setBlock(-3, 1, 0, 'bedB'); setBlock(39, 1, 0, 'bedR');
  [[38, 1, 0], [40, 1, 0], [39, 1, 1], [39, 1, -1], [39, 2, 0], [38, 2, 0]].forEach(([x, y, z]) => setBlock(x, y, z, 'wood'));
}
buildBedwarsMap();

function loopBedwars() {
  requestAnimationFrame(loopBedwars);
  ren.render(scene, cam);
}
loopBedwars();
