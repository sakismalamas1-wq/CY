let products = [];
let cart = [];

// 1. ΕΚΚΙΝΗΣΗ: ΦΟΡΤΩΝΟΥΜΕ ΤΑ ΠΡΟΪΟΝΤΑ
async function initWebSite() {
    try {
        console.log("Προσπάθεια σύνδεσης με το sync.php...");
        const res = await fetch('../sync.php'); 
        const data = await res.json();
        
        console.log("Δεδομένα που ήρθαν:", data); // Αυτό θα μας πει την αλήθεια στο F12

        // Ελέγχουμε όλα τα πιθανά ονόματα που μπορεί να έχουν τα προϊόντα σου
        products = data.products || data.server_products || data.all_products || [];
        
        if (products.length === 0) {
            console.warn("Προσοχή: Τα προϊόντα βρέθηκαν άδεια!");
            document.getElementById('webMenu').innerHTML = "<h3>Το μενού ενημερώνεται...</h3>";
        }

        renderWebCategories();
        // showPromo(); // Το κλείνουμε προσωρινά για να βλέπουμε το μενού
    } catch (e) {
        console.error("Σφάλμα σύνδεσης:", e);
        document.getElementById('webMenu').innerHTML = "<h3>Πρόβλημα σύνδεσης με το κατάστημα.</h3>";
    }
}

// 2. ΕΜΦΑΝΙΣΗ ΚΑΤΗΓΟΡΙΩΝ
function renderWebCategories() {
    const nav = document.getElementById('webCategories');
    const cats = [...new Set(products.map(p => p.category))];
    
    nav.innerHTML = cats.map((c, i) => `
        <button class="${i === 0 ? 'active' : ''}" onclick="filterWebMenu('${c}', this)">
            ${c}
        </button>
    `).join('');
    
    if (cats.length > 0) filterWebMenu(cats[0], nav.querySelector('button'));
}

// 3. ΕΜΦΑΝΙΣΗ ΠΡΟΪΟΝΤΩΝ
function filterWebMenu(cat, btn) {
    // Αλλαγή ενεργού κουμπιού
    document.querySelectorAll('#webCategories button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const menu = document.getElementById('webMenu');
    const filtered = products.filter(p => p.category === cat);

    menu.innerHTML = filtered.map(p => {
        const isSoldOut = p.stock !== undefined && Number(p.stock) <= 0;
        return `
            <div class="web-product-card ${isSoldOut ? 'sold-out' : ''}">
                <div class="prod-info">
                    <h4>${p.name}</h4>
                    <p>${p.price.toFixed(2)}€</p>
                    ${isSoldOut ? '<span class="sold-out-tag">ΕΞΑΝΤΛΗΘΗΚΕ</span>' : ''}
                </div>
                <button class="btn-add" onclick="addToCart('${p.name}')"> + </button>
            </div>
        `;
    }).join('');
}

// 4. ΔΙΑΧΕΙΡΙΣΗ ΚΑΛΑΘΙΟΥ
function addToCart(name) {
    const prod = products.find(p => p.name === name);
    if (!prod) return;

    cart.push({ n: prod.name, p: prod.price });
    updateCartBar();
}

function updateCartBar() {
    const bar = document.getElementById('cartBar');
    if (cart.length > 0) {
        bar.style.display = 'flex';
        document.getElementById('cartCount').innerText = cart.length;
        const total = cart.reduce((sum, item) => sum + item.p, 0);
        document.getElementById('cartTotal').innerText = total.toFixed(2);
    } else {
        bar.style.display = 'none';
    }
}

// 5. ΑΠΟΣΤΟΛΗ ΠΑΡΑΓΓΕΛΙΑΣ ΣΤΟ POS
async function submitWebOrder() {
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const addr = document.getElementById('custAddr').value;
    const notes = document.getElementById('custNotes').value;
    const type = document.querySelector('input[name="type"]:checked').value;

    if (!name || !phone) return alert("Παρακαλώ συμπληρώστε Όνομα και Τηλέφωνο!");

    // Φτιάχνουμε ένα "ειδικό" όνομα τραπεζιού για το POS
    const webTableName = `WEB_${type.toUpperCase()}_${name.substring(0,5)}`;
    
    // Προσθέτουμε τα στοιχεία του πελάτη ως πρώτο αντικείμενο στην παραγγελία
    const finalOrder = [
        { n: `👤 ${name} | 📞 ${phone}`, p: 0, printed: true },
        { n: `📍 ${addr}`, p: 0, printed: true },
        { n: `📝 ${notes}`, p: 0, printed: true },
        ...cart.map(item => ({ n: item.n, p: item.p, printed: false }))
    ];

    try {
        // Διαβάζουμε πρώτα όλα τα τραπέζια
        const res = await fetch('../sync.php');
        const data = await res.json();
        let allTables = data.tables || {};
        
        // Προσθέτουμε τη νέα παραγγελία
        allTables[webTableName] = finalOrder;

        // Στέλνουμε πίσω στο sync.php
        await fetch('../sync.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tables: allTables })
        });

        alert("Η παραγγελία σας στάλθηκε επιτυχώς!");
        cart = [];
        location.reload(); // Καθαρισμός
    } catch (e) {
        alert("Σφάλμα κατά την αποστολή.");
    }
}

// ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ MODALS
function openCheckout() { document.getElementById('checkoutModal').style.display = 'flex'; renderCartItems(); }
function closeCheckout() { document.getElementById('checkoutModal').style.display = 'none'; }
function closePromo() { document.getElementById('promoModal').style.display = 'none'; }
function showPromo() { document.getElementById('promoModal').style.display = 'flex'; document.getElementById('promoText').innerText = "Καλωσήρθατε στη Ρωξάνη! Δοκιμάστε τις νέες μας γεύσεις!"; }

function renderCartItems() {
    const container = document.getElementById('cartItems');
    container.innerHTML = cart.map((item, i) => `
        <div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #eee;">
            <span>${item.n}</span>
            <span>${item.p.toFixed(2)}€</span>
        </div>
    `).join('');
}

// ΕΚΤΕΛΕΣΗ
initWebSite();