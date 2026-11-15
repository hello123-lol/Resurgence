const $ = (s) => document.querySelector(s);
let me = null;
let mode = 'login';
const money = (v) => new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0}).format(Number(v || 0));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
async function api(url, options = {}) {
  const response = await fetch(url, {credentials:'same-origin', ...options, headers:{'Content-Type':'application/json', ...(options.headers || {})}});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 3000); }
function showModal(id) { $('#' + id).classList.remove('hidden'); }
function closeModals() { document.querySelectorAll('.modal').forEach((el) => el.classList.add('hidden')); }
document.querySelectorAll('[data-close]').forEach((el) => { el.onclick = closeModals; });
document.querySelectorAll('.modal').forEach((el) => { el.onclick = (event) => { if (event.target === el) closeModals(); }; });
function showAuth(nextMode) {
  mode = nextMode;
  $('#authTitle').textContent = mode === 'login' ? 'Good to have you back.' : 'Join the circle.';
  $('#nameWrap').classList.toggle('hidden', mode === 'login');
  $('#authSubmit').textContent = mode === 'login' ? 'Log in ↗' : 'Create account ↗';
  $('#switchAuth').innerHTML = mode === 'login' ? 'New here? <button type="button">Create an account</button>' : 'Already a member? <button type="button">Log in</button>';
  $('#switchAuth button').onclick = () => showAuth(mode === 'login' ? 'register' : 'login');
  $('#authError').textContent = '';
  showModal('authModal');
}
$('#loginBtn').onclick = () => showAuth('login');
$('#signupBtn').onclick = () => showAuth('register');
$('#authForm').onsubmit = async (event) => {
  event.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(event.target));
    const data = await api('/api/auth/' + mode, {method:'POST', body:JSON.stringify(body)});
    me = data.user; closeModals(); await updateHeader(); toast('Welcome, ' + me.name);
  } catch (error) { $('#authError').textContent = error.message; }
};
async function updateHeader() {
  try {
    me = (await api('/api/auth/me')).user;
    $('#loginBtn').classList.add('hidden'); $('#signupBtn').classList.add('hidden');
    $('#accountBtn').classList.remove('hidden'); $('#accountBtn').textContent = me.name[0].toUpperCase();
  } catch {
    me = null; $('#loginBtn').classList.remove('hidden'); $('#signupBtn').classList.remove('hidden'); $('#accountBtn').classList.add('hidden');
  }
}
async function loadProducts() {
  try {
    const params = new URLSearchParams({q:$('#search').value, condition:$('#condition').value});
    const data = await api('/api/products?' + params);
    if (!data.products.length) { $('#products').innerHTML = '<p>No approved listings yet. Be the first to list an item.</p>'; return; }
    $('#products').innerHTML = data.products.map((p) => `<article class="product"><div>${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.title)}">` : '<div class="placeholder">✳</div>'}</div><div class="pbody"><small>${esc(p.category)} · ${p.condition}-TYPE · ${p.quantity} available</small><h3>${esc(p.title)}</h3><small>Seller: ${esc(p.seller_name || 'Community')}</small><div class="pfoot"><b>${money(p.price)}</b><button data-buy="${p.id}" data-title="${esc(p.title)}">Buy ↗</button></div></div></article>`).join('');
    document.querySelectorAll('[data-buy]').forEach((button) => { button.onclick = () => buyProduct(Number(button.dataset.buy), button.dataset.title); });
  } catch (error) { $('#products').textContent = error.message; }
}
$('#searchBtn').onclick = loadProducts; $('#condition').onchange = loadProducts;
$('#search').onkeydown = (event) => { if (event.key === 'Enter') loadProducts(); };
async function buyProduct(id, title) {
  if (!me) { showAuth('login'); return; }
  const quantity = Number(prompt('Quantity for ' + title, '1'));
  if (!Number.isInteger(quantity) || quantity < 1) return;
  try { const data = await api('/api/orders', {method:'POST', body:JSON.stringify({product_id:id, quantity})}); toast('Order #' + data.order.id + ' placed'); loadProducts(); }
  catch (error) { toast(error.message); }
}
$('#sellBtn').onclick = () => { if (!me) { showAuth('login'); return; } showModal('sellModal'); };
$('#sellForm').onsubmit = async (event) => {
  event.preventDefault();
  try { const data = await api('/api/products', {method:'POST', body:JSON.stringify(Object.fromEntries(new FormData(event.target)))}); closeModals(); event.target.reset(); toast(data.message); }
  catch (error) { $('#sellError').textContent = error.message; }
};
$('#chatForm').onsubmit = async (event) => {
  event.preventDefault(); const input = $('#chatInput'); const question = input.value.trim(); if (!question) return;
  if (!me) { showAuth('login'); toast('Log in to use the assistant'); return; }
  const addMessage = (text, cls) => { const el = document.createElement('p'); el.className = 'bubble ' + cls; el.textContent = text; $('#chatMessages').append(el); $('#chatMessages').scrollTop = 9999; };
  addMessage(question, 'user'); input.value = '';
  const answer = document.createElement('p'); answer.className = 'bubble'; answer.textContent = 'Thinking…'; $('#chatMessages').append(answer);
  try { answer.textContent = (await api('/api/ai', {method:'POST', body:JSON.stringify({question})})).answer; }
  catch (error) { answer.textContent = error.message; }
};
async function showAccount() {
  if (!me) return showAuth('login');
  showModal('accountModal'); $('#accountTitle').textContent = 'Hello, ' + me.name.split(' ')[0];
  const body = $('#accountBody'); body.textContent = 'Loading…';
  try {
    if (me.role === 'admin') {
      const data = await api('/api/admin/overview');
      body.innerHTML = `<p><b>ADMIN CONTROL PANEL</b></p><p>${data.users.count} users · ${data.products.total} listings (${data.products.pending} pending) · ${data.orders.count} orders · ${money(data.orders.value)} order value</p><h3>Listing moderation</h3><table class="admin-table"><tr><th>Product</th><th>Grade</th><th>Seller</th><th>Action</th></tr>${data.recent.map((p) => `<tr><td>${esc(p.title)}</td><td>${p.condition}</td><td>${esc(p.seller_name || '—')}</td><td>${p.status === 'pending' ? `<button data-review="${p.id}" data-status="approved">Approve</button><button data-review="${p.id}" data-status="rejected">Reject</button>` : esc(p.status)}</td></tr>`).join('')}</table>`;
      body.querySelectorAll('[data-review]').forEach((button) => { button.onclick = async () => { try { await api('/api/admin/products/' + button.dataset.review, {method:'PATCH', body:JSON.stringify({status:button.dataset.status})}); toast('Listing updated'); showAccount(); } catch (error) { toast(error.message); } }; });
    } else {
      const [summary, orders] = await Promise.all([api('/api/seller/summary'), api('/api/orders/mine')]);
      body.innerHTML = `<p>${esc(me.email)}</p><p>${summary.products.listings} listings · ${summary.products.stock} units · ${summary.sales.orders} orders on your listings</p><h3>Your purchases</h3>${orders.orders.map((o) => `<p>${esc(o.title || 'Item')} · ${esc(o.status)} · ${money(o.total)}</p>`).join('') || 'No purchases yet.'}`;
    }
    body.insertAdjacentHTML('beforeend', '<button id="logout">Log out</button>');
    $('#logout').onclick = async () => { await api('/api/auth/logout', {method:'POST'}); closeModals(); await updateHeader(); toast('Logged out'); };
  } catch (error) { body.textContent = error.message; }
}
$('#accountBtn').onclick = showAccount;
(async () => { await updateHeader(); await loadProducts(); })();
