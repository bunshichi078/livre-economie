let params = {
    poissons: 100,
    humains: 2,
    taxe: 10,
    cout_filet: 20,
    delai_centrale: 10,
    publicite: 20
};

let resultats = {};
let modeAvance = false;

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

function toggleMode() {
    modeAvance = document.getElementById('modeToggle').checked;
    document.getElementById('sliders-normal').style.display = modeAvance ? 'none' : 'block';
    document.getElementById('sliders-avance').style.display = modeAvance ? 'block' : 'none';
    runSimulation();
}

function updateSlider(id) {
    params[id] = parseFloat(document.getElementById(id).value);
    document.getElementById(`${id}-value`).textContent = params[id];
    runSimulation();
}

// Simulation adaptée du Chapitre 12
function simulerEconomie() {
    let poissons = { stock: params.poissons, prix_moyen: 10, cout_total: 0.5, valeur_intrinseque: 80, acceptabilite_sociale: 50, monetaire: true, transactions_recentes: 50 };
    let outil = { stock: 10, prix_moyen: 50, cout_total: 2, valeur_intrinseque: 70, acceptabilite_sociale: 90, monetaire: true, transactions_recentes: 5 };
    let electricite = { stock: 50, prix_moyen: 5, cout_total: 0.1, valeur_intrinseque: 90, acceptabilite_sociale: 60, monetaire: true, transactions_recentes: 20, delai_production: params.delai_centrale };
    let air_frais = { stock: 1000, prix_moyen: 0, cout_total: 0, valeur_intrinseque: 90, acceptabilite_sociale: 70, monetaire: false };
    let reputation = { stock: 100, prix_moyen: 0, cout_total: 0, valeur_intrinseque: 80, acceptabilite_sociale: 80, monetaire: false };

    let pecheur = { possessions: { poissons: 20, outil: 1, air_frais: 1, reputation: 1 }, argent: 200, revenus: 0, profits: 0, valeur_nette: 0, satisfaction_intrinseque: 0, satisfaction_sociale: 0 };
    let artisan = { possessions: { outil: 5, poissons: 2, air_frais: 1, reputation: 1 }, argent: 100, revenus: 0, profits: 0, valeur_nette: 0, satisfaction_intrinseque: 0, satisfaction_sociale: 0 };

    let resultats = {};
    let transactions = [];
    let pib = 0;

    for (let t = 0; t < 15; t++) {
        // Mise à jour prix
        poissons.prix_moyen = (20 / (poissons.stock + 1)) * poissons.cout_total;
        outil.prix_moyen = (20 / (outil.stock + 1)) * outil.cout_total;
        electricite.prix_moyen = (20 / (electricite.stock + 1)) * electricite.cout_total;

        // Transactions
        let qtePoissons = 10 * params.humains;
        let qteOutils = 2 * params.humains;
        transactions.push({ chose: poissons, quantite: qtePoissons, prix: poissons.prix_moyen });
        transactions.push({ chose: outil, quantite: qteOutils, prix: outil.prix_moyen });
        pecheur.revenus += qtePoissons * poissons.prix_moyen * (1 - params.taxe / 100);
        artisan.revenus += qteOutils * outil.prix_moyen * (1 - params.taxe / 100);
        artisan.depenses += qtePoissons * poissons.prix_moyen;
        pecheur.depenses += params.cout_filet;

        // Stocks et satisfaction
        poissons.stock += 5 * params.humains;
        electricite.stock = t >= params.delai_centrale ? 200 : Math.max(0, electricite.stock - 5);
        if (t === 10) air_frais.valeur_intrinseque *= 0.8;
        if (t === 12) {
            outil.valeur_intrinseque *= (1 + params.publicite / 100);
            outil.acceptabilite_sociale *= (1 + params.publicite / 100);
            outil.stock = Math.max(1, outil.stock * 0.8);
        }

        // Satisfaction
        pecheur.satisfaction_intrinseque = (pecheur.possessions.poissons * poissons.valeur_intrinseque + pecheur.possessions.air_frais * air_frais.valeur_intrinseque) * (1 + 100 / (poissons.stock + 1)) / 100;
        artisan.satisfaction_intrinseque = (artisan.possessions.outil * outil.valeur_intrinseque + artisan.possessions.air_frais * air_frais.valeur_intrinseque) * (1 + 100 / (outil.stock + 1)) / 100;
        artisan.satisfaction_sociale = artisan.possessions.outil * outil.acceptabilite_sociale * (1 + 100 / (outil.stock + 1)) / 100;

        // Finances
        pecheur.profits = pecheur.revenus - pecheur.depenses;
        artisan.profits = artisan.revenus - artisan.depenses;
        pecheur.valeur_nette = pecheur.possessions.poissons * poissons.prix_moyen + pecheur.argent;
        artisan.valeur_nette = artisan.possessions.outil * outil.prix_moyen + artisan.argent;

        pib += qtePoissons * poissons.prix_moyen + qteOutils * outil.prix_moyen;
        resultats[t] = {
            pib: pib,
            pecheur_satisfaction: pecheur.satisfaction_intrinseque + pecheur.satisfaction_sociale,
            artisan_satisfaction: artisan.satisfaction_intrinseque + artisan.satisfaction_sociale,
            pecheur_valeur: pecheur.valeur_nette,
            artisan_valeur: artisan.valeur_nette
        };
    }
    return resultats;
}

function runSimulation() {
    resultats = simulerEconomie();
    updatePlots();
}

function setup() {
    let canvas = createCanvas(600, 400);
    canvas.parent('canvas-container');
}

function draw() {
    background(135, 206, 235); // Ciel
    fill(0, 128, 0);
    rect(0, 200, width, height - 200); // Sol
    fill(255, 255, 0);
    ellipse(width / 2, height - 100, 100, 50); // Île

    // Richesse île (PIB)
    let pib = resultats[14].pib;
    let niveauRichesse = pib < 500 ? 0 : pib < 1000 ? 1 : pib < 1500 ? 2 : pib < 2000 ? 3 : 4;
    if (niveauRichesse >= 0) drawBatiment(100, 250, niveauRichesse);
    if (niveauRichesse >= 1) drawBatiment(150, 250, niveauRichesse);
    if (niveauRichesse >= 2) drawBatiment(200, 250, niveauRichesse);
    if (niveauRichesse >= 3) drawBatiment(250, 250, niveauRichesse);
    if (niveauRichesse === 4) drawYacht(300, 300);

    // Habitants
    let pecheurSatisfait = resultats[14].pecheur_satisfaction > 100;
    let artisanSatisfait = resultats[14].artisan_satisfaction > 100;
    let pecheurRiche = resultats[14].pecheur_valeur > resultats[14].artisan_valeur;
    let artisanRiche = resultats[14].artisan_valeur > resultats[14].pecheur_valeur;
    drawHabitant(400, 300, pecheurSatisfait, pecheurRiche, "Pêcheur");
    drawHabitant(500, 300, artisanSatisfait, artisanRiche, "Artisan");
}

function drawBatiment(x, y, niveau) {
    fill(niveau === 0 ? 150 : niveau === 1 ? 200 : niveau === 2 ? 100 : 255, 100, 100);
    rect(x, y - (niveau + 1) * 20, 40, (niveau + 1) * 20);
}

function drawYacht(x, y) {
    fill(255);
    triangle(x, y, x + 40, y, x + 20, y - 20);
}

function drawHabitant(x, y, satisfait, riche, nom) {
    fill(255, 224, 189);
    ellipse(x, y, 30, 30); // Tête
    fill(satisfait ? 'green' : 'red');
    ellipse(x - 10, y - 5, 5, 5); // Yeux
    ellipse(x + 10, y - 5, 5, 5);
    arc(x, y + 5, 10, satisfait ? 10 : -10, 0, PI); // Bouche
    if (riche) {
        fill(0);
        rect(x - 15, y - 30, 30, 10); // Chapeau
    }
    fill(0);
    text(nom, x - 20, y + 30);
}

function updatePlots() {
    let years = Array.from({ length: 15 }, (_, i) => i);
    let pibData = years.map(t => resultats[t].pib);
    let satisfactionPecheur = years.map(t => resultats[t].pecheur_satisfaction);
    let satisfactionArtisan = years.map(t => resultats[t].artisan_satisfaction);
    let valeurPecheur = years.map(t => resultats[t].pecheur_valeur);
    let valeurArtisan = years.map(t => resultats[t].artisan_valeur);

    Plotly.newPlot('pib-plot', [{
        x: years,
        y: pibData,
        type: 'bar',
        name: 'PIB'
    }], { title: 'Évolution du PIB', height: 200 });
    Plotly.newPlot('satisfaction-plot', [
        { x: years, y: satisfactionPecheur, type: 'bar', name: 'Pêcheur' },
        { x: years, y: satisfactionArtisan, type: 'bar', name: 'Artisan' }
    ], { title: 'Satisfaction', height: 200 });
    Plotly.newPlot('valeur-nette-plot', [
        { x: years, y: valeurPecheur, type: 'bar', name: 'Pêcheur' },
        { x: years, y: valeurArtisan, type: 'bar', name: 'Artisan' }
    ], { title: 'Valeur Nette', height: 200 });
}