/* 全站交互：滚动出现 / 星空 / 曲目试听跳转 / 阅读进度 / 灯箱 */

/* 1. 滚动出现 */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

/* 2. 星空：随机撒点，每颗星有自己的大小、亮度和闪烁节奏 */
(function () {
  var layer = document.createElement('div');
  layer.className = 'stars';
  layer.setAttribute('aria-hidden', 'true');

  var n = window.innerWidth < 700 ? 45 : 90;
  var html = '';
  for (var i = 0; i < n; i++) {
    html += '<i style="left:' + (Math.random() * 100).toFixed(2) +
      '%;top:' + (Math.random() * 100).toFixed(2) +
      '%;--s:' + (Math.random() * 1.9 + .9).toFixed(2) + 'px' +
      ';--o:' + (Math.random() * .6 + .35).toFixed(2) +
      ';--t:' + (Math.random() * 2.6 + 1.4).toFixed(2) + 's' +
      ';--d:-' + (Math.random() * 4).toFixed(2) + 's"></i>';
  }
  layer.innerHTML = html;
  document.body.appendChild(layer);
})();

/* 3. 曲目试听：歌名页面上本来就写着，搜索地址由脚本拼出来，省掉四十条重复的长链接 */
(function () {
  var base = 'https://y.qq.com/n/ryqq/search?keyword=';

  function add(host, title) {
    var a = document.createElement('a');
    a.className = 'try';
    a.href = base + encodeURIComponent('单依纯 ' + title);
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '试听';
    a.title = '在 QQ音乐 搜索《' + title + '》';
    host.appendChild(a);
  }

  document.querySelectorAll('.tracks li').forEach(function (li) {
    add(li, li.textContent.trim());
  });
  document.querySelectorAll('.ost tbody b').forEach(function (b) {
    add(b.parentNode, b.textContent.trim());
  });
})();

/* 4. 阅读进度：页面最上沿一条金线，随滚动变长；正文太短不需要滚时不出现 */
(function () {
  var bar = document.createElement('i');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var doc = document.documentElement, tick = false;
  function draw() {
    var rest = doc.scrollHeight - window.innerHeight;
    bar.style.width = (rest > 80 ? Math.min(1, Math.max(0, window.scrollY / rest)) : 0) * 100 + '%';
    tick = false;
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(draw); } }, { passive: true });
  addEventListener('resize', draw);
  draw();
})();

/* 5. 灯箱：影像页点图放大看，Esc / 点暗处 / × 关闭，左右键或点两侧换图，手机上左右滑也行 */
(function () {
  var figures = document.querySelectorAll('.wall figure');
  if (!figures.length) return;

  var items = [];
  figures.forEach(function (f) {
    var img = f.querySelector('img');
    var cap = f.querySelector('figcaption');
    items.push({ src: img.src, alt: img.alt, cap: cap ? cap.textContent : '' });
    var p = new Image(); p.src = img.src;
  });

  var box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML =
    '<span class="count"></span>' +
    '<button class="close" aria-label="关闭">×</button>' +
    '<button class="nav prev" aria-label="上一张">‹</button>' +
    '<button class="nav next" aria-label="下一张">›</button>' +
    '<img alt="">' +
    '<span class="cap"></span>';
  document.body.appendChild(box);

  var cur = 0;
  var img = box.querySelector('img');
  var cap = box.querySelector('.cap');
  var count = box.querySelector('.count');

  function show(i) {
    cur = (i + items.length) % items.length;
    img.style.opacity = '0';
    img.src = items[cur].src;
    img.alt = items[cur].alt;
    cap.textContent = items[cur].cap;
    count.textContent = (cur + 1) + ' / ' + items.length;
  }
  img.addEventListener('load', function () { img.style.opacity = '1'; });

  function open(i) { show(i); box.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { box.classList.remove('open'); document.body.style.overflow = ''; }

  figures.forEach(function (f, i) {
    f.addEventListener('click', function () { open(i); });
  });

  box.querySelector('.close').addEventListener('click', close);
  box.querySelector('.prev').addEventListener('click', function () { show(cur - 1); });
  box.querySelector('.next').addEventListener('click', function () { show(cur + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });

  var tx = 0;
  box.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (dx > 50) show(cur - 1);
    else if (dx < -50) show(cur + 1);
  });
})();
