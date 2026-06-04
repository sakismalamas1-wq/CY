<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ρωξάνη - Online Παραγγελία</title>
    <link rel="stylesheet" href="web_style.css">
</head>
<body>

    <div id="promoModal" class="modal">
        <div class="modal-content">
            <span class="close-promo" onclick="closePromo()">&times;</span>
            <div id="promoDetails">
                <h2>🎁 ΠΡΟΣΦΟΡΑ ΗΜΕΡΑΣ!</h2>
                <p id="promoText">Φορτώνει προσφορές...</p>
                <button class="btn-promo-action" onclick="closePromo()">ΘΕΛΩ ΤΗΝ ΠΡΟΣΦΟΡΑ</button>
            </div>
        </div>
    </div>

    <header>
        <div class="logo">ΡΩΞΑΝΗ</div>
        <div class="status-indicator">
            <span id="shopStatus">🟢 Ανοιχτά</span>
        </div>
    </header>

    <nav id="webCategories"></nav>

    <main id="webMenu"></main>

    <div id="cartBar" onclick="openCheckout()">
        <div class="cart-info">
            <span id="cartCount">0</span> προϊόντα
        </div>
        <div class="cart-total">
            Σύνολο: <span id="cartTotal">0.00</span>€
        </div>
        <button class="btn-order">ΠΑΡΑΓΓΕΛΙΑ</button>
    </div>

    <div id="checkoutModal" class="modal">
        <div class="checkout-content">
            <h3>Η παραγγελία σας</h3>
            <div id="cartItems"></div>
            
            <div class="customer-info">
                <input type="text" id="custName" placeholder="Ονοματεπώνυμο" required>
                <input type="tel" id="custPhone" placeholder="Κινητό Τηλέφωνο" required>
                <input type="text" id="custAddr" placeholder="Διεύθυνση & Όροφος">
                <textarea id="custNotes" placeholder="Σχόλια (π.χ. κουδούνι, αλλεργίες)"></textarea>
                
                <div class="order-type">
                    <label><input type="radio" name="type" value="delivery" checked> Delivery</label>
                    <label><input type="radio" name="type" value="takeaway"> Takeaway</label>
                </div>
            </div>

            <div class="checkout-actions">
                <button class="btn-back" onclick="closeCheckout()">ΠΙΣΩ</button>
                <button class="btn-send" onclick="submitWebOrder()">ΑΠΟΣΤΟΛΗ ΠΑΡΑΓΓΕΛΙΑΣ</button>
            </div>
        </div>
    </div>

    <script src="web_app.js"></script>
</body>
</html>