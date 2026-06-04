async function fetchSync() {
    try {
        const res = await fetch('sync.php');
        const data = await res.json();
        
        // --- ΕΛΕΓΧΟΣ ΑΔΕΙΑΣ ---
        if (data.license_error === true) {
            document.body.innerHTML = `
                <div style="background:#000; color:#ff4444; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-family:sans-serif; padding:20px;">
                    <div style="font-size:80px; margin-bottom:20px;">🔒</div>
                    <h1 style="text-transform:uppercase; letter-spacing:2px;">Η άδεια χρήσης έληξε</h1>
                    <p style="color:#888; font-size:18px;">Επικοινωνήστε με τον προγραμματιστή για ανανέωση της συνδρομής σας.</p>
                </div>`;
            return;
        }

        // ... ο υπόλοιπος κώδικας της fetchSync (tablesOnly, products κλπ) ...