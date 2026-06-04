<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <title>📊 Advanced Control Panel - ΡΩΞΑΝΗ</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f6f9; color: #333; margin: 0; padding: 20px; padding-top: 60px; /* Χώρος για το σταθερό κουμπί */ }
        h1 { color: #2c3e50; margin-bottom: 5px; }
        h2 { color: #2c3e50; border-bottom: 2px solid #34495e; padding-bottom: 10px; margin-top: 0; }
        
        /* Σταθερό Κουμπί Επιστροφής */
        .btn-back-pos { 
            position: fixed; 
            top: 15px; 
            left: 15px; 
            background: #2c3e50; 
            color: white; 
            border: none; 
            padding: 8px 15px; 
            font-size: 14px; 
            font-weight: bold; 
            border-radius: 4px; 
            cursor: pointer; 
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: background 0.2s;
        }
        .btn-back-pos:hover { background: #1a252f; }

        .header-panel { text-align: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .container { display: flex; gap: 20px; flex-wrap: wrap; }
        .box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); flex: 1; min-width: 320px; }
        .full-width { flex: 1 1 100%; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #34495e; color: white; }
        tr:hover { background: #f1f1f1; }
        
        /* Φόρμα */
        .form-group { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
        .form-group input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; flex: 1; min-width: 150px; font-size: 14px; }
        .btn-add { background: #2980b9; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .btn-add:hover { background: #2471a3; }
        .btn-delete { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
        
        .badge { padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block; }
        .badge-danger { background: #ff7675; color: #c0392b; }
        .badge-warning { background: #ffeaa7; color: #d35400; }
        .qty { font-weight: bold; color: #2980b9; font-size: 16px; }
        .total { font-weight: bold; color: #27ae60; font-size: 16px; }
        .btn-print { background: #27ae60; color: white; border: none; padding: 12px 25px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 20px; }
        
        @media print {
            .no-print { display: none !important; }
            body { background: white; padding: 0; }
            .box { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>

    <button class="btn-back-pos no-print" onclick="window.close()">⬅️ Επιστροφή στο POS</button>

    <div class="header-panel">
        <h1>📊 ΣΤΑΤΙΣΤΙΚΑ ΠΩΛΗΣΕΩΝ & ΔΙΑΧΕΙΡΙΣΗ ΑΓΟΡΩΝ</h1>
        <p id="liveTime"></p>
    </div>
    
    <div class="box full-width no-print" style="margin-bottom: 20px;">
        <h2>🛒 Καταχώρηση Υλικών & Προμηθειών (Λάδι, Κρέατα, Ντομάτες κτλ)</h2>
        <div class="form-group">
            <input type="text" id="ingName" placeholder="Όνομα Υλικού (π.χ. Λάδι, Ντομάτες)">
            <input type="number" id="ingStock" placeholder="Τρέχουσα Ποσότητα (π.χ. 5)">
            <input type="number" id="ingLimit" placeholder="Όριο Ασφαλείας (π.χ. 2)">
            <input type="text" id="ingUnit" placeholder="Μονάδα (π.χ. Κιλά, Λίτρα, Τεμ)">
            <button class="btn-add" onclick="addIngredient()">➕ Προσθήκη Υλικού</button>
        </div>
    </div>

    <div class="container">
        <div class="box">
            <h2>🏆 Δημοφιλή Πιάτα (Σήμερα)</h2>
            <div id="salesContainer"></div>
        </div>
        
        <div class="box">
            <h2>📋 Λίστα Αγορών (Υλικά με Έλλειψη)</h2>
            <div id="ingredientsContainer"></div>
        </div>
    </div>
    
    <center class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Εκτύπωση Λίστας Αγορών & Αναφοράς</button>
    </center>

    </body>
</html>