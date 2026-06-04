let webOrders = [];
let selectedOrderId = null;
let itemToChangeIndex = null;
let products = JSON.parse(localStorage.getItem('gbr_products') || "[]");

// 1. ΕΚΚΙΝΗΣΗ & ΑΥΤΟΜΑΤΗ ΑΝΑΝΕΩΣΗ ΚΑΘΕ 5 ΔΕΥΤΕΡΟΛΕΠΤΑ
window.onload = function() {
    loadMenuCategories();
    fetchWebOrders(); 
    setInterval(fetchWebOrders, 5000); // Τσεκάρει για νέες παραγγελίες κάθε 5 מש
};

// 2. ΤΡΑΒΑΜΕ ΤΙΣ ΠΑΡΑΓΓΕΛΙΕΣ ΑΠΟ ΤΟ SYNC.PHP
async function fetchWebOrders() {
    try {
        // Στέλνουμε action=get_web_orders στο δικό σου sync.php
        let response = await fetch('sync.php?action=get_web_orders');
        let data = await response.json();
        
        if (data && Array.isArray(data)) {
            webOrders = data;
            
            // Αν δεν έχουμε επιλέξει κάποια, επιλέγουμε την πρώτη νέα
            if (!selectedOrderId && webOrders.length > 0) {
                selectedOrderId = webOrders[0].id;
            }
            
            renderWebOrders();
            if (selectedOrderId) showOrderDetails(selectedOrderId);
        }
    } catch (error) {
        console.error("Σφάλμα κατά το τράβηγμα των παραγγελιών:", error);
    }
}

// 3. ΕΜΦΑΝΙΣΗ ΛΙΣΤΑΣ ΠΑΡΑΓΓΕΛΙΩΝ (ΑΡΙΣΤΕΡΑ)
function renderWebOrders() {
    let html = '<div class="col-title">📥 Νέες Online Παραγγελίες</div>';
    
    if (webOrders.length === 0) {
        html += '<div style="padding:20px; color:#aaa; text-align:center;">Δεν υπάρχουν εκκρεμείς παραγγελίες.</div>';
        document.querySelector('.col-orders').innerHTML = html;
        return;
    }

    webOrders.forEach(order => {
        let activeClass = order.id == selectedOrderId ? 'active' : '';
        
        let payBadge = '';
        if(order.payment === 'ΜΕΤΡΗΤΑ') payBadge = `<span style="background:#28a745; color:white; padding:2px 6px; font-size:11px; border-radius:4px; font-weight:bold; margin-left:5px;">💵 ΜΕΤΡΗΤΑ</span>`;
        if(order.payment === 'ΚΑΡΤΑ') payBadge = `<span style="background:#007bff; color:white; padding:2px 6px; font-size:11px; border-radius:4px; font-weight:bold; margin-left:5px;">💳 ΚΑΡΤΑ</span>`;
        if(order.payment === 'ONLINE') payBadge = `<span style="background:#6f42c1; color:white; padding:2px 6px; font-size:11px; border-radius:4px; font-weight:bold; margin-left:5px;">📱 ONLINE</span>`;

        let total = order.items.reduce((sum, item) => sum + (parseFloat(item.p) * parseInt(item.q)), 0);

        html += `
        <div class="order-card ${activeClass}" onclick="selectOrder('${order.id}')">
            <div class="order-card-header">
                <span>#${order.id} - ${order.name}</span>
                <span class="order-time">${order.time || ''}</span>
            </div>
            <div style="font-size:13px; color:#ccc;">${order.address}</div>
            <div style="margin-top:5px; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#f5cd1c; font-weight:bold; font-size:15px;">${total.toFixed(2)}€</span>
                ${payBadge}
            </div>
        </div>`;
    });
    document.querySelector('.col-orders').innerHTML = html;
}

function selectOrder(id) {
    selectedOrderId = id;
    itemToChangeIndex = null;
    showOrderDetails(id);
    renderWebOrders();
}

// 4. ΕΜΦΑΝΙΣΗ ΑΝΑΛΥΣΗΣ ΠΑΡΑΓΓΕΛΙΑΣ (ΜΕΣΗ)
function showOrderDetails(id) {
    let order = webOrders.find(o => o.id == id);
    if(!order) {
        document.querySelector('.customer-info-box').innerHTML = '<h3>📋 Στοιχεία Τρέχουσας Παραγγελίας</h3>';
        document.querySelector('.items-box').innerHTML = '<h3>🛒 Προϊόντα</h3>';
        return;
    }

    let payColor = order.payment === "ΚΑΡΤΑ" ? "#007bff" : (order.payment === "ONLINE" ? "#6f42c1" : "#28a745");

    let infoHtml = `
        <h3>👤 Στοιχεία Παράδοσης</h3>
        <div class="info-line"><b>Όνομα:</b> ${order.name} | <b>Τηλ:</b> ${order.phone}</div>
        <div class="info-line"><b>Διεύθυνση:</b> ${order.address} ${order.floor ? `(${order.floor})` : ''}</div>
        <div class="info-line" style="background:${payColor}; color:white; padding:5px; border-radius:4px; margin-top:5px; display:inline-block; font-weight:bold;">💰 ΤΡΟΠΟΣ ΠΛΗΡΩΜΗΣ: ${order.payment}</div>
        ${order.notes ? `<div class="info-line" style="color:#ff5555; font-weight:bold; margin-top:5px;">⚠️ Σχόλια: ${order.notes}</div>` : ''}
    `;
    document.querySelector('.customer-info-box').innerHTML = infoHtml;

    let itemsHtml = `<h3>🛒 Προϊόντα (Πατήστε πάνω για Αλλαγή/Αντικατάσταση)</h3>`;
    order.items.forEach((item, index) => {
        let isChanging = itemToChangeIndex === index ? 'style="background:#2c2c2c; border:1px dashed #ffc107;"' : '';
        itemsHtml += `
        <div class="item-row" ${isChanging} onclick="startReplacement(${index}, '${item.category || ''}')">
            <div>
                <b>${item.q} x</b> ${item.n} <span class="badge-change">✏️ ΑΛΛΑΓΗ</span>
                ${item.ex ? `<span class="item-extras">${item.ex}</span>` : ''}
            </div>
            <div style="display:flex; align-items:center;">
                <button onclick="removeItem(${index}, event)" style="background:none; border:none; color:#ff5555; font-size:20px; font-weight:bold; cursor:pointer; padding:0 15px;">✖</button>
                <div style="font-weight:bold;"> ${(parseFloat(item.p) * parseInt(item.q)).toFixed(2)}€</div>
            </div>
        </div>`;
    });
    document.querySelector('.items-box').innerHTML = itemsHtml;
}

// 5. ΚΟΥΜΠΙ: ΑΠΟΔΟΧΗ & ΕΚΤΥΠΩΣΗ (ΣΤΕΛΝΕΙ STATUS "ACCEPTED" ΣΤΟ SITE)
async function acceptAndPrintOrder() {
    if (!selectedOrderId) return alert("Δεν έχετε επιλέξει παραγγελία!");
    let order = webOrders.find(o => o.id == selectedOrderId);
    
    try {
        // 1. Ενημερώνουμε το site ότι την πήραμε (για να μην την ξαναφέρει το POS)
        let response = await fetch(`sync.php?action=update_status&id=${selectedOrderId}&status=accepted`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: order.items }) // Στέλνουμε και τα προϊόντα αν έγιναν αλλαγές
        });
        
        let result = await response.json();
        
        if (result.success) {
            // 2. Εδώ καλούμε την εκτύπωση της κουζίνας
            printWebOrderToKitchen(order);
            
            // Καθαρίζουμε την οθόνη και πάμε στην επόμενη
            webOrders = webOrders.filter(o => o.id != selectedOrderId);
            selectedOrderId = webOrders.length > 0 ? webOrders[0].id : null;
            itemToChangeIndex = null;
            renderWebOrders();
            showOrderDetails(selectedOrderId);
        } else {
            alert("Δεν μπόρεσε να γίνει η αποδοχή στο site: " + result.message);
        }
    } catch (e) {
        console.error(e);
        alert("Σφάλμα επικοινωνίας με το sync.php");
    }
}

// 6. ΚΟΥΜΠΙ: ΑΠΟΡΡΙΨΗ ΠΑΡΑΓΓΕΛΙΑΣ
async function rejectOrder() {
    if (!selectedOrderId) return;
    let reason = prompt("Γράψτε τον λόγο απόρριψης (π.χ. Λόγω φόρτου εργασίας, Έλλειψη διανομέα):");
    if (reason === null) return; // Ακύρωση πατήματος

    try {
        let response = await fetch(`sync.php?action=update_status&id=${selectedOrderId}&status=rejected&reason=${encodeURIComponent(reason)}`);
        let result = await response.json();
        if (result.success) {
            alert("Η παραγγελία απορρίφθηκε και ο πελάτης ενημερώθηκε.");
            webOrders = webOrders.filter(o => o.id != selectedOrderId);
            selectedOrderId = webOrders.length > 0 ? webOrders[0].id : null;
            renderWebOrders();
            showOrderDetails(selectedOrderId);
        }
    } catch(e) { alert("Σφάλμα κατά την απόρριψη."); }
}

// 7. ΕΚΤΥΠΩΣΗ ΣΤΗΝ ΚΟΥΖΙΝΑ (Ακολουθεί τις ρυθμίσεις του POS σου)
function printWebOrderToKitchen(order) {
    const saved = JSON.parse(localStorage.getItem('gbr_ui_settings') || "{}");
    const printFS = saved['--print-font-size'] || '22px'; 
    const copies = parseInt(saved['--print-copies']) || 2; 

    let receiptBody = `<html><body style="font-family:Arial; width:80mm; padding:0; margin:0; font-size:${printFS}; font-weight:bold;">`;
    receiptBody += `<br><br><center><h2>🌐 ONLINE DELIVERY</h2><h1 style="background:#000; color:#fff; padding:5px;">#${order.id}</h1></center><br>`;
    receiptBody += `<b>ΠΕΛΑΤΗΣ:</b> ${order.name}<br>`;
    receiptBody += `<b>ΤΗΛΕΦΩΝΟ:</b> ${order.phone}<br>`;
    receiptBody += `<b>ΔΙΕΥΘΥΝΣΗ:</b> ${order.address}<br>`;
    if(order.floor) receiptBody += `<b>ΟΡΟΦΟΣ:</b> ${order.floor}<br>`;
    receiptBody += `<span style="font-size:26px; border:2px solid #000; padding:3px; display:block; text-align:center; margin:10px 0;">💰 ΠΛΗΡΩΜΗΣ: ${order.payment}</span>`;
    
    if(order.notes) {
        receiptBody += `<br><div style="background:#eee; padding:5px;"><b>ΣΧΟΛΙΑ:</b> ${order.notes}</div>`;
    }
    
    receiptBody += `<br><hr><br>`;
    order.items.forEach(item => {
        receiptBody += `<div style="padding:5px 0;">${item.q} x ${item.n}</div>`;
        if(item.ex) receiptBody += `<div style="font-size:16px; color:#555; margin-left:15px;">${item.ex}</div>`;
    });

    receiptBody += `<br><br><br><br><br><br></body></html>`;

    // Εκτύπωση σε ξεχωριστά αντίγραφα για να κόβει το μαχαίρι!
    for (let i = 0; i < copies; i++) {
        const win = window.open('', '', 'width=600,height=800');
        win.document.write(receiptBody);
        win.document.write(`<script>window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); };<\/script>`);
        win.document.close();
    }
}

// 8. ΜΗΧΑΝΙΣΜΟΣ ΑΛΛΑΓΗΣ ΠΡΟΪΟΝΤΩΝ (ΑΠΟ ΤΟ ΠΡΟΗΓΟΥΜΕΝΟ ΒΗΜΑ)
function loadMenuCategories() {
    const cats = [...new Set(products.map(p => p.category))];
    let html = '';
    cats.forEach((cat, index) => {
        let activeClass = index === 0 ? 'active' : '';
        html += `<button class="btn-menu-cat ${activeClass}" onclick="loadMenuProducts('${cat}', this)">${cat}</button>`;
    });
    document.querySelector('.menu-cats-grid').innerHTML = html;
    if(cats.length > 0) loadMenuProducts(cats[0]);
}

function loadMenuProducts(category, element = null) {
    if(element) {
        document.querySelectorAll('.btn-menu-cat').forEach(b => b.classList.remove('active'));
        element.classList.add('active');
    }
    let filtered = products.filter(p => p.category === category);
    let html = '';
    filtered.forEach(p => {
        html += `<button class="btn-menu-prod" onclick="selectProductForReplacement('${p.name}', ${p.price})">${p.name} <span>${parseFloat(p.price).toFixed(2)}€</span></button>`;
    });
    document.querySelector('.menu-products-list').innerHTML = html;
}

function startReplacement(index, category) {
    itemToChangeIndex = index;
    showOrderDetails(selectedOrderId);
    let catButtons = document.querySelectorAll('.btn-menu-cat');
    catButtons.forEach(btn => {
        if(btn.innerText.trim() === category.trim()) loadMenuProducts(category, btn);
    });
}

function selectProductForReplacement(newName, newPrice) {
    if(itemToChangeIndex === null) return alert("Επιλέξτε προϊόν για αλλαγή στη μέση!");
    let order = webOrders.find(o => o.id == selectedOrderId);
    let oldItem = order.items[itemToChangeIndex];
    if(!confirm(`Αλλαγή "${oldItem.n}" σε "${newName}";`)) return;

    oldItem.n = newName;
    oldItem.p = parseFloat(newPrice);
    oldItem.ex = "(Αντικαταστάθηκε)";
    itemToChangeIndex = null;
    renderWebOrders();
    showOrderDetails(selectedOrderId);
}

function removeItem(index, event) {
    event.stopPropagation();
    let order = webOrders.find(o => o.id == selectedOrderId);
    if(confirm(`Διαγραφή του "${order.items[index].n}";`)) {
        order.items.splice(index, 1);
        itemToChangeIndex = null;
        renderWebOrders();
        showOrderDetails(selectedOrderId);
    }
}
// 1. 🗂️ Η λίστα με όλους τους δρόμους των Σερρών από το αρχείο σου
const serresStreets = [
    "19ης Μαΐου", "20ης Σεπτεμβρίου", "29ης Ιουνίου 1913", "3ου Συντάγματος Ιππικού", "8ης Μαΐου 1821", 
    "Αβδήρων", "Αβύδου", "Αγαθουπόλεως", "Αγησιλάου", "Αμυγδαλεών", "Αμύντα", "Αμφιπόλεως", "Αγίας Σοφίας", 
    "Αγίου Αντωνίου", "Αγίου Γεωργίου", "Αγίου Μοδέστου", "Αγίου Παντελεήμονα", "Αγίου Σπυρίδωνος", 
    "Αγίων Αναργύρων", "Αγκίστρου", "Αδάμ Ευθαλίας", "Αδραμυττίου", "Αδριανουπόλεως", "Αθανασίου", 
    "Αθηνάς", "Αιακού", "Αίαντος", "Αϊδινίου", "Αίνου", "Αισώπου", "Ακρίτα Διγενή", "Ακροπόλεως", 
    "Αλατά Φωτ.", "Αλεξανδρίδη Κοσμά", "Αλεξάνδρου Β.", "Αναξαγόρα", "Αναπαύσεως", "Αναστασίου Στεφάνου", 
    "Ανατολικής Θράκης", "Ανδρόνικου Μανόλη", "Άνδρου", "Ανδρούτσου Οδυσσέα", "Ανθέων", 
    "Αντισυνταγματάρχη Κατσάνη", "Απαμείας", "Απολλωνιάδος", "Αποστολίδη Ιωάννη", "Αργυρού Αθανασίου", 
    "Αργυρού Ουμβέρτου", "Αριστοτέλους", "Αριστοφάνους", "Αρκαδιουπόλεως", "Αρματωλών", "Αρτάκη", 
    "Αρχελάου", "Αρχιεπισκόπου Μακάριου", "Ασκανίας", "Ασκληπιού", "Αχαιών", "Αχιλλέως", 
    "Βαλαωρίτου Αριστοτέλους", "Βαλτετσίου", "Βάρναλη Κώστα", "Βασιλέως Βασιλείου", "Βελισσαρίου", 
    "Βενιζέλου Ελευθέριου", "Βέροιας", "Βερώνης", "Βιζυηνού Γεώργιου", "Βιζύης", "Βιθυνίας", 
    "Βικέλα", "Βίρχανλη", "Βόλου", "Βοσπόρου", "Βουλασίκη Θ.", "Βούρλων", "Βύρωνος", "Γαλδέμη Αναστάσιου", 
    "Γαληνού", "Γενναδίου", "Γερμανού Πατρών", "Γιαννιτσών", "Γκένιου", "Γλύπτη Μύρωνος", "Γράμμου", 
    "Γρανικού", "Δαγκλή", "Δέκατης Μεραρχίας, Λεωφόρος", "Δελαπόρτα", "Δελφών", "Δερβενακίων", 
    "Δευκαλίωνος", "Δήλου", "Δημάρχου Τρικοπούλου", "Δημητρίου Ανδρέα", "Δημογερόντων", "Δημοκρίτου", 
    "Δημοσθένους", "Διάκου Αθανασίου", "Διαλέττη", "Διομήδους", "Δογάνη", "Δορυλαίου", "Δραβήσκου", 
    "Δραγατσανίου", "Δραγούμη Ίωνος", "Δυτικής Θράκης", "Εδέσσης", "Εθνικής Αντιστάσεως", 
    "Εκτελεσθέντων Κερδυλιωτών", "Εξοχών", "Ερμού", "Ερυθρού Σταυρού", "Ετεοκλέους", "Ευζώνων", 
    "Ευκλείδου", "Εφέντη Τάκη", "Εφέσου", "Εφόρων", "Ζητουνιάτη", "Ζλάτκου Γεώργιου", "Ηρακλείας", 
    "Ηρακλείου", "Ηροδότου", "Ησιόδου", "Ηφαίστου", "Θάλειας", "Θάσου", "Θέμιδος", "Θεοκρίτου", 
    "Θεοφάνους Δημ.", "Θερμοπυλών", "Θεσσαλονίκης", "Θηβών", "Θήρας", "Θουκυδίδου", 
    "Ιερέα Παπακωνσταντίνου", "Ιερολοχιτών", "Ιθάκης", "Ικονίου", "Ικτίνου", "Ιντζέ Νικολάου", 
    "Ιουστινιανού", "Ιπποκράτους", "Ιωάννη του Θεολόγου", "Καβάφη Κωνσταντίνου", 
    "Καθηγητή Ιωακειμίδη Σάββα", "Καθηγητή Χριστομάνου", "Καισαρείας", "Καλαμπάκας", "Κάλβου Ανδρέα", 
    "Κάλλας Μαρίας", "Καλλιπάτειρας", "Καλόγερου Σαμουήλ", "Καναβού", "Κανάκη Παναγιώτη", 
    "Κανάρη Κωνσταντίνου", "Καπετάν Άγρα", "Καπετάν Μητρούση", "Καποδίστρια Ιωάννη", "Καραγιαννοπούλου", 
    "Καραϊσκάκη Γεώργιου", "Καραολή Μιχαλάκη", "Καρατάσου", "Καρκαβίτσα Ανδρέα", "Καρυωτάκη Κώστα", 
    "Κασομούλη Νικολάου", "Καστελλόριζου", "Κατσιμίδη", "Καφταντζή Γεώργιου", "Κέας", "Κερασούντος", 
    "Κερκύρας", "Κεφαλληνίας", "Κεχαγιά", "Κιθαιρώνος", "Κιλκίς", "Κίου", "Κιουταχείας", "Κισσάβου", 
    "Κοζάνης", "Κολοκοτρώνη Θεόδωρου", "Κομνηνού Αλέξιου", "Κομνηνού Θ.", "Κομνηνών", "Κοντοδήμου Θεοδ.", 
    "Κοραή", "Κορίνθου", "Κορομηλά Α.", "Κούλα Νάκη", "Κουντουριώτου", "Κουρέως Στεργ.", "Κούση Λαζάρου", 
    "Κρέσνας", "Κρήτης", "Κρυστάλλη", "Κυδωνιών", "Κυζίκου", "Κυθήρων", "Κύπρου", "Κωνσταντινουπόλεως", 
    "Κωστή", "Κωστόπουλου Περιστέρη", "Λαμπράκη Γρηγορίου", "Λαμψάκου", "Λαχανά", "Λέσβου", "Λευκάδος", 
    "Λεωφόρος Δέκατης Μεραρχίας", "Λήθης", "Λομβάρδου", "Λυμπέρη", "Λυσάνδρου", "Μαβίλη", "Μαγνησίας", 
    "Μαιάνδρου", "Μακεδονικού Αγώνα", "Μακεδονομάχων", "Μακέστου", "Μακρή Ιππ.", "Δημητρίου Μαρούλη", 
    "Μαυρογένους Μαντούς", "Μαυροκορδάτου", "Μαυρομιχάλη", "Μεγάλου Αλεξάνδρου", "Μελά Παύλου", 
    "Μενελάου", "Μεσολογγίου", "Μητροπολίτη Αποστόλου", "Μητροπολίτη Κωνσταντίνου", "Μιαούλη", 
    "Μικράς Ασίας", "Μνησικλέους", "Μοναστηρίου", "Μοσχοπόλεως", "Μουδανιών", "Μουστακλή Σπύρου", 
    "Μουσών", "Μπαλτά", "Μπεκιάρη Αθαν.", "Μπιζανίου", "Μπότσαρη Μάρκου", "Μπουμπουλίνας", "Μυκόνου", 
    "Ναούσης", "Ναυαρίνου", "Ναύαρχου Βότση Νικολάου", "Ναύαρχου Σαχτούρη", "Ναυπάκτου", "Ναυπλίου", 
    "Νέας Ζίχνης", "Νέστου", "Νιγρίτης", "Νικολάου Νικ.", "Νικομηδείας", "Νικοπόλεως", "Νικοτσάρα", 
    "Ξάνθου Εμμανουήλ", "Ξενόπουλου Γρηγορίου", "Ξενοφώντος", "Οδυσσέως", "Ολυμπιάδος", "Ολύμπου", 
    "Ομήρου", "Ομογενών Οδησσού", "Ομονοίας", "Οπλαρχηγού Δούκα", "Ορεινού Ιακώβου", "Ορεστιάδος", 
    "Ορφέως", "Ουζούνη Μιχ.", "Παγγαίου", "Παλαιολόγου Κωνσταντίνου", "Παλαμά Κωστή", "Παναγούλη Αλέκου", 
    "Πανόρμου", "Παπαβασιλείου Χ.", "Παπαγεωργίου", "Παπαδημητρίου Φωτ.", "Παπαδιαμάντη Αλεξάνδρου", 
    "Παπαδόπουλου Τηλ.", "Παπάζογλου", "Παπακυριαζή", "Παπακωνσταντίνου", "Πανανδρέου Γεώργιου", 
    "Παπανικολάου", "Παπαπαύλου Λεωνίδα", "Παπαστεφάνου Βασ.", "Παπαφλέσσα", "Παπαφωτίου", 
    "Παππά Εμμανουήλ", "Πάργας", "Παρμενίδου", "Πατριάρχη Γρηγορίου Ε΄", "Πατριάρχη Ιωακείμ", 
    "Πατρών", "Παυσανία", "Πέλλας", "Πέννα Πέτρου", "Περγάμου", "Περδίκα", "Περιφερειακή Οδός Σερρών", 
    "Πευκακίων", "Πινδάρου", "Πίνδου", "Πιπίνου Ανδρέα", "Πιττακού", "Πλαταιών", "Πλάτωνος", 
    "Πολέμη Ιωάννη", "Πολύβιου", "Πολυζωίδη", "Πολυτεχνείου", "Πόντου", "Πραξιτέλους", "Πρέβεζας", 
    "Προικονήσου", "Προμηθέα", "Προύσης", "Προφήτη Ηλία", "Πτολεμαίων", "Πυθαγόρα", "Πύρρου", 
    "Ραιδεστού", "Ρακιτζή Γρηγορίου", "Ραφαήλ Ν.", "Ραφτούδη", "Ρούπελ", "Ρωμανού", "Σαγγαρίου", 
    "Σαλαμίνος", "Σαμοθράκης", "Σαράντα Εκκλησιών", "Σαρανταπόρου", "Σεβαστείας", "Σελεύκου", 
    "Σεφέρη", "Σιγής", "Σιδηροκάστρου", "Σινώπης", "Σισύφου", "Σκρα", "Σολωμού Διονυσίου", "Σπάρτης", 
    "Σπετσών", "Σπυρίδη Δημητρίου", "Σταγείρων", "Σταμούλη Κωνσταντίνου", "Στράτη Ευάγγελου", 
    "Στρατηγού Μακρυγιάννη Ιωάννη", "Στρατηγού Πλαστήρα Νικολάου", "Στρυμόνος", 
    "Συνταγματάρχη Δαβάκη Κωνσταντίνου", "Σύρου", "Σωκράτη", "Ταγματάρχη Βολάνη", "Τερτσέτη Γεώργιου", 
    "Τερψιχόρης", "Τζαβέλλα", "Τήνου", "Τουρλεντέ Θεόδωρου", "Τραπεζούντος", "Τριανταφυλλίδη Μανόλη", 
    "Τριανταφυλλίδου Άννας", "Τριγλίας", "Τρικούπη Χαριλάου", "Τροίας", "Τσακάλωφ Αθανασίου", 
    "Τσαλδάρη Παναγή", "Τσαλόπουλου Γ.", "Τσαμαδού", "Τσιμισκή Ιωάννη", "Ύδρας", "Υπατίας", 
    "Υψηλάντου", "Φειδίου", "Φεραίου Ρήγα", "Φιλικής Εταιρείας", "Φιλίππου", "Φιτσιώρη Νικ.", 
    "Φλέμινγκ", "Φλωριά Δημοσθένη", "Φλωρίνης", "Φυλακτού Αθανασίου", "Φωκά Νικηφόρου", "Χαιρωνείας", 
    "Χατζηιακώβου", "Χατζηπανταζή Αθ.", "Χατζοπούλου", "Χίου", "Χρυσάφη Αναστάσιου", 
    "Χρυσοστόμου Σμύρνης", "Ψαρών"
];

// 2. 🔍 Ψάχνει real-time καθώς γράφεις
function searchStreet(value) {
    let box = document.getElementById('street-suggestions');
    if (!value || value.trim().length < 2) {
        box.style.display = 'none';
        return;
    }

    let searchTxt = value.toUpperCase().trim();
    let matches = serresStreets.filter(s => s.toUpperCase().includes(searchTxt));

    if (matches.length === 0) {
        box.style.display = 'none';
        return;
    }

    let html = '';
    matches.slice(0, 5).forEach(street => { // Εμφανίζει 5 προτάσεις για να μην κρύβει την οθόνη
        html += `
        <div onclick="selectStreet('${street}')" style="padding: 12px; color: #fff; background: #111; cursor: pointer; border-bottom: 1px solid #333; font-size: 15px; font-weight: bold;" 
             onmouseover="this.style.background='#333'" onmouseout="this.style.background='#111'">
             📍 ${street}
        </div>`;
    });

    box.innerHTML = html;
    box.style.display = 'block';
}

// 3. 🎯 Όταν πατάς τον δρόμο, τον βάζει στο δικό σου input (delAddress)
function selectStreet(street) {
    let input = document.getElementById('delAddress'); // Εδώ στοχεύει το δικό σου input!
    input.value = street + " "; 
    document.getElementById('street-suggestions').style.display = 'none';
    input.focus(); 
}