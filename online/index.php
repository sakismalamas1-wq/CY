<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ρωξάνη - Online Delivery</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <header class="site-header">
        <img src="../images/logo.png" alt="Ρωξάνη Logo" class="logo" onerror="this.style.display='none'">
        <h1>ΡΩΞΑΝΗ</h1>
        <p>Φρέσκο & Ποιοτικό Φαγητό</p>
    </header>

    <main class="container">
        <!-- Εδώ θα εμφανίζονται οι κατηγορίες -->
        <nav id="categories-nav" class="categories-bar"></nav>

        <!-- Εδώ θα φορτώνουν τα προϊόντα -->
        <div id="products-list" class="products-grid"></div>
    </main>

    <!-- Το Καλάθι που ακολουθεί τον χρήστη -->
    <div id="cart-footer" class="cart-footer" onclick="openCartModal()">
        <div class="cart-info">
            <span id="cart-count">0</span> είδη - <span id="cart-total">0.00</span>€
        </div>
        <button class="view-cart-btn">ΠΡΟΒΟΛΗ ΚΑΛΑΘΙΟΥ</button>
    </div>

    <!-- Script για να τραβήξουμε τα δεδομένα από το POS -->
    <script>
        let allProducts = [];
        let cart = [];

async function initSite() {
    try {
        // Διαβάζουμε το αρχείο backup που ξέρουμε ότι υπάρχει
        const response = await fetch('../roxani_backup.json?v=' + Date.now());
        
        if (!response.ok) {
            throw new Error("Δεν βρέθηκε το αρχείο roxani_backup.json");
        }

        const backupData = await response.json();
        
        // Το backup έχει τα προϊόντα μέσα στο κλειδί "products"
        // Αν το backup σου έχει άλλη δομή, θα το βρούμε εδώ:
        allProducts = backupData.products || [];

        console.log("Φορτώθηκαν " + allProducts.length + " προϊόντα από το backup.");

        if (allProducts.length > 0) {
            renderCategories();
        } else {
            document.getElementById('products-list').innerHTML = "Το backup δεν περιέχει προϊόντα.";
        }
    } catch (e) {
        console.error("Σφάλμα:", e);
        document.getElementById('products-list').innerHTML = "Πρόβλημα στη φόρτωση του μενού από το backup.";
    }
}

        function renderCategories() {
            const nav = document.getElementById('categories-nav');
            // Παίρνουμε τις μοναδικές κατηγορίες[cite: 1]
            const cats = [...new Set(allProducts.map(p => p.category))];
            
            nav.innerHTML = cats.map(c => `
                <button class="cat-pill" onclick="filterCategory('${c}')">${c}</button>
            `).join('');

            if(cats.length > 0) filterCategory(cats[0]);
        }

        function filterCategory(cat) {
            const list = document.getElementById('products-list');
            const filtered = allProducts.filter(p => p.category === cat);
            
            list.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <div class="prod-img" style="background-image: url('../images_food/${p.name.split('\n')[0].trim()}.png'), url('../images/no-photo.png')"></div>
                    <div class="prod-info">
                        <h3>${p.name}</h3>
                        <p class="price">${p.price.toFixed(2)}€</p>
                        <button class="add-to-cart" onclick="addToCart('${p.name}', ${p.price})">ΠΡΟΣΘΗΚΗ</button>
                    </div>
                </div>
            `).join('');
        }

        // Οι υπόλοιπες λειτουργίες θα μπούν στο cart.js
        initSite();
    </script>
    <script src="cart.js"></script>
</body>
</html>