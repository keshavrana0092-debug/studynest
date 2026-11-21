/* StudyNest – site behaviour and GA4 event tracking */
(function () {
  var track = function (name, params) { if (window.snTrack) window.snTrack(name, params); };

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  /* ---------- CTA click tracking (any element with data-cta) ---------- */
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('cta_click', { cta_name: el.getAttribute('data-cta'), page_path: location.pathname });
    });
  });

  /* ---------- Home page search -> rooms page ---------- */
  var homeSearch = document.getElementById('home-search');
  if (homeSearch) {
    homeSearch.addEventListener('submit', function (e) {
      e.preventDefault();
      var uni = homeSearch.uni.value, budget = homeSearch.budget.value, type = homeSearch.type.value;
      track('search', { search_term: uni || 'any', budget: budget || 'any', room_type: type || 'any' });
      var q = new URLSearchParams();
      if (uni) q.set('uni', uni);
      if (budget) q.set('budget', budget);
      if (type) q.set('type', type);
      setTimeout(function () { location.href = 'find-a-room.html?' + q.toString(); }, 150);
    });
  }

  /* ---------- Sample listings (prototype data) ---------- */
  var ROOMS = [
    { id: 'SN101', title: 'Bright double room in a 4-bed share house', suburb: 'Carlton', uni: 'unimelb', uniName: 'University of Melbourne', travel: '10 min walk', price: 340, type: 'share', bills: true, furnished: true, colors: ['#9ad1c8', '#4aa59a'] },
    { id: 'SN102', title: 'Private studio with kitchenette', suburb: 'Melbourne CBD', uni: 'rmit', uniName: 'RMIT University', travel: '6 min walk', price: 460, type: 'studio', bills: true, furnished: true, colors: ['#f7c59f', '#f2643d'] },
    { id: 'SN103', title: 'Quiet single room with a host family', suburb: 'Clayton', uni: 'monash', uniName: 'Monash University (Clayton)', travel: '12 min by bus', price: 290, type: 'homestay', bills: true, furnished: true, colors: ['#c7d2fe', '#6366f1'] },
    { id: 'SN104', title: 'Large room near the train line', suburb: 'Burwood', uni: 'deakin', uniName: 'Deakin University (Burwood)', travel: '8 min by tram', price: 300, type: 'share', bills: false, furnished: true, colors: ['#fde68a', '#d97706'] },
    { id: 'SN105', title: 'Room in a student share house, 3 housemates', suburb: 'Brunswick', uni: 'unimelb', uniName: 'University of Melbourne', travel: '15 min by tram', price: 280, type: 'share', bills: false, furnished: false, colors: ['#bbf7d0', '#16a34a'] },
    { id: 'SN106', title: 'Modern room with ensuite', suburb: 'Hawthorn', uni: 'swinburne', uniName: 'Swinburne University', travel: '7 min walk', price: 380, type: 'share', bills: true, furnished: true, colors: ['#fecdd3', '#e11d48'] },
    { id: 'SN107', title: 'Homestay with meals included', suburb: 'Bundoora', uni: 'latrobe', uniName: 'La Trobe University', travel: '10 min by tram', price: 330, type: 'homestay', bills: true, furnished: true, colors: ['#bae6fd', '#0284c7'] },
    { id: 'SN108', title: 'Compact studio close to campus', suburb: 'Clayton', uni: 'monash', uniName: 'Monash University (Clayton)', travel: '5 min walk', price: 410, type: 'studio', bills: true, furnished: true, colors: ['#ddd6fe', '#7c3aed'] }
  ];
  var TYPE_LABEL = { share: 'Share house', studio: 'Studio', homestay: 'Homestay' };

  function roomCard(r) {
    return '' +
      '<article class="room-card">' +
        '<div class="room-img" style="background:linear-gradient(135deg,' + r.colors[0] + ',' + r.colors[1] + ')" role="img" aria-label="Illustration of ' + r.title + ' in ' + r.suburb + '">' +
          '<span class="badge">&#10003; Verified host</span>' +
        '</div>' +
        '<div class="room-body">' +
          '<h3>' + r.title + '</h3>' +
          '<div class="room-meta">' + r.suburb + ' &middot; ' + r.travel + ' to ' + r.uniName + '</div>' +
          '<div class="room-tags">' +
            '<span class="tag">' + TYPE_LABEL[r.type] + '</span>' +
            (r.bills ? '<span class="tag">Bills included</span>' : '<span class="tag">Bills extra</span>') +
            (r.furnished ? '<span class="tag">Furnished</span>' : '<span class="tag">Unfurnished</span>') +
            '<span class="tag">Video tour</span>' +
          '</div>' +
          '<div class="price">$' + r.price + ' <small>/ week</small></div>' +
          '<div class="room-actions">' +
            '<a class="btn btn-teal btn-sm" href="contact.html?room=' + r.id + '#enquiry" data-room="' + r.id + '" data-action="inspection">Book video inspection</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function bindRoomButtons(scope) {
    scope.querySelectorAll('[data-action="inspection"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = ROOMS.filter(function (x) { return x.id === b.getAttribute('data-room'); })[0];
        track('select_item', { item_id: r.id, item_name: r.title, suburb: r.suburb, price: r.price });
        track('book_inspection_click', { room_id: r.id, suburb: r.suburb });
      });
    });
  }

  /* Featured rooms on home / university pages */
  document.querySelectorAll('[data-featured]').forEach(function (box) {
    var filter = box.getAttribute('data-featured');
    var list = ROOMS.filter(function (r) { return filter === 'all' || r.uni === filter; }).slice(0, 3);
    box.innerHTML = list.map(roomCard).join('');
    bindRoomButtons(box);
  });

  /* Find a Room page with filters */
  var grid = document.getElementById('room-grid');
  if (grid) {
    var f = document.getElementById('room-filters');
    var count = document.getElementById('result-count');
    var params = new URLSearchParams(location.search);
    ['uni', 'budget', 'type'].forEach(function (k) { if (params.get(k) && f[k]) f[k].value = params.get(k); });

    var render = function () {
      var uni = f.uni.value, budget = parseInt(f.budget.value || '0', 10), type = f.type.value, bills = f.bills.value;
      var list = ROOMS.filter(function (r) {
        return (!uni || r.uni === uni) && (!budget || r.price <= budget) && (!type || r.type === type) && (!bills || (bills === 'yes' ? r.bills : !r.bills));
      });
      grid.innerHTML = list.length ? list.map(roomCard).join('') :
        '<div class="card" style="grid-column:1/-1"><h3>No rooms match these filters yet</h3><p>Try a higher budget or another university, or <a href="contact.html#enquiry">ask us to find a room for you</a>.</p></div>';
      count.textContent = list.length + (list.length === 1 ? ' room' : ' rooms') + ' found';
      bindRoomButtons(grid);
      return list.length;
    };
    render();
    f.addEventListener('change', function () {
      var n = render();
      track('search', { search_term: f.uni.value || 'any', budget: f.budget.value || 'any', room_type: f.type.value || 'any', results: n });
    });
  }

  /* ---------- Contact page: tabs, prefill and form tracking ---------- */
  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('active'); t.setAttribute('aria-selected', 'true');
      document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== t.getAttribute('data-tab'); });
    });
  });

  var roomParam = new URLSearchParams(location.search).get('room');
  var msg = document.getElementById('s-message');
  if (roomParam && msg) msg.value = 'Hi, I would like to book a video inspection for room ' + roomParam + '.';

  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var type = form.getAttribute('data-lead');
      track('generate_lead', { form_type: type });
      if (type === 'host') track('sign_up', { method: 'host_form' });
      form.querySelector('.form-success').style.display = 'block';
      form.reset();
    });
  });

  /* ---------- Guide: scroll depth (75%) ---------- */
  if (document.body.getAttribute('data-page') === 'guide') {
    var sent = false;
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      if (!sent && (h.scrollTop + innerHeight) / h.scrollHeight > 0.75) {
        sent = true; track('guide_read_75', { article: 'avoid-rental-scams' });
      }
    });
  }

  /* Footer year */
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
