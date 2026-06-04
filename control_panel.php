<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔒 Advanced Control Panel</title>
    <style>
        /* Dark Mode & Neon Color Palette */
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #0e0e0e; 
            color: #e0e0e0; 
            margin: 0; 
            padding: 20px; 
            padding-top: 70px; 
        }
        
        h1, h2, h3 { margin: 0 0 10px 0; font-weight: 600; }
        h1 { color: #ff9f43; text-shadow: 0 0 10px rgba(255, 159, 67, 0.3); }
        h2 { color: #08f8f4; border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 1.2rem; }
        
        /* Σταθερό Κουμπί Επιστροφής */
        .btn-back-pos { 
            position: fixed; 
            top: 15px; 
            left: 15px; 
            background: linear-gradient(135px, #ff4d4d, #ff0055); 
            color: #333; 
            border: none; 
            padding: 10px 20px; 
            font-size: 14px; 
            font-weight: bold; 
            border-radius: 6px; 
            cursor: pointer; 
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(255, 0, 85, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-back-pos:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 0, 85, 0.6);
        }

        /* Header */
        .header-panel { 
            text-align: center; 
            background: #1a1a1a; 
            padding: 20px; 
            border-radius: 12px; 
            border: 1px solid #ff9f43;
            box-shadow: 0 4px 20px rgba(255, 159, 67, 0.15); 
            margin-bottom: 25px; 
        }
        .header-panel p { color: #1dd1a1; font-weight: bold; font-size: 1.1rem; margin: 5px 0 0 0; }

        /* Grid layout */
        .container { display: flex; gap: 20px; flex-wrap: wrap; }
        .box { 
            background: #161616; 
            padding: 20px; 
            border-radius: 12px; 
            border: 1px solid #2d2d2d;
            box-shadow: 0 8px 16px rgba(0,0,0,0.5); 
            flex: 1; 
            min-width: 320px; 
            transition: border-color 0.3s;
        }
        .box:hover { border-color: #54a0ff; }
        .full-width { flex: 1 1 100%; }
        
        /* Χρωματικά Θέματα για Boxes */
        .box.orange-theme { border-top: 4px solid #ff9f43; }
        .box.blue-theme { border-top: 4px solid #54a0ff; }
        .box.red-theme { border-top: 4px solid #ff6b6b; }
        .box.yellow-theme { border-top: 4px solid #feca57; }

        /* Πίνακες */
        table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #1e1e1e; border-radius: 8px; overflow: hidden; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #2d2d2d; }
        th { background: #2d2d2d; color: rgb(245, 241, 11); font-weight: bold; }
        tr:hover { background: #252525; }
        
        /* Φόρμες και Inputs */
        .form-group { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
        .form-group input, .form-group select { 
            padding: 12px; 
            background: #ede6e6; 
            border: 1px solid #444; 
            border-radius: 6px; 
            color: #343232;
            flex: 1; 
            min-width: 140px; 
            font-size: 14px; 
        }
        .form-group input:focus, .form-group select:focus {
            border-color: #fbcb09;
            outline: none;
            box-shadow: 0 0 8px rgba(84, 160, 255, 0.5);
        }
        
        /* Κουμπιά */
        .btn {
            padding: 12px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-blue { background: #54a0ff; color: #fff; }
        .btn-blue:hover { background: #2e86de; box-shadow: 0 0 10px rgba(84,160,255,0.4); }
        .btn-orange { background: #ff9f43; color: #fff; }
        .btn-orange:hover { background: #ee5a24; box-shadow: 0 0 10px rgba(255,159,67,0.4); }
        .btn-red { background: #ff6b6b; color: #fff; padding: 6px 12px; font-size: 12px; }
        .btn-red:hover { background: #ee5253; }
        .btn-print { background: #1dd1a1; color: #000; font-size: 16px; padding: 15px 30px; border-radius: 30px; box-shadow: 0 4px 15px rgba(29,209,161,0.4); margin-top: 25px;}
        .btn-print:hover { background: #10ac84; transform: scale(1.05); }
        
        /* Badges */
        .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block; }
        .badge-danger { background: rgba(255, 107, 107, 0.2); color: #ff6b6b; border: 1px solid #ff6b6b; }
        .badge-warning { background: rgba(254, 202, 87, 0.2); color: #feca57; border: 1px solid #feca57; }
        .badge-success { background: rgba(29, 209, 161, 0.2); color: #1dd1a1; border: 1px solid #1dd1a1; }
        
        .qty { font-weight: bold; color: #feca57; }
        
        @media print {
            .no-print { display: none !important; }
            body { background: white; color: black; padding: 0; }
            .box { box-shadow: none; border: 1px solid #ddd; background: white; color: black; }
            th { background: #ddd; color: black; }
        }
    </style>
</head>
<body>

    <!-- Κουμπί με το λουκέτο επιστροφής -->
    <button class="btn-back-pos no-print" onclick="window.close()">🔒 Επιστροφή στο POS</button>

    <div class="header-panel">
        <h1>🔒 ΣΤΑΤΙΣΤΙΚΑ ΠΩΛΗΣΕΩΝ, ΣΤΟΚ & ΜΕΝΟΥ</h1>
        <p id="liveTime"></p>
    </div>
    
    <div class="container">
        
        <!-- ΚΟΥΤΙ 1: ΔΙΑΧΕΙΡΙΣΗ ΜΕΝΟΥ ΠΙΑΤΩΝ (Πορτοκαλί) -->
        <div class="box full-width orange-theme no-print">
            <h2>🍽️ Διαχείριση Μενού (Φόρτωση / Προσθήκη Πιάτων)</h2>
            <div class="form-group">
                <input type="text" id="menuName" placeholder="Όνομα Πιάτου (π.χ. Μουσακάς)">
                <input type="number" id="menuPrice" step="0.1" placeholder="Τιμή Πώλησης (€)">
                <select id="menuCat">
                    <option value="Κυρίως">Κυρίως Πιάτα</option>
                    <option value="Ορεκτικά">Ορεκτικά</option>
                    <option value="Σαλάτες">Σαλάτες</option>
                    <option value="Αναψυκτικά">Αναψυκτικά / Ποτά</option>
                </select>
                <button class="btn btn-orange" onclick="addMenuItem()">➕ Προσθήκη στο Μενού</button>
            </div>
            
            <h3>📋 Τρέχον Μενού Καταστήματος</h3>
            <table>
                <thead>
                    <tr>
                        <th>Πιάτο</th>
                        <th>Κατηγορία</th>
                        <th>Τιμή (€)</th>
                        <th>Ενέργεια</th>
                    </tr>
                </thead>
                <tbody id="menuTableBody">
                    <!-- Γεμίζει αυτόματα με JS -->
                </tbody>
            </table>
        </div>

        <!-- ΚΟΥΤΙ 2: ΚΑΤΑΧΩΡΗΣΗ ΠΡΩΤΩΝ ΥΛΩΝ (Μπλε) -->
        <div class="box full-width blue-theme no-print">
            <h2>🛒 Καταχώρηση Υλικών & Στοκ Αποθήκης (Λάδι, Κρέατα κτλ)</h2>
            <div class="form-group">
                <input type="text" id="ingName" placeholder="Όνομα Υλικού (π.χ. Ντομάτες)">
                <input type="number" id="ingStock" placeholder="Τρέχον Στοκ (Ποσότητα)">
                <input type="number" id="ingLimit" placeholder="Όριο Ασφαλείας">
                <input type="text" id="ingUnit" placeholder="Μονάδα (π.χ. Κιλά, Λίτρα)">
                <button class="btn btn-blue" onclick="addIngredient()">➕ Προσθήκη Υλικού</button>
            </div>
        </div>

        <!-- ΚΟΥΤΙ 3: ΔΗΜΟΦΙΛΗ ΠΙΑΤΑ / ΠΩΛΗΣΕΙΣ (Κίτρινο) -->
        <div class="box yellow-theme">
            <h2>🏆 Δημοφιλή Πιάτα & Πωλήσεις (Σήμερα)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Πιάτο</th>
                        <th>Μερίδες</th>
                        <th>Έσοδα</th>
                    </tr>
                </thead>
                <tbody id="salesTableBody">
                    <!-- Γεμίζει αυτόματα -->
                </tbody>
            </table>
        </div>
        
        <!-- ΚΟΥΤΙ 4: ΛΙΣΤΑ ΑΓΟΡΩΝ / ΕΛΛΕΙΨΕΙΣ (Κόκκινο) -->
        <div class="box red-theme">
            <h2>📋 Λίστα Αγορών & Ελλείψεις Αποθήκης</h2>
            <table>
                <thead>
                    <tr>
                        <th>Υλικό</th>
                        <th>Διαθέσιμο Στοκ</th>
                        <th>Κατάσταση</th>
                    </tr>
                </thead>
                <tbody id="ingredientsTableBody">
                    <!-- Γεμίζει αυτόματα -->
                </tbody>
            </table>
        </div>
        
    </div>
    
    <center class="no-print">
        <button class="btn btn-print" onclick="window.print()">🖨️ Εκτύπωση Λίστας Αγορών & Αναφοράς</button>
    </center>

    <script>
// Αρχικά Δειγματικά Δεδομένα Μενού
let menuItems = [
    { id: 1, name: "Μουσακάς", price: 9.50, cat: "Κυρίως" },
    { id: 2, name: "Τζατζίκι", price: 4.00, cat: "Ορεκτικά" },
    { id: 3, name: "Χωριάτικη", price: 6.50, cat: "Σαλάτες" }
];

// Αρχικά Δεδομένα Στοκ Υλικών
let ingredients = [
    { id: 1, name: "Λάδι", stock: 5, limit: 10, unit: "Λίτρα" },
    { id: 2, name: "Κρέας Μοσχάρι", stock: 15, limit: 8, unit: "Κιλά" },
    { id: 3, name: "Ντομάτες", stock: 2, limit: 5, unit: "Κιλά" }
];

// Αρχικά Δεδομένα Πωλήσεων (Συνδέονται με το Μενού)
let sales = [
    { name: "Μουσακάς", qty: 14, total: 133.00 },
    { name: "Χωριάτικη", qty: 22, total: 143.00 },
    { name: "Τζατζίκι", qty: 10, total: 40.00 }
];

// Εμφάνιση Ώρας
function updateTime() {
    const now = new Date();
    document.getElementById('liveTime').innerText = "📅 " + now.toLocaleString('el-GR');
}
setInterval(updateTime, 1000);
updateTime();

// ΣΥΝΑΡΤΗΣΕΙΣ ΜΕΝΟΥ
function renderMenu() {
    const tbody = document.getElementById('menuTableBody');
    tbody.innerHTML = '';
    menuItems.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td style="font-weight:bold; color:#ff9f43;">${item.name}</td>
                <td><span class="badge badge-warning">${item.cat}</span></td>
                <td class="qty">${item.price.toFixed(2)}€</td>
                <td><button class="btn btn-red" onclick="deleteMenu(${index})">🗑️</button></td>
            </tr>
        `;
    });
}

function addMenuItem() {
    const name = document.getElementById('menuName').value;
    const price = parseFloat(document.getElementById('menuPrice').value);
    const cat = document.getElementById('menuCat').value;

    if (!name || isNaN(price)) { 
        alert('Παρακαλώ συμπληρώστε όνομα και τιμή!'); 
        return; 
    }

    menuItems.push({ id: Date.now(), name: name, price: price, cat: cat });
    
    // Προσομοίωση: Προσθέτουμε το νέο πιάτο και στις σημερινές πωλήσεις με 0 μερίδες
    sales.push({ name: name, qty: 0, total: 0.00 });
    
    renderMenu();
    renderSales();
    
    // Καθαρισμός inputs
    document.getElementById('menuName').value = '';
    document.getElementById('menuPrice').value = '';
}

function deleteMenu(index) {
    const itemName = menuItems[index].name;
    menuItems.splice(index, 1);
    sales = sales.filter(s => s.name !== itemName); // Αφαίρεση και από τις πωλήσεις
    renderMenu();
    renderSales();
}

// ΣΥΝΑΡΤΗΣΕΙΣ ΥΛΙΚΩΝ & ΣΤΟΚ
function renderIngredients() {
    const tbody = document.getElementById('ingredientsTableBody');
    tbody.innerHTML = '';
    ingredients.forEach((ing, index) => {
        let badge = '';
        if (ing.stock <= 0) {
            badge = `<span class="badge badge-danger">❌ ΕΞΑΝΤΛΗΘΗΚΕ</span>`;
        } else if (ing.stock <= ing.limit) {
            badge = `<span class="badge badge-warning">⚠️ ΧΑΜΗΛΟ ΣΤΟΚ</span>`;
        } else {
            badge = `<span class="badge badge-success">✔️ ΕΠΑΡΚΕΣ</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td style="font-weight:bold;">${ing.name}</td>
                <td><span class="qty">${ing.stock}</span> / ${ing.limit} ${ing.unit}</td>
                <td>${badge}</td>
            </tr>
        `;
    });
}

function addIngredient() {
    const name = document.getElementById('ingName').value;
    const stock = parseFloat(document.getElementById('ingStock').value);
    const limit = parseFloat(document.getElementById('ingLimit').value);
    const unit = document.getElementById('ingUnit').value || 'Τεμ';

    if (!name || isNaN(stock) || isNaN(limit)) { 
        alert('Συμπληρώστε όλα τα πεδία του υλικού!'); 
        return; 
    }

    ingredients.push({ id: Date.now(), name: name, stock: stock, limit: limit, unit: unit });
    renderIngredients();

    document.getElementById('ingName').value = '';
    document.getElementById('ingStock').value = '';
    document.getElementById('ingLimit').value = '';
    document.getElementById('ingUnit').value = '';
}

// ΣΥΝΑΡΤΗΣΗ ΕΜΦΑΝΙΣΗΣ ΠΩΛΗΣΕΩΝ
function renderSales() {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';
    
    // Ταξινόμηση ώστε τα πιο δημοφιλή (μεγαλύτερη ποσότητα) να βγαίνουν πρώτα
    sales.sort((a, b) => b.qty - a.qty);
    
    sales.forEach(sale => {
        tbody.innerHTML += `
            <tr>
                <td style="color:#feca57; font-weight:bold;">${sale.name}</td>
                <td class="qty">${sale.qty}</td>
                <td style="color:#1dd1a1; font-weight:bold;">${sale.total.toFixed(2)}€</td>
            </tr>
        `;
    });
}

// Αρχικό Φόρτωμα όλων των πινάκων κατά την εκκίνηση
renderMenu();
renderIngredients();
renderSales();

