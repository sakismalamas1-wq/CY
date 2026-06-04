// cart.js

function addToCart(name, price) {
    // Προσθήκη στο καλάθι
    cart.push({ name, price });
    updateCartUI();
    
    // Μικρό εφέ επιβεβαίωσης στο κουμπί
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "ΠΡΟΣΤΕΘΗΚΕ!";
    btn.style.backgroundColor = "#28a745";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
    }, 800);
}

function updateCartUI() {
    const count = cart.length;
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    document.getElementById('cart-count').innerText = count;
    document.getElementById('cart-total').innerText = total.toFixed(2);
    
    // Εμφάνιση του footer αν υπάρχει έστω και ένα προϊόν
    const footer = document.getElementById('cart-footer');
    if (count > 0) {
        footer.style.display = 'flex';
    } else {
        footer.style.display = 'none';
    }
}

function openCartModal() {
    // Δημιουργούμε ένα απλό modal (παράθυρο) για την ολοκλήρωση
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    const modalHtml = `
    <div id="checkout-modal" class="modal">
        <div class="modal-content">
            <h2>Η Παραγγελία σου</h2>
            <div id="cart-items-list">
                ${cart.map((item, index) => `
                    <div class="cart-line">
                        <span>${item.name}</span>
                        <span>${item.price.toFixed(2)}€ 
                            <button onclick="removeFromCart(${index})" class="del-btn">✖</button>
                        </span>
                    </div>
                `).join('')}
            </div>
            <hr>
            <div class="cart-line"><strong>ΣΥΝΟΛΟ:</strong> <strong>${total.toFixed(2)}€</strong></div>
            
            <h3>Στοιχεία Παράδοσης</h3>
            <input type="text" id="cust-name" placeholder="Ονοματεπώνυμο" class="form-input">
            <input type="tel" id="cust-phone" placeholder="Τηλέφωνο" class="form-input">
            <input type="text" id="cust-address" placeholder="Διεύθυνση & Αριθμός" class="form-input">
            <input type="text" id="cust-floor" placeholder="Όροφος" class="form-input">
            <textarea id="cust-notes" placeholder="Σχόλια (π.χ. κουδούνι, extras)" class="form-input"></textarea>
            
            <div class="modal-btns">
                <button onclick="closeModal()" class="btn-cancel">ΑΚΥΡΟ</button>
                <button onclick="submitOrder()" class="btn-submit">ΑΠΟΣΤΟΛΗ ΠΑΡΑΓΓΕΛΙΑΣ</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    document.getElementById('checkout-modal').remove();
    updateCartUI();
    if(cart.length > 0) openCartModal();
}

function closeModal() {
    const modal = document.getElementById('checkout-modal');
    if(modal) modal.remove();
}

async function submitOrder() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const addr = document.getElementById('cust-address').value;
    
    if(!name || !phone || !addr) {
        alert("Παρακαλώ συμπληρώστε Όνομα, Τηλέφωνο και Διεύθυνση!");
        return;
    }

    const orderData = {
        customer: {
            name, phone, address: addr, 
            floor: document.getElementById('cust-floor').value,
            notes: document.getElementById('cust-notes').value
        },
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        timestamp: new Date().toISOString()
    };

    // Εδώ στέλνουμε την παραγγελία στον PHP "ταχυδρόμο"
    const response = await fetch('order_handler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });

    if(response.ok) {
        alert("Η παραγγελία εστάλη επιτυχώς! Θα την λάβουμε σε δευτερόλεπτα.");
        cart = [];
        updateCartUI();
        closeModal();
    } else {
        alert("Κάτι πήγε στραβά. Παρακαλώ καλέστε μας στο 2321400029.");
    }
}