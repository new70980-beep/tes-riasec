const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// file penyimpanan
const DATA_FILE = path.join(__dirname, 'data.json');

// pastikan file ada
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
}

// mapping soal ke tipe RIASEC
const questions = {
    q1:"R", q2:"I", q3:"A", q4:"S", q5:"E", q6:"C",
    q7:"R", q8:"I", q9:"A", q10:"S", q11:"E", q12:"C",
    q13:"R", q14:"I", q15:"A", q16:"S", q17:"E", q18:"C",
    q19:"R", q20:"I", q21:"A", q22:"S", q23:"E", q24:"C",
    q25:"R", q26:"I", q27:"A", q28:"S", q29:"E", q30:"C"
};

// hitung skor
function calculateRIASEC(answers) {
    let scores = { R:0, I:0, A:0, S:0, E:0, C:0 };

    for (let q in answers) {
        let type = questions[q];
        if (type) {
            scores[type] += parseInt(answers[q]) || 0;
        }
    }

    return scores;
}

// tentukan jurusan
function determineMajor(scores) {
    let sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
    let top1 = sorted[0][0];

    let category = "";

    if (top1 === "I" || top1 === "R") {
        category = "SAINS";
    } else if (top1 === "E" || top1 === "S") {
        category = "BISNIS";
    } else if (top1 === "A") {
        category = "BISNIS KREATIF";
    } else {
        category = "MENYESUAIKAN";
    }

    return { category, sorted };
}

// ===== TAMBAHAN: SIMPAN DATA =====
function saveData(newData) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.push(newData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===== TAMBAHAN: AMBIL DATA =====
app.get('/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

// handle submit
app.post('/submit', (req, res) => {
    const answers = req.body;

    const scores = calculateRIASEC(answers);
    const result = determineMajor(scores);

    // simpan ke file
    saveData({
        waktu: new Date().toLocaleString(),
        answers,
        scores,
        result: result.category
    });

    res.send(`
        <h2>Hasil Tes RIASEC</h2>
        <pre>${JSON.stringify(scores, null, 2)}</pre>
        <h3>Rekomendasi: ${result.category}</h3>
        <a href="/">Kembali</a>
    `);
});

// halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== TAMBAHAN: ADMIN PAGE =====
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// PORT untuk Railway / Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server jalan di port " + PORT);
});