const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const questions = {
    q1: "R",
    q2: "I",
    q3: "A",
    q4: "S",
    q5: "E",
    q6: "C",
    q7: "R",
    q8: "I",
    q9: "E",
    q10: "S"
};

function calculateRIASEC(answers) {
    let scores = { R:0, I:0, A:0, S:0, E:0, C:0 };

    for (let q in answers) {
        let type = questions[q];
        if (type) {
            scores[type] += parseInt(answers[q]);
        }
    }

    return scores;
}

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

app.post('/submit', (req, res) => {
    const answers = req.body;

    const scores = calculateRIASEC(answers);
    const result = determineMajor(scores);

    res.send(`
        <h2>Hasil Tes RIASEC</h2>
        <pre>${JSON.stringify(scores, null, 2)}</pre>
        <h3>Rekomendasi: ${result.category}</h3>
    `);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, () => {
    console.log("Server jalan di http://localhost:3000");
});