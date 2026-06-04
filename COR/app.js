const priority = ["ΟΡΕΚΤΙΚΑ", "ΣΑΛΑΤΕΣ", "ΣΧΑΡΑΣ", "ΤΕΜΑΧΙΑ", "ΣΠΕΣΙΑΛ", "ΜΑΓΕΙΡΕΥΤΑ", "ΘΑΛΑΣΣΙΝΑ", "ΟΥΖΑ ΤΣΙΠΟΥΡΑ", "ΜΠΥΡΕΣ", "ΚΡΑΣΙΑ ΡΕΤΣΙΝΕΣ", "ΑΝΑΨΥΚΤΙΚΑ", "ΣΑΝΤΟΥΙΤΣ", "ΧΡΕΩΣΕΙΣ"];
const tableNums = ["take away", 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 41, 42, 43, 44, 45];
window.onerror = function(msg, url, line) {
    console.log("JS ERROR:", msg, "at line", line);
};

let products = JSON.parse(localStorage.getItem('roxani_products')) || [];
let allTablesData = {}; 
let selectedTable = null;
let currentOrder = [];
let pendingItem = null;
let isWriting = false; 
let writeTimeout = null;
let lastTotalItems = 0;
let bellSound = new Audio('bell.wav');
bellSound.preload = "auto";
bellSound.volume = 1;

// --- INITIALIZATION ---
window.onload = async function() {
    // 1. Άδεια για τον ήχο
    document.body.addEventListener('click', function() {
        bellSound.play().then(() => {
            bellSound.pause();
            bellSound.currentTime = 0;
        }).catch(e => console.log("Audio unlock failed"));
    }, { once: true });

    // 2. Φόρτωση προϊόντων από τη μνήμη
    const savedProducts = localStorage.getItem('roxani_products');
    if(savedProducts) products = JSON.parse(savedProducts);

    // 3. ΑΥΤΟΜΑΤΟ ΓΕΜΙΣΜΑ DELIVERY (Προσαρμοσμένο στα δικά σου IDs: delPhone, delAddress)
// ΑΥΤΟΜΑΤΟ ΓΕΜΙΣΜΑ DELIVERY (Με τα σωστά IDs από το index.html)
const phoneInput = document.getElementById('delPhone'); 
if (phoneInput) {
    phoneInput.addEventListener('input', async function(e) {
        const typedPhone = e.target.value.trim();
        if (typedPhone.length < 3) return; 

        // Διαβάζουμε την ατζέντα απευθείας από το αρχείο στον server
        const res = await fetch('customers.json?v=' + Date.now());
        const customers = await res.json();
        
        const found = customers.find(c => c.phone === typedPhone);

        if (found) {
            document.getElementById('delAddress').value = found.address || "";
            document.getElementById('delName').value = found.name || "";
            document.getElementById('delFloor').value = found.floor || "";
            document.getElementById('delNotes').value = found.notes || "";
            phoneInput.style.backgroundColor = "#004400"; 
        } else {
            phoneInput.style.backgroundColor = ""; 
        }
    });
}
    
    renderCategories();
    await fetchSync();
    
    // 4. Αυτόματη ανανέωση τραπεζιών
    setInterval(async () => { 
    if(!isWriting && !pendingItem) await fetchSync(); 
}, 2000); // 2 δευτερόλεπτα αντί για 1
};


// --- CORE FUNCTIONS ---
function lockUI() {
    isWriting = true;
    if (writeTimeout) clearTimeout(writeTimeout);
    writeTimeout = setTimeout(() => { isWriting = false; }, 4000);
}
function showProducts(cat, el) {
    const container = document.getElementById('menuProducts');
    if(!container) return;
    
    container.innerHTML = products
        .filter(p => p.category === cat)
        .map(p => `<button class="btn-prod" onclick="addToOrder('${p.name.replace(/'/g, "\\'")}')">${p.name}<br>${p.price.toFixed(2)}€</button>`)
        .join('');
}

async function fetchSync() {
    try {
        const res = await fetch('sync.php');
        const data = await res.json();
        
        // --- ΕΛΕΓΧΟΣ ΑΔΕΙΑΣ ---
        if (data.license_error === true) {
           document.body.innerHTML = `
    <div style="background:#000; color:#ff4444; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-family:sans-serif; padding:20px;">
        
        <div style="font-size:80px; margin-bottom:10px;">🔒</div>
        
        <h1 style="text-transform:uppercase; letter-spacing:2px; margin-bottom:10px;">Η άδεια χρήσης έληξε</h1>
        
        <p style="color:#fff; font-size:22px; margin-bottom:5px;">
            Επικοινωνήστε με τον προγραμματιστή για ανανέωση:
        </p>
        
        <p style="color:#ff4444; font-size:28px; font-weight:bold; margin-bottom:30px;">
            Τηλ: 6977246942
        </p>

        <div style="color:#555; font-size:14px; border-top: 1px solid #333; pt: 20px; width: 300px; padding-top: 20px;">
            Copyright © 2026 [Sakis Malamas]<br>
            All rights reserved.<br>
            Unauthorized copying or resale is strictly prohibited.
        </div>
        
    </div>`;
            return;
        }
        
        // 1. ΔΙΑΒΑΣΜΑ ΤΡΑΠΕΖΙΩΝ (Προσαρμογή στη νέα δομή του sync.php)
        // Το νέο sync.php στέλνει τα τραπέζια μέσα στο data.tables
        let incomingTables = data.tables || {};
        
        // 2. ΕΝΗΜΕΡΩΣΗ ΠΡΟΪΟΝΤΩΝ
        // Το νέο sync.php στέλνει τα προϊόντα στο data.products
        if (data.products) {
            localStorage.setItem('roxani_products', JSON.stringify(data.products));
            products = data.products;
        }

        // Σιγουρευόμαστε ότι κάθε τραπέζι είναι Array
        let tablesOnly = {};
        for (let key in incomingTables) {
            tablesOnly[key] = Array.isArray(incomingTables[key]) ? incomingTables[key] : [];
        }

        // 3. ΔΙΑΧΕΙΡΙΣΗ PRINTED STATUS
        for (let table in tablesOnly) {
            if (allTablesData[table] && Array.isArray(allTablesData[table])) {
                let localPrinted = allTablesData[table]
                    .filter(it => it && it.printed)
                    .map(it => it.n);

                tablesOnly[table] = tablesOnly[table].map(newItem => {
                    if (localPrinted.includes(newItem.n)) {
                        localPrinted.splice(localPrinted.indexOf(newItem.n), 1);
                        return { ...newItem, printed: true };
                    }
                    return newItem;
                });
            }
        }

        allTablesData = tablesOnly;
        renderTables(); // Τώρα θα ανάψουν τα χρώματα
        
        if (selectedTable && !isWriting) {
            currentOrder = [...(allTablesData[selectedTable] || [])];
            renderOrder();
        }

        // 4. ΗΧΟΣ (Bell)
        let currentTotal = 0;
        for (let t in tablesOnly) {
            currentTotal += tablesOnly[t].filter(it => !it.printed).length;
        }
        
        if (currentTotal > lastTotalItems) {
            new Audio('bell.wav').play().catch(e => {});
        }
        lastTotalItems = currentTotal;

    } catch(e) { 
        console.error("Sync failed details:", e); 
    }
}

async function save() {
    try {
        await fetch('sync.php', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({
                tables: allTablesData,
                products: products
            }) 
        });
    } catch(e) { 
        console.error("Save failed"); 
    }
}

// --- TABLE & MENU RENDERING ---
function renderTables() {
    const container = document.getElementById('salonView');
    if(!container) return;
    container.innerHTML = "";
    
    tableNums.forEach(n => {
        let name = (n === "TAKE AWAY") ? n : "ΤΡΑΠΕΖΙ " + n;
        const btn = document.createElement('button');
        
        // Βασική κλάση
        btn.className = "btn-table"; 
        
        let items = allTablesData[name] || [];
        
        if(items.length > 0) {
            // Έλεγχος αν υπάρχουν νέα (μη εκτυπωμένα) αντικείμενα
            let hasUnprinted = items.some(it => it.printed === false);
            
            if(hasUnprinted) {
                btn.classList.add('pulsing-red'); // Γίνεται ΚΟΚΚΙΝΟ (Νέα παραγγελία)
            } else {
                btn.classList.add('table-has-order'); // Γίνεται ΜΟΒ (Εκτυπωμένη/Κουζίνα)
            }
        }

        // Αν είναι το τρέχον επιλεγμένο τραπέζι, βάλε το γαλάζιο glow
        if(selectedTable === name) {
            btn.style.boxShadow = "0 0 20px #159cc2";
            btn.style.border = "2px solid #159cc2";
        }
        
        btn.innerText = n;
        btn.onclick = () => selectTable(name);
        container.appendChild(btn);
    });
}

// --- 1. ΟΤΑΝ ΕΠΙΛΕΓΕΙΣ ΤΡΑΠΕΖΙ, ΝΑ ΦΟΡΤΩΝΕΙ ΤΑ ΣΤΟΙΧΕΙΑ ---
async function selectTable(name) {
    if(window.navigator.vibrate) window.navigator.vibrate(20);
    lockUI();
    selectedTable = name;
    
    await fetchSync();
    
    // Καθαρισμός των πεδίων Delivery στην οθόνη
    clearDeliveryFields();

    // Αν το τραπέζι έχει αποθηκευμένα στοιχεία delivery, φόρτωσέ τα
    if(allTablesData[name + "_info"]) {
        const info = allTablesData[name + "_info"];
        document.getElementById('delPhone').value = info.phone || "";
        document.getElementById('delName').value = info.name || "";
        document.getElementById('delAddress').value = info.addr || "";
        document.getElementById('delFloor').value = info.floor || "";
        document.getElementById('delNotes').value = info.notes || "";
    }

    currentOrder = [...(allTablesData[name] || [])]; 
    renderOrder();
    renderTables();
}

// --- 2. ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΚΑΘΑΡΙΣΜΟ ---
function clearDeliveryFields() {
    ['delPhone', 'delName', 'delAddress', 'delFloor', 'delNotes'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
}

// --- 3. ΑΠΟΘΗΚΕΥΣΗ ΣΤΟΙΧΕΙΩΝ ΟΤΑΝ ΠΑΤΑΣ ΚΟΥΖΙΝΑ Ή ΣΥΝΟΛΟ ---
async function saveDeliveryInfo() {
    if(!selectedTable) return;
    
    const info = {
        phone: document.getElementById('delPhone').value,
        name: document.getElementById('delName').value,
        addr: document.getElementById('delAddress').value,
        floor: document.getElementById('delFloor').value,
        notes: document.getElementById('delNotes').value
    };

    // Αποθηκεύουμε τα στοιχεία σε ένα "κρυφό" κλειδί στο allTablesData
    allTablesData[selectedTable + "_info"] = info;
    await save();
}

function renderCategories() {
    // 1. Φρεσκάρισμα της λίστας από το localStorage
    products = JSON.parse(localStorage.getItem('roxani_products')) || [];

    const container = document.getElementById('menuCategories');
    if(!container) return;
    container.innerHTML = "";
    
    // 2. Παίρνουμε μόνο τις κατηγορίες που έχουν όντως προϊόντα μέσα
    const activeCats = [...new Set(products.map(p => p.category))].filter(c => c);
    
    // 3. Τις ταξινομούμε βάσει της σειράς που θέλεις (προαιρετικό)
    const priority = ["ΟΡΕΚΤΙΚΑ", "ΣΑΛΑΤΕΣ", "ΣΧΑΡΑΣ", "ΤΕΜΑΧΙΑ", "ΣΠΕΣΙΑΛ", "ΜΑΓΕΙΡΕΥΤΑ", "ΘΑΛΑΣΣΙΝΑ", "ΟΥΖΑ ΤΣΙΠΟΥΡΑ", "ΜΠΥΡΕΣ", "ΚΡΑΣΙΑ ΡΕΤΣΙΝΕΣ", "ΑΝΑΨΥΚΤΙΚΑ", "ΣΑΝΤΟΥΙΤΣ", "ΧΡΕΩΣΕΙΣ"];
    activeCats.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));

    activeCats.forEach((cat, index) => {
        const btn = document.createElement('div');
        btn.className = "btn-cat";
        btn.innerText = cat;
        btn.onclick = function() {
            document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showProducts(cat, this);
        };
        container.appendChild(btn);

        // Φόρτωση της πρώτης κατηγορίας αυτόματα
        if(index === 0) {
            btn.classList.add('active');
            showProducts(cat, btn);
        }
    });
}

// --- ORDER LOGIC ---
async function addToOrder(name) {
    if (!selectedTable) return alert("Πρώτα επιλέξτε τραπέζι!");
    
    // Κλειδώνουμε το UI για να μην γίνει μπέρδεμα με το sync
    lockUI();

    const prod = products.find(p => p.name === name);
    if (!prod) return;

    // ΕΛΕΓΧΟΣ ΓΙΑ EXTRAS
    if (prod.extras && prod.extras.length > 0 && prod.extras[0] !== "") {
        // Αν έχει extras, άνοιξε το Modal
        openExtrasModal(prod);
    } else {
        // Αν ΔΕΝ έχει, πρόσθεσέ το κατευθείαν
        currentOrder.push({ n: prod.name, p: prod.price, printed: false });
        allTablesData[selectedTable] = [...currentOrder];
        renderOrder();
        await save();
    }
}

function renderOrder() {
    const list = document.getElementById('orderList');
    if(!list) return;

    let total = 0;
    const counts = {};

    // 1. Ελέγχουμε αν στην παραγγελία υπάρχουν νέα (μη εκτυπωμένα) προϊόντα
    const hasNewItems = currentOrder.some(it => !it.printed);

currentOrder.forEach(it => {
        // 1. Βασική τιμή
        let itemPrice = parseFloat(it.p) || 0;

        // 2. ΕΛΕΓΧΟΣ ΓΙΑ EXTRAS (Ψάχνει αριθμούς μετά το +)
        if (it.n.includes('+')) {
            let parts = it.n.split('+');
            for (let j = 1; j < parts.length; j++) {
                // Αυτό εδώ ψάχνει να βρει τον αριθμό (π.χ. 0.30 ή 2) μέσα στο κείμενο
                let match = parts[j].match(/(\d+(\.\d+)?)/);
                if (match) {
                    itemPrice += parseFloat(match[0]);
                }
            }
        }
        
        total += itemPrice;

        // 3. ΟΜΑΔΟΠΟΙΗΣΗ
        let key = it.n + "|||" + it.printed; 
        if (!counts[key]) {
            counts[key] = { 
                qty: 0, 
                unitPrice: itemPrice, 
                printed: it.printed, 
                name: it.n 
            };
        }
        counts[key].qty += 1;
    });

    let html = "";
    for (let key in counts) {
        let item = counts[key];
        let lineTotal = item.qty * item.unitPrice;

        // ΕΔΩ ΕΙΝΑΙ ΤΟ ΧΡΩΜΑ: Αν printed είναι false -> ΚΟΚΚΙΝΟ, αν true -> ΜΑΥΡΟ
        let style = item.printed 
            ? "color:#000; font-weight:normal;" 
            : "color:red; font-weight:bold; background-color: #fff5f5;"; // Πρόσθεσα και ελαφρύ φόντο για να "χτυπάει"

        html += `
        <div style="display:flex; justify-content:space-between; align-items: center; padding:10px; border-bottom:1px solid #eee; ${style}">
            <span style="flex:1; white-space: pre-line; padding-right:10px;">${item.qty} x ${item.name}</span>
            <span style="min-width:115px; text-align:right;">
                ${lineTotal.toFixed(2)}€
                <b onclick="deleteItemById(${currentOrder.findLastIndex(it => it.n === item.name)})" 
                   style="color:#dc3545; padding-left:15px; cursor:pointer; font-size:1.5em;">
                   ✖
                </b>
            </span>
        </div>`;
    }

    list.innerHTML = html;
    document.getElementById('totalBox').innerText = total.toFixed(2) + "€";
    document.getElementById('tableTitle').innerText = selectedTable;
}

async function deleteItemById(index) {
    if (!selectedTable) return;
    
    // Αν το προϊόν είναι εκτυπωμένο
    if (currentOrder[index].printed) {
        let confirmDelete = confirm("ΠΡΟΣΟΧΗ: Το προϊόν έχει ήδη εκτυπωθεί στην κουζίνα! Θέλετε σίγουρα να το διαγράψετε από το λογαριασμό;");
        if (!confirmDelete) return; // Αν πατήσει Άκυρο, σταματάει εδώ
    }

    lockUI();
    currentOrder.splice(index, 1); 
    allTablesData[selectedTable] = [...currentOrder];
    
    renderOrder();
    await save();
}

// --- PRINTING ---
async function printToKitchen() {
    const saved = JSON.parse(localStorage.getItem('gbr_ui_settings') || "{}");
    const printFS = saved['--print-font-size'] || '22px'; 
    const copies = parseInt(saved['--print-copies']) || 1; 

    let newItems = currentOrder.filter(it => !it.printed);
    let oldItems = currentOrder.filter(it => it.printed); 
    if (newItems.length === 0) return alert("Όλα εκτυπωμένα!");

    let sorted = sortOrderItems([...newItems]);

    let printContent = `<html><head><style>
        @media print {
            .cut-page { page-break-after: always; } 
            body { margin: 0; padding: 0; }
        }
    </style></head><body style="font-family:Arial; width:80mm; padding:0; margin:0;">`;

    const groups = {
        "G1": ["ΟΡΕΚΤΙΚΑ", "ΣΑΛΑΤΕΣ"],
        "G2": ["ΣΧΑΡΑΣ", "ΤΕΜΑΧΙΑ", "ΣΠΕΣΙΑΛ", "ΜΑΓΕΙΡΕΥΤΑ", "ΘΑΛΑΣΣΙΝΑ"],
        "G3": ["ΣΑΝΤΟΥΙΤΣ"],
        "G4": ["ΟΥΖΑ ΤΣΙΠΟΥΡΑ", "ΜΠΥΡΕΣ", "ΚΡΑΣΙΑ ΡΕΤΣΙΝΕΣ", "ΑΝΑΨΥΚΤΙΚΑ", "ΧΡΕΩΣΕΙΣ"]
    };

    let receiptBody = `<div class="cut-page">`;

    // 🔥 ΑΡΧΙΚΑ ΚΕΝΑ
    receiptBody += `<br><br><br><br>`;

    if(oldItems.length > 0) {
        receiptBody += `<center><h1 style="background:#000; color:#fff; padding:5px;">* ΣΥΜΠΛΗΡΩΜΑ *</h1></center>`;
    }

    // 🔥 ΤΡΑΠΕΖΙ
    receiptBody += `<center><h2>${selectedTable}</h2></center>`;

    // 🔥 ΟΜΑΔΟΠΟΙΗΣΗ
    let counts = {};
    sorted.forEach(it => {
        counts[it.n] = (counts[it.n] || 0) + 1;
    });

    let uniqueNames = [...new Set(sorted.map(it => it.n))];

    const groupOrder = ["G1", "G2", "G3", "G4"];

    groupOrder.forEach(group => {

        let itemsInGroup = uniqueNames.filter(name => {
    // 1. Παίρνουμε το καθαρό όνομα πριν από οποιοδήποτε έξτρα (+ ή \n)
    let cleanName = name.split('+')[0].split('\n')[0].trim();
    
    // 2. Ψάχνουμε το προϊόν στο μενού για να βρούμε την κατηγορία του
    let prodInfo = products.find(p => p.name === cleanName);
    let cat = prodInfo ? prodInfo.category : "";
    
    // 3. Αν δεν το βρήκαμε στο μενού, κοιτάμε αν η κατηγορία υπάρχει ήδη στην παραγγελία
    if (!cat) {
        let orderItem = currentOrder.find(it => it.n === name);
        cat = orderItem ? orderItem.category : "";
    }
    
    return groups[group].includes(cat);
});

        if (itemsInGroup.length > 0) {

            // 🔥 ΚΕΝΑ ΠΡΙΝ ΤΗΝ ΚΑΤΗΓΟΡΙΑ
            receiptBody += `<br><br><br>`;

            itemsInGroup.forEach(name => {
                receiptBody += `
                <div style="font-size:${printFS}; font-weight:bold; padding:5px 0;">
                    ${counts[name]} x ${name}
                </div>`;
            });
        }
    });

    // 🔥 ΤΕΛΙΚΑ ΚΕΝΑ
    receiptBody += `<br><br><br><br><br><br>`;
    receiptBody += `</div>`;

    for (let i = 0; i < copies; i++) {
        printContent += receiptBody;
    }

    printContent += `</body></html>`;

    const win = window.open('', '', 'width=600,height=800');
    win.document.write(printContent);
    win.document.write(`<script>window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); };<\/script>`);
    win.document.close();

    currentOrder.forEach(it => it.printed = true);
    allTablesData[selectedTable] = [...currentOrder];
    await save();
    renderOrder();
}

// --- HELPERS ---
function sortOrderItems(items) {
    return items.sort((a, b) => {
        let catA = products.find(p => p.name === a.n.split(' (')[0])?.category || "ΧΡΕΩΣΕΙΣ";
        let catB = products.find(p => p.name === b.n.split(' (')[0])?.category || "ΧΡΕΩΣΕΙΣ";
        return priority.indexOf(catA) - priority.indexOf(catB);
    });
}

// --- EXTRAS MODAL ---
// ΔΙΟΡΘΩΣΗ EXTRAS (Για να εμφανίζονται και να κλείνουν)
function openExtrasModal(prod) {
    pendingItem = { ...prod, selectedExtras: [] };
    const modal = document.getElementById('extrasModal');
    const list = document.getElementById('extrasList');
    document.getElementById('modalProdName').innerText = prod.name;
    list.innerHTML = "";
    
    prod.extras.forEach(ex => {
        if(!ex) return;
        const btn = document.createElement('button');
        // Χρησιμοποιούμε την κλάση btn-nav-gbr για να είναι ίδια με τα άλλα κουμπιά
        btn.className = "btn-nav-gbr"; 
        btn.style.width = "100%";
        btn.style.margin = "5px 0";
        btn.innerText = ex;
        btn.onclick = function() {
            this.classList.toggle('selected-extra');
            // Αλλαγή χρώματος όταν επιλέγεται
            if (this.style.background === 'rgb(32, 220, 245)') {
                this.style.background = '#000';
                this.style.color = '#20dcf5';
            } else {
                this.style.background = '#20dcf5';
                this.style.color = '#000';
            }
            
            if (pendingItem.selectedExtras.includes(ex)) {
                pendingItem.selectedExtras = pendingItem.selectedExtras.filter(e => e !== ex);
            } else {
                pendingItem.selectedExtras.push(ex);
            }
        };
        list.appendChild(btn);
    });
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// Και στη συνάρτηση closeExtras() και confirmExtras() βάλε:
function closeExtras() {
    const modal = document.getElementById('extrasModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    pendingItem = null;
}

async function confirmExtras() {
    if (!pendingItem) return;

    let finalName = pendingItem.name;
    
    // Αν υπάρχουν έξτρα, τα ενώνουμε βάζοντας το \n ΠΡΙΝ από κάθε "+"
    if (pendingItem.selectedExtras.length > 0) {
        // Το \n λέει στο σύστημα "άλλαξε σειρά"
        let extrasFormatted = pendingItem.selectedExtras.map(ex => "\n+ " + ex).join("");
        finalName += extrasFormatted;
    }

    currentOrder.push({ 
        n: finalName, 
        p: pendingItem.price, 
        category: pendingItem.category, 
        printed: false 
    });

    allTablesData[selectedTable] = [...currentOrder];
    
    closeExtras();
    renderOrder();
    await save(); 
}

function closeExtras() {
    document.getElementById('extrasModal').style.display = 'none';
    pendingItem = null;
    lockUI();
}
// ΔΙΟΡΘΩΣΗ ΑΚΥΡΩΣΗΣ (Για να δουλέψει το κουμπί 3. ΑΚΥΡΩΣΗ)
function clearCurrentOrder() {
    if(!selectedTable) return alert("Επιλέξτε τραπέζι!");
    if(confirm("Ακύρωση τρέχουσας παραγγελίας;")) {
        // Κρατάμε μόνο όσα έχουν ήδη εκτυπωθεί
        currentOrder = currentOrder.filter(it => it.printed);
        allTablesData[selectedTable] = [...currentOrder];
        save();
        renderOrder();
    }
}
function showDelivery() {
    document.getElementById('salonView').classList.add('hidden');
    document.getElementById('deliveryView').classList.remove('hidden');
    // Εδώ μπορείς να προσθέσεις τη λογική για τα τραπέζια delivery
}

function showSalon() {
    document.getElementById('deliveryView').classList.add('hidden');
    document.getElementById('salonView').classList.remove('remove');
    document.getElementById('salonView').classList.remove('hidden');
}

// ΝΕΑ ΕΚΤΥΠΩΣΗ ΓΙΑ ΣΥΝΟΛΟ (Με site, ημερομηνία και 5 σειρές delivery)
// --- ΕΝΗΜΕΡΩΜΕΝΗ ΕΚΤΥΠΩΣΗ ΛΟΓΑΡΙΑΣΜΟΥ (ΜΕ ΤΑ 5 ΠΕΔΙΑ) ---
async function printFinalBill() {
    if(!selectedTable) return;
    
    // 1. ΤΡΑΒΑΕΙ ΤΟ ΜΕΓΕΘΟΣ ΑΠΟ ΤΟ ADMIN
    const saved = JSON.parse(localStorage.getItem('gbr_ui_settings') || "{}");
    const printFS = saved['--print-font-size'] || '20px'; 

    const now = new Date();
    const dateTime = now.toLocaleDateString('el-GR') + " " + now.toLocaleTimeString('el-GR');
    
    // Καθαρίζουμε τα στοιχεία (trim) για να μην σώζουμε κενά
    const phone = document.getElementById('delPhone')?.value.trim() || "";
    const name = document.getElementById('delName')?.value || "";
    const address = document.getElementById('delAddress')?.value || "";
    const floor = document.getElementById('delFloor')?.value || "";
    const notes = document.getElementById('delNotes')?.value || "";

    // --- ΑΥΤΟΜΑΤΟ ΣΩΣΙΜΟ ΠΕΛΑΤΗ (Μόνο αν είναι Delivery/Take Away και έχει τηλέφωνο) ---
    if (phone.length > 5 && !phone.includes('.')) {
        const customerData = { phone, name, address, floor, notes };
        fetch('save_customer.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        }).catch(e => console.log("Save customer error:", e));
    }

    const win = window.open('', '', 'width=600,height=800');
    
    win.document.write(`
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; font-weight: 900; }
                center { text-align: center; }
                .line { display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 2px 0; }
                .items-list { line-height: 1.8; font-size: ${printFS}; }
                .del-box { border:2px solid #000; padding:8px; margin:10px 0; font-size:18px; line-height:1.6; }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <center>
                <h1 style="margin:0; font-size:25px;">ΡΩΞΑΝΗ</h1>
                <div style="font-size:25px;">ΤΗΛ: 2321400029</div>
                <div style="font-size:25px; font-weight:bold; margin-top:2px;">www.roxani.gr</div>
                <hr>
                <h2 style="margin:5px 0;">${selectedTable}</h2>
            </center>
    `);

    // Εμφάνιση στοιχείων μόνο αν υπάρχουν πραγματικά δεδομένα
    if((selectedTable.toUpperCase().includes("DELIVERY") || selectedTable.toUpperCase() === "TAKE AWAY") && phone !== "") {
        win.document.write(`
            <div class="del-box">
                ΤΗΛ: ${phone}<br>
                ΟΝΟΜΑ: ${name}<br>
                ΔΙΕΥΘ: ${address}<br>
                ΟΡΟΦΟΣ: ${floor}<br>
                ΣΧΟΛΙΑ: ${notes}
            </div>
        `);
    }

    win.document.write(`<div class="items-list">`); 
    const billCounts = {};
    currentOrder.forEach(it => {
        if (!billCounts[it.n]) {
            billCounts[it.n] = { qty: 0, price: it.p };
        }
        billCounts[it.n].qty += 1;
    });

    for (let name in billCounts) {
        let item = billCounts[name];
        win.document.write(`
            <div class="line">
                <span>${item.qty} x ${name}</span> 
                <span>${(item.qty * item.price).toFixed(2)}€</span>
            </div>`);
    }
    win.document.write(`</div>`);

    win.document.write(`
        <div style="margin-top:15px; text-align:right;">
            <h1 style="font-size:28px; margin:0;">ΣΥΝΟΛΟ: ${document.getElementById('totalBox').innerText}</h1>
        </div>

        <center style="margin-top:10px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.roxani.gr" style="width:110px; height:110px;">
            <div style="font-size:15px; font-weight:bold; margin-top:2px;">SCAN MENU</div>
        </center>

        <center style="margin-top:15px;">
            <div style="font-size:18px; font-weight:900;">ΕΥΧΑΡΙΣΤΟΥΜΕ ΠΟΛΥ!</div>
            <div style="font-size:16px; margin-top:5px;">${dateTime}</div>
        </center>

        <div style="margin-top: 50px; text-align:center;">
            <br><br><br><br>
            . 
        </div>
    </body>
    </html>`);
    
    win.document.close();

    // ΑΔΕΙΑΣΜΑ ΤΡΑΠΕΖΙΟΥ
// ΑΔΕΙΑΣΜΑ ΤΡΑΠΕΖΙΟΥ - ΑΝΤΙΚΑΤΑΣΤΑΣΗ ΟΛΟΥ ΤΟΥ BLOCK
    setTimeout(async () => {
        const totalBox = document.getElementById('totalBox');
        const currentTotalText = totalBox ? totalBox.innerText : "0";
        
        if(confirm("Θέλετε να αδειάσει το τραπέζι " + selectedTable + " με ποσό " + currentTotalText + ";")) {
            
            // 1. ΠΑΙΡΝΟΥΜΕ ΤΟ ΚΑΘΑΡΟ ΝΟΥΜΕΡΟ
            let val = currentTotalText.replace('€', '').trim();
            let amount = parseFloat(val);

            // 2. ΤΟ ΣΩΖΟΥΜΕ ΣΤΟ ΙΣΤΟΡΙΚΟ (ΤΑΜΕΙΟ)
            if (!isNaN(amount) && amount > 0) {
                let history = JSON.parse(localStorage.getItem('gbr_order_history') || "[]");
                history.push({
                    t: selectedTable,
                    a: amount,
                    d: new Date().toISOString()
                });
                localStorage.setItem('gbr_order_history', JSON.stringify(history));
            }

            // 3. ΜΗΔΕΝΙΖΟΥΜΕ ΤΑ ΠΑΝΤΑ
// 3. ΜΗΔΕΝΙΖΟΥΜΕ ΤΑ ΠΑΝΤΑ
delete allTablesData[selectedTable];
delete allTablesData[selectedTable + "_info"]; // 🔥 ΣΗΜΑΝΤΙΚΟ (delivery)

currentOrder = [];
selectedTable = null;

// καθάρισε UI
clearDeliveryFields();

const title = document.getElementById('tableTitle');
if(title) title.innerText = "—";
            if(totalBox) totalBox.innerText = "0.00€";

            // 4. ΣΩΖΟΥΜΕ ΤΗΝ ΚΑΤΑΣΤΑΣΗ ΤΩΝ ΤΡΑΠΕΖΙΩΝ
            await save(); 

            // 5. ΦΡΕΣΚΑΡΙΣΜΑ ΟΘΟΝΗΣ
            renderTables();
            if (typeof renderOrder === "function") renderOrder();
            
            // Κλείσιμο μενού αν είναι ανοιχτό
            const modal = document.querySelector('.modal');
            if(modal) modal.style.display = 'none';
        }
    }, 1000);
}
async function openSecureCashier() {
    let pin = prompt("Κωδικός Ταμείου:");
    if (pin !== "1234") {
        alert("Λάθος Κωδικός!");
        return;
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    let history = JSON.parse(localStorage.getItem('gbr_order_history') || "[]");

    let report = `--------------------------------\n`;
    report += `   ΤΑΜΕΙΟ ΡΩΞΑΝΗ\n`;
    report += `   ${now.toLocaleDateString('el-GR')} ${now.toLocaleTimeString('el-GR')}\n`;
    report += `--------------------------------\n`;

    let total = 0;

    history.forEach(order => {
        if (order.d && order.d.startsWith(today)) {
            report += `${order.t.padEnd(15)} : ${order.a.toFixed(2)}€\n`;
            total += order.a;
        }
    });

    report += `--------------------------------\n`;
    report += `ΓΕΝΙΚΟ ΣΥΝΟΛΟ: ${total.toFixed(2)}€\n`;
    report += `--------------------------------\n`;

    const win = window.open('', '', 'width=400,height=600');
    win.document.write(`<pre style="font-family:Arial; font-size:25px; padding:20px;">${report}</pre>`);
    win.document.write(`<script>window.print(); window.close();<\/script>`);

    try {
        await fetch('save_total.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report: report })
        });
    } catch (err) {
        console.error("Σφάλμα PHP:", err);
    }
}

async function generateDailyReport() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('el-GR');
    let reportText = `${dateStr}\n`;
    let grandTotal = 0;

    // Υπολογισμός από το allTablesData (όσα τραπέζια έχουν κλείσει/πληρωθεί)
    // Σημείωση: Χρειάζεται μια μεταβλητή που να κρατάει τα κλεισμένα της ημέρας
    // Για τώρα θα πάρει ό,τι υπάρχει στο τρέχον sync
    for (let table in allTablesData) {
        let tableTotal = allTablesData[table].reduce((sum, it) => sum + it.p, 0);
        if (tableTotal > 0) {
            reportText += `${table}: ${tableTotal.toFixed(2)}€\n`;
            grandTotal += tableTotal;
        }
    }
    reportText += `ΓΕΝΙΚΟ ΣΥΝΟΛΟ: ${grandTotal.toFixed(2)}€\n----------------\n`;

    // 1. Εκτύπωση
    const win = window.open('', '', 'width=600,height=800');
    win.document.write(`<pre style="font-family:Arial; font-size:20px;">${reportText}</pre>`);
    win.document.write('<script>window.print(); window.close();<\/script>');

    // 2. Αποθήκευση στο TOTAL.TXT μέσω PHP
    try {
        await fetch('save_total.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ report: reportText })
        });
    } catch(e) { console.error("Error saving total", e); }
}
// --- ΗΧΟΣ ΓΙΑ ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ (ΚΟΥΔΟΥΝΙΣΜΑ) ---

async function checkNewOrdersSound(newData) {
    let currentTotal = 0;
    for (let t in newData) currentTotal += newData[t].length;
    
    if (currentTotal > lastTotalItems && lastTotalItems !== 0) {
        let audio = new Audio('bell.wav'); // Ένας απλός ήχος beep
        audio.play().catch(e => console.log("Audio play blocked"));
    }
    lastTotalItems = currentTotal;
}
function saveDeliveryData() {
    const phone = document.getElementById('delPhone').value;
    const name = document.getElementById('delName').value;
    const address = document.getElementById('delAddress').value;

    if (phone === "" || address === "") {
        alert("⚠️ Παρακαλώ γράψτε Τηλέφωνο και Διεύθυνση!");
        return;
    }

    // 1. Ορίζουμε το τρέχον τραπέζι ως "DELIVERY" για να το βλέπει το app.js
    window.currentTable = "DELIVERY"; 
    
    // 2. Ενημερώνουμε τον τίτλο στη μεσαία στήλη
    const titleElem = document.getElementById('tableTitle');
    if (titleElem) {
        titleElem.innerText = "DELIVERY: " + address;
    }

    // 3. Καθαρίζουμε την προηγούμενη λίστα (αν υπήρχε) για να ξεκινήσει νέα παραγγελία
    if (typeof currentOrder !== 'undefined') {
        currentOrder = [];
        updateOrderDisplay();
    }

    alert("✅ Το Delivery ενεργοποιήθηκε! Μπορείτε να βάλετε προϊόντα.");
}
// ΑΥΤΟ ΕΙΝΑΙ ΤΟ "ΚΑΛΩΔΙΟ" ΠΟΥ ΣΥΝΔΕΕΙ ΤΟ ADMIN ΜΕ ΤΗΝ ΕΜΦΑΝΙΣΗ
function applySavedStyles() {
    const saved = JSON.parse(localStorage.getItem('gbr_ui_settings') || "{}");
    
    // Εφαρμογή για το μέγεθος γραμμάτων στο Delivery
    if (saved['--delivery-font-size']) {
        const delInputs = document.querySelectorAll('#deliveryView input, #deliveryView textarea');
        delInputs.forEach(el => el.style.fontSize = saved['--delivery-font-size']);
    }

    // Εφαρμογή για το χρώμα των κουμπιών
    if (saved['--accent-color']) {
        const buttons = document.querySelectorAll('.btn-cat, .btn-prod, .btn-nav-gbr, .btn-table');
        buttons.forEach(btn => {
            btn.style.borderColor = saved['--accent-color'];
            if (btn.classList.contains('active')) {
                btn.style.background = saved['--accent-color'];
            }
        });
    }
}
function finalizeOrder(tableId, totalAmount) {
    let history = JSON.parse(localStorage.getItem('gbr_order_history') || "[]");
    
    let orderEntry = {
        table: tableId,
        total: parseFloat(totalAmount),
        timestamp: new Date().toISOString(),
        // Παίρνουμε τα στοιχεία από την οθόνη εκείνη τη στιγμή
        phone: document.getElementById('delPhone')?.value || "",
        name: document.getElementById('delName')?.value || "",
        address: document.getElementById('delAddress')?.value || "",
        floor: document.getElementById('delFloor')?.value || "",
        notes: document.getElementById('delNotes')?.value || ""
    };
    
    history.push(orderEntry);
    localStorage.setItem('gbr_order_history', JSON.stringify(history));
    console.log("Στοιχεία πελάτη αποθηκεύτηκαν στο ιστορικό.");
}
async function fetchProducts() {
    try {
        // Διαβάζουμε και εδώ από το tables_data.json με το timestamp
        const res = await fetch('tables_data.json?v=' + Date.now());
        const data = await res.json();

        // Παίρνουμε τα προϊόντα από το κλειδί "products" που στέλνει το Admin
        if (data && data.products) {
            products = data.products;

            // Αποθήκευση και τοπικά στον browser (backup)
            localStorage.setItem('roxani_products', JSON.stringify(products));

            renderCategories();
            console.log("Το κεντρικό POS ενημερώθηκε με τα νέα προϊόντα!");
        }
    } catch (e) {
        console.log("Αποτυχία φόρτωσης προϊόντων στο POS:", e);
    }
}
async function forceMenuUpdate() {
    localStorage.removeItem('roxani_products'); // Σβήνουμε το παλιό
    await fetchProducts(); // Κατεβάζουμε το καινούργιο
    alert("Το μενού ενημερώθηκε!");
    location.reload(); // Ανανέωση σελίδας
}

// Τρέξε την παραπάνω λειτουργία κάθε φορά που γίνεται Sync
// Πρόσθεσε αυτή τη γραμμή ΜΕΣΑ στην fetchSync(), στο τέλος της:
// applySavedStyles();