const assessmentForm = document.getElementById('assessmentForm');
const steps = [...document.querySelectorAll('.form-step')];
const progressItems = [...document.querySelectorAll('#stepList li')];
const progressBar = document.getElementById('progressBar');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');
const resultPanel = document.getElementById('resultPanel');
let currentStep = 0;
let lastAssessment = null;

function showStep(index) {
  currentStep = index;
  steps.forEach((step, i) => step.classList.toggle('active', i === index));
  progressItems.forEach((item, i) => item.classList.toggle('active', i === index));
  progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
  backBtn.disabled = index === 0;
  nextBtn.classList.toggle('hidden', index === steps.length - 1);
  submitBtn.classList.toggle('hidden', index !== steps.length - 1);
  formError.textContent = '';
}

function validateCurrentStep() {
  const fields = [...steps[currentStep].querySelectorAll('[required]')];
  const invalid = fields.find(field => !field.value);
  if (invalid) {
    invalid.focus();
    formError.textContent = 'Prosimo, odgovorite na vsa obvezna vprašanja v tem koraku.';
    return false;
  }
  return true;
}

nextBtn.addEventListener('click', () => {
  if (validateCurrentStep()) showStep(Math.min(currentStep + 1, steps.length - 1));
});
backBtn.addEventListener('click', () => showStep(Math.max(currentStep - 1, 0)));

function calculateAssessment(data) {
  let technical = 50;
  let intent = 0;
  const positives = [];
  const considerations = [];

  const add = (condition, points, positiveText) => {
    if (condition) { technical += points; if (positiveText) positives.push(positiveText); }
  };

  add(data.propertyType === 'detached', 5, 'Samostojna hiša omogoča več prilagodljivosti pri postavitvi sistema.');
  add(data.propertyType === 'semi', 3, 'Objekt je lahko primeren ob preverbi umestitve zunanje enote.');
  if (data.propertyType === 'apartment') { technical -= 8; considerations.push('Pri stanovanju je treba preveriti soglasja, skupne dele in možnost postavitve zunanje enote.'); }

  if (data.buildYear === 'after2010') add(true, 10, 'Novejša gradnja običajno pomeni nižje toplotne izgube.');
  if (data.buildYear === '1991to2010') add(true, 5, 'Obdobje gradnje je pogosto dobro izhodišče, če je ovoj ustrezno izveden.');
  if (data.buildYear === 'pre1970') { technical -= 5; considerations.push('Pri starejši hiši je posebej pomemben izračun toplotnih izgub.'); }

  if (data.heatingSource === 'oil' || data.heatingSource === 'electric') add(true, 7, 'Menjava obstoječega vira lahko prinese občutno spremembo načina ogrevanja.');
  if (data.heatingSource === 'gas' || data.heatingSource === 'wood') add(true, 3, 'Obstoječi vir je mogoče primerjati s stroški in udobjem toplotne črpalke.');
  if (data.heatingSource === 'district') { technical -= 6; considerations.push('Pri daljinskem ogrevanju je treba najprej preveriti tehnične in pogodbene možnosti odklopa.'); }

  if (data.emitters === 'floor') add(true, 16, 'Talno ogrevanje je praviloma ugodno za nizkotemperaturno delovanje.');
  if (data.emitters === 'lowtemp') add(true, 10, 'Nizkotemperaturni radiatorji so lahko dobro izhodišče.');
  if (data.emitters === 'mixed') add(true, 5, 'Kombiniran sistem je lahko primeren po ločeni preverbi posameznih ogrevalnih krogov.');
  if (data.emitters === 'radiators') considerations.push('Preveriti je treba potrebno temperaturo vode in velikost radiatorjev pri najnižjih zunanjih temperaturah.');

  if (data.insulation === 'good') add(true, 14, 'Dobra izolacija zmanjšuje potrebno moč ogrevalnega sistema.');
  if (data.insulation === 'partial') add(true, 6, 'Delna izolacija je pozitivna, vendar je treba oceniti preostale toplotne izgube.');
  if (data.insulation === 'none') { technical -= 10; considerations.push('Brez dodatne izolacije je lahko potrebna večja moč, višja poraba ali predhodna sanacija ovoja.'); }
  if (data.insulation === 'unknown') considerations.push('Pred odločitvijo je smiselno preveriti sestavo in izolativnost ovoja stavbe.');

  if (data.windows === 'modern') add(true, 7, 'Novejša okna pomagajo omejevati toplotne izgube.');
  if (data.windows === 'mixed') add(true, 2, 'Delno zamenjana okna so koristna, stanje preostalih pa je treba preveriti.');
  if (data.windows === 'old') { technical -= 5; considerations.push('Starejša okna lahko pomembno povečajo toplotne izgube in potrebno moč sistema.'); }

  if (data.threePhase === 'yes') add(true, 4, 'Trifazni priključek je lahko primeren za načrtovanje električnega napajanja sistema.');
  if (data.threePhase === 'no') { technical -= 4; considerations.push('Izvajalec mora preveriti električni priključek, varovalke in morebitno nadgradnjo.'); }
  if (data.threePhase === 'unknown') considerations.push('Preverite vrsto priključka in moč glavnih varovalk.');

  if (data.space === 'yes') add(true, 4, 'Predviden prostor zmanjšuje tveganje pri umeščanju opreme.');
  if (data.space === 'no') { technical -= 6; considerations.push('Omejen prostor zahteva natančno preverbo postavitve, hrupa, odmikov in dostopa.'); }
  if (data.space === 'unknown' || data.space === 'probably') considerations.push('Na ogledu je treba potrditi lokacijo zunanje in notranje enote.');

  technical = Math.max(20, Math.min(96, technical));

  if (data.ownership === 'owner') intent += 25;
  else if (data.ownership === 'coowner') intent += 18;
  else if (data.ownership === 'family') intent += 12;

  const timelinePoints = { '0to3': 30, '3to6': 23, '6to12': 14, research: 4 };
  const budgetPoints = { over12000: 22, '8000to12000': 18, '5000to8000': 10, under5000: 3, unknown: 7 };
  intent += timelinePoints[data.timeline] || 0;
  intent += budgetPoints[data.budget] || 0;
  if (data.subsidy === 'yes') intent += 6;
  if (data.postcode) intent += 7;
  if (data.motivation === 'replacement') intent += 10;
  intent = Math.min(100, intent);

  let level, title, description;
  if (technical >= 76) {
    level = 'Obetavno izhodišče';
    title = 'Toplotna črpalka je vredna podrobne strokovne preverbe.';
    description = 'Vaši odgovori kažejo več ugodnih pogojev. Naslednji korak je izračun toplotnih izgub, preverba temperatur ogrevalnega sistema in ogled objekta.';
  } else if (technical >= 56) {
    level = 'Možna rešitev';
    title = 'Primernost je odvisna od nekaj ključnih podrobnosti.';
    description = 'Toplotna črpalka je lahko smiselna, vendar naj izvajalec pred ponudbo preveri izpostavljene omejitve in po potrebi predlaga spremljevalne izboljšave.';
  } else {
    level = 'Potrebna podrobnejša presoja';
    title = 'Pred izbiro naprave najprej preverite objekt in sistem.';
    description = 'Vaši odgovori kažejo dejavnike, zaradi katerih neposredna menjava morda ni optimalna brez dodatnih ukrepov ali drugačne tehnične rešitve.';
  }

  if (!positives.length) positives.push('Zbrani podatki predstavljajo dobro osnovo za strokovni ogled in primerjavo rešitev.');
  if (!considerations.length) considerations.push('Tudi pri dobri oceni je potreben izračun toplotnih izgub in preverba dejanskih temperatur sistema.');
  considerations.push('Preverite realno ponudbo, garancijo, servis, hrup in pogoje morebitne subvencije.');

  const leadTier = intent >= 75 ? 'A' : intent >= 50 ? 'B' : 'C';
  return { technical, intent, leadTier, level, title, description, positives, considerations };
}

assessmentForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateCurrentStep()) return;
  const data = Object.fromEntries(new FormData(assessmentForm).entries());
  const assessment = calculateAssessment(data);
  lastAssessment = { data, assessment, createdAt: new Date().toISOString() };
  document.getElementById('scoreValue').textContent = assessment.technical;
  document.getElementById('resultLevel').textContent = assessment.level;
  document.getElementById('resultTitle').textContent = assessment.title;
  document.getElementById('resultDescription').textContent = assessment.description;
  document.getElementById('positiveList').innerHTML = assessment.positives.map(item => `<li>${item}</li>`).join('');
  document.getElementById('considerationList').innerHTML = assessment.considerations.map(item => `<li>${item}</li>`).join('');
  resultPanel.classList.remove('hidden');
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity() || !lastAssessment) return;
  const contact = Object.fromEntries(new FormData(form).entries());
  const lead = { ...lastAssessment, contact };
  localStorage.setItem('energoizbira_demo_lead', JSON.stringify(lead));
  const confirmation = document.getElementById('demoConfirmation');
  confirmation.innerHTML = `<strong>Prototip je uspešno ustvaril kvalificirano povpraševanje.</strong><br>Interna prioriteta: ${lead.assessment.leadTier}; tehnična ocena: ${lead.assessment.technical}/100; namera projekta: ${lead.assessment.intent}/100. Podatki so bili shranjeni samo lokalno v tem brskalniku in niso bili nikamor poslani.`;
  confirmation.classList.remove('hidden');
  form.querySelector('button').disabled = true;
});

showStep(0);
