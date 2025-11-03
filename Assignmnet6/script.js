/* script.js (shared) */

/* ---------------------------
   Shared utilities & data
   --------------------------- */

   const packagesData = [
    { id: 'pkg1', destination: 'Manali', durationDays: 4, basePrice: 120, season: 'low' },
    { id: 'pkg2', destination: 'Singapore', durationDays: 5, basePrice: 300, season: 'high' },
    { id: 'pkg3', destination: 'Malaysia', durationDays: 6, basePrice: 220, season: 'mid' },
    { id: 'pkg4', destination: 'Goa', durationDays: 3, basePrice: 90, season: 'mid' },
    { id: 'pkg5', destination: 'Bali', durationDays: 5, basePrice: 210, season: 'high' },
    { id: 'pkg6', destination: 'France', durationDays: 7, basePrice: 450, season: 'high' },
    { id: 'pkg7', destination: 'Italy', durationDays: 6, basePrice: 420, season: 'mid' },
    { id: 'pkg8', destination: 'California', durationDays: 8, basePrice: 600, season: 'high' }
  ];
  
  /* season multiplier function (switch example) */
  function seasonMultiplier(season) {
    switch (season) {
      case 'low': return 0.9;
      case 'mid': return 1.0;
      case 'high': return 1.25;
      default: return 1.0;
    }
  }
  
  /* compute final price for package (demonstrates operators & control flow) */
  function computePackageFinalPrice(pkg) {
    // base price scaled by duration
    let price = pkg.basePrice * pkg.durationDays;
  
    // apply seasonal multiplier
    const mult = seasonMultiplier(pkg.season);
    price = price * mult;
  
    // example logic: longer trips get small fixed discount
    if (pkg.durationDays >= 7) {
      price = price * 0.95; // 5% long-trip discount
    }
  
    // apply a small surcharge for popular destinations (based on name)
    if (['Singapore','France','California'].includes(pkg.destination)) {
      price += 50; // flat surcharge
    }
  
    // round to 2 decimals
    return Math.round(price * 100) / 100;
  }
  
  /* ---------------------------
     NAV highlighting
     Adds 'active' class to current nav link
     --------------------------- */
  function highlightNav() {
    const links = document.querySelectorAll('#selector a');
    const current = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      // compare file names
      const filename = href.split('/').pop();
      if (filename === current) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
      // scroll behavior - smooth scroll if anchor on same page (not used now)
      a.addEventListener('click', (e) => {
        // allow normal navigation for external page links; if it is an in-page anchor, smooth scroll.
        if (a.hash) {
          e.preventDefault();
          document.querySelector(a.hash)?.scrollIntoView({behavior:'smooth'});
        }
      });
    });
  }
  
  /* ---------------------------
     Packages page: render table from data
     --------------------------- */
  function renderPackagesTable(tableId='packages-table') {
    const table = document.getElementById(tableId);
    if (!table) return;
    // clear existing
    table.innerHTML = '';
  
    // create header
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
      <th>ID</th><th>Destination</th><th>Duration (days)</th><th>Base Price (per day)</th><th>Season</th><th>Final Price</th>
    </tr>`;
    table.appendChild(thead);
  
    const tbody = document.createElement('tbody');
    packagesData.forEach(pkg => {
      const finalPrice = computePackageFinalPrice(pkg);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${pkg.id}</td>
        <td>${pkg.destination}</td>
        <td>${pkg.durationDays}</td>
        <td>$${pkg.basePrice.toFixed(2)}</td>
        <td>${pkg.season}</td>
        <td>$${finalPrice.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }
  
  /* ---------------------------
     Booking page: price estimator, validation
     --------------------------- */
  function initBookingEstimator() {
    const form = document.querySelector('.booking-form');
    if (!form) return;
  
    // elements
    const packageSelect = form.querySelector('#package-select');
    const checkInEl = form.querySelector('#start-date');
    const checkOutEl = form.querySelector('#end-date');
    const guestsEl = form.querySelector('#guests');
    const promoEl = form.querySelector('#promo');
    const estimateBox = document.getElementById('estimate-box');
    const submitBtn = form.querySelector('input[type="submit"]');
  
    // populate package select
    if (packageSelect) {
      packageSelect.innerHTML = '<option value="">-- Select package --</option>';
      packagesData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.destination} (${p.durationDays}d) - $${p.basePrice}/day`;
        packageSelect.appendChild(opt);
      });
    }
  
    // helper: compute nights difference
    function computeNights(ci, co) {
      const msPerDay = 1000*60*60*24;
      if (!ci || !co) return 0;
      const diff = (co.getTime() - ci.getTime()) / msPerDay;
      return Math.max(0, Math.round(diff));
    }
  
    function applyPromo(total, code) {
      if (!code) return total;
      switch (code.trim().toUpperCase()) {
        case 'EARLYBIRD':
          return total * 0.90; // -10%
        case 'SUMMER15':
          return total * 0.85; // -15%
        case 'WELCOME5':
          return total * 0.95; // -5%
        default:
          return total;
      }
    }
  
    function updateEstimate() {
      // reset invalid classes
      [checkInEl, checkOutEl, packageSelect, guestsEl].forEach(el => el?.classList.remove('invalid'));
  
      const pkgId = packageSelect.value;
      const pkg = packagesData.find(p => p.id === pkgId);
      const checkIn = checkInEl.value ? new Date(checkInEl.value) : null;
      const checkOut = checkOutEl.value ? new Date(checkOutEl.value) : null;
      const guests = Number(guestsEl.value) || 1;
      const promo = promoEl.value || '';
  
      // basic validation
      let valid = true;
      if (!pkg) {
        packageSelect.classList.add('invalid');
        valid = false;
      }
      if (!checkIn) {
        checkInEl.classList.add('invalid');
        valid = false;
      }
      if (!checkOut) {
        checkOutEl.classList.add('invalid');
        valid = false;
      }
      if (checkIn && checkOut && checkOut <= checkIn) {
        checkOutEl.classList.add('invalid');
        valid = false;
      }
  
      if (!valid) {
        estimateBox.innerHTML = `<strong>Estimated total:</strong> — (complete required fields)`;
        submitBtn.disabled = true;
        return;
      }
  
      // nights using date math
      const nights = computeNights(checkIn, checkOut);
      // base: use package basePrice * nights
      let total = pkg.basePrice * nights;
  
      // guests multiplier (+20% if >2 guests)
      if (guests > 2) {
        total = total * 1.20;
      }
  
      // weekend surcharge: if stay includes saturday or sunday, add 10%
      // check each night
      let includesWeekend = false;
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate()+1)) {
        const day = d.getDay(); // 0 Sun .. 6 Sat
        if (day === 0 || day === 6) {
          includesWeekend = true;
          break;
        }
      }
      if (includesWeekend) total = total * 1.10;
  
      // seasonal multiplier: attempt to use package season multiplier
      total = total * seasonMultiplier(pkg.season);
  
      // promo code apply via switch/case
      const beforePromo = total;
      total = applyPromo(total, promo);
  
      // rounding
      total = Math.round(total * 100) / 100;
  
      // show live total
      estimateBox.innerHTML = `
        <div><strong>Package:</strong> ${pkg.destination} (${pkg.durationDays} d)</div>
        <div><strong>Nights:</strong> ${nights}</div>
        <div><strong>Guests:</strong> ${guests}</div>
        <div><strong>Subtotal (before promo):</strong> $${beforePromo.toFixed(2)}</div>
        <div><strong>Promo:</strong> ${promo ? promo.toUpperCase() : '—'}</div>
        <div style="margin-top:8px;"><strong>Total estimate:</strong> $${total.toFixed(2)}</div>
      `;
  
      submitBtn.disabled = false;
    }
  
    // wire-up listeners
    [packageSelect, checkInEl, checkOutEl, guestsEl, promoEl].forEach(el => {
      if (!el) return;
      el.addEventListener('change', updateEstimate);
      el.addEventListener('input', updateEstimate);
    });
  
    // initial call to ensure UI is set
    updateEstimate();
  
    // prevent invalid submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // simple final validation
      if (submitBtn.disabled) {
        alert('Please fill required fields correctly before submitting.');
        return;
      }
      alert('Booking submitted (simulated). Thank you!');
      form.reset();
      updateEstimate();
    });
  }
  
  /* ---------------------------
     Gallery: attribute-driven modal & layout toggle
     --------------------------- */
  function initGallery() {
    const galleryRoot = document.querySelector('.gallery-container .content');
    if (!galleryRoot) return;
  
    // convert existing images to have data-large (if not present) - attempt to preserve filenames
    const imgs = Array.from(galleryRoot.querySelectorAll('img'));
    imgs.forEach((img, idx) => {
      // if data-large not present, use src
      if (!img.dataset.large) {
        img.dataset.large = img.src;
      }
      if (!img.alt || img.alt.trim() === '') {
        img.alt = `Gallery image ${idx+1}`;
      }
      // make sure clickable
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => openModalFromThumb(img));
    });
  
    // modal element (create once)
    let modal = document.getElementById('image-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'image-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <button class="close-btn" aria-label="Close">&times;</button>
          <img src="" alt="">
          <div class="caption"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  
    const modalImg = modal.querySelector('img');
    const caption = modal.querySelector('.caption');
    const closeBtn = modal.querySelector('.close-btn');
  
    function openModalFromThumb(th) {
      const large = th.dataset.large || th.src;
      modalImg.src = large;
      modalImg.alt = th.alt || th.title || '';
      caption.textContent = th.title || th.alt || '';
      modal.classList.add('open');
    }
  
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  
    // gallery layout toggle (grid / list)
    const controlsContainer = document.querySelector('.gallery-controls');
    if (controlsContainer) {
      const gridBtn = controlsContainer.querySelector('.btn-grid');
      const listBtn = controlsContainer.querySelector('.btn-list');
      const contentDiv = galleryRoot; // the element that contains images
  
      function setGrid() {
        contentDiv.classList.remove('gallery-list');
        contentDiv.classList.add('gallery-grid');
        gridBtn.disabled = true;
        listBtn.disabled = false;
      }
      function setList() {
        contentDiv.classList.remove('gallery-grid');
        contentDiv.classList.add('gallery-list');
        listBtn.disabled = true;
        gridBtn.disabled = false;
      }
  
      // initial set based on existing class or default to grid
      if (!contentDiv.classList.contains('gallery-grid') && !contentDiv.classList.contains('gallery-list')) {
        contentDiv.classList.add('gallery-grid');
      }
      // wire buttons
      gridBtn?.addEventListener('click', setGrid);
      listBtn?.addEventListener('click', setList);
    }
  }
  
  /* ---------------------------
     On DOM ready, initialize features if the elements exist
     --------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    try {
      highlightNav();
      renderPackagesTable('packages-table');
      initBookingEstimator();
      initGallery();
    } catch (err) {
      console.error('Error initializing script:', err);
    }
  });
  