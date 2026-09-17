function toggleMenu(){document.getElementById('navLinks')?.classList.toggle('show')}
let cart = JSON.parse(localStorage.getItem('nkomaziCart')||'[]');
function updateCartCount(){
  const count = cart.reduce((a,b)=>a+b.qty,0);
  document.querySelectorAll('#cartCount').forEach(el=>{ if(el){ el.textContent=count; el.style.display=count>0?'inline-flex':'none'; }});
  localStorage.setItem('nkomaziCart', JSON.stringify(cart));
}
function changeShopQty(btn, delta){
  const input = btn.parentElement.querySelector('.qty-input');
  let val = parseInt(input.value)+delta;
  if(val<1) val=1; if(val>10) val=10;
  input.value=val;
}
function addToCart(name, price, btn){
  const card = btn.closest('.p-info');
  const size = card.querySelector('.size-select')?.value || 'M';
  const qty = parseInt(card.querySelector('.qty-input')?.value || 1);
  const existing = cart.find(i=>i.name===name && i.size===size);
  if(existing){ existing.qty+=qty; } else { cart.push({name, price:parseFloat(price), size, qty:qty}); }
  updateCartCount();
  const cartBtn=document.querySelector('.cart-btn');
  if(cartBtn){ cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump'); }
  const orig=btn.textContent; btn.textContent=`✓ Added x${qty}`; btn.classList.add('added');
  setTimeout(()=>{ btn.textContent=orig; btn.classList.remove('added'); },1200);
  card.querySelector('.qty-input').value=1;
  showToast(`${qty} x ${name} (${size}) added 🛒`);
}
function showToast(msg){
  let toast=document.getElementById('cartToast');
  if(!toast){ toast=document.createElement('div'); toast.id='cartToast'; document.body.appendChild(toast); }
  toast.textContent=msg; toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2500);
}
function filterCategory(cat){
  document.querySelectorAll('.filter-btn').forEach(b=>{ b.classList.remove('active'); if(b.dataset.target===cat) b.classList.add('active'); });
  const secs=document.querySelectorAll('.category-section');
  if(cat==='all'){ secs.forEach(s=>s.classList.remove('hidden')); window.scrollTo({top:300,behavior:'smooth'}); }
  else{ secs.forEach(s=>{ if(s.id===cat){ s.classList.remove('hidden'); s.scrollIntoView({behavior:'smooth'}); }else s.classList.add('hidden'); }); }
}
function renderCartPage(){
  const list=document.getElementById('cartList');
  const empty=document.getElementById('emptyCart');
  if(!list) return;
  if(cart.length===0){
    list.innerHTML=''; if(empty) empty.style.display='block';
    document.getElementById('subtotal').textContent='R0.00';
    document.getElementById('total').textContent='R0.00';
    document.getElementById('freeDeliveryMsg').textContent='';
    return;
  }
  if(empty) empty.style.display='none';
  list.innerHTML=cart.map((item, idx)=>`
    <div class="cart-item">
      <div><strong>${item.name}</strong><br><small>Size: ${item.size} | R${item.price.toFixed(2)} each</small></div>
      <div class="qty-controls"><button onclick="changeQty(${idx},-1)">-</button><span>${item.qty}</span><button onclick="changeQty(${idx},1)">+</button></div>
      <div>R${(item.price*item.qty).toFixed(2)}</div>
      <button class="remove" onclick="removeItem(${idx})">✕</button>
    </div>
  `).join('');
  const subtotal=cart.reduce((a,b)=>a+(b.price*b.qty),0);
  const delivery=subtotal>700||subtotal==0?0:80;
  document.getElementById('subtotal').textContent=`R${subtotal.toFixed(2)}`;
  document.getElementById('delivery').textContent=delivery===0?'FREE':`R${delivery.toFixed(2)}`;
  document.getElementById('total').textContent=`R${(subtotal+delivery).toFixed(2)}`;
  document.getElementById('freeDeliveryMsg').textContent=subtotal>700? '✓ FREE delivery!':'Add R'+(700-subtotal).toFixed(2)+' more for FREE';
}
function changeQty(idx,delta){ cart[idx].qty+=delta; if(cart[idx].qty<=0) cart.splice(idx,1); updateCartCount(); renderCartPage(); }
function removeItem(idx){ cart.splice(idx,1); updateCartCount(); renderCartPage(); }
const checkoutForm=document.getElementById('checkoutForm');
if(checkoutForm){
  checkoutForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(cart.length===0){ alert('Cart is empty'); return; }
    const name=document.getElementById('custName').value.trim();
    const email=document.getElementById('custEmail').value.trim();
    const phone=document.getElementById('custPhone').value.trim();
    const address=document.getElementById('custAddress').value.trim();
    const payMethod=document.getElementById('payMethod').value;
    if(name.length<3||!email.includes('@')||phone.length<10||address.length<10||!payMethod){
      document.getElementById('checkoutMsg').textContent='Please fill all fields correctly';
      document.getElementById('checkoutMsg').style.color='#ff4444'; return;
    }
    const subtotal=cart.reduce((a,b)=>a+(b.price*b.qty),0);
    const delivery=subtotal>700?0:80;
    const total=subtotal+delivery;
    const order={id:'NK-'+Math.floor(10000+Math.random()*90000),date:new Date().toLocaleString(),name,email,phone,address,payMethod,items:cart,total:`R${total.toFixed(2)}`};
    localStorage.setItem('lastOrder', JSON.stringify(order));
    localStorage.removeItem('nkomaziCart'); cart=[];
    window.location.href='payment.html';
  });
}
const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    const n=document.getElementById('name').value.trim();
    const em=document.getElementById('email').value.trim();
    const m=document.getElementById('message').value.trim();
    const msgEl=document.getElementById('formMsg');
    if(n.length<3||!em.includes('@')||m.length<10){ msgEl.textContent='Fill correctly'; msgEl.style.color='#ff4444'; return; }
    msgEl.textContent='✓ Message sent!'; msgEl.style.color='#00ff88';
    contactForm.reset();
  });
}
document.addEventListener('DOMContentLoaded', updateCartCount);