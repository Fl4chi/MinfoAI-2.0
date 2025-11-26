@echo off
echo Aggiornamento sito MinfoAI in corso...

cd website

(
echo ^<!DOCTYPE html^>
echo ^<html lang="it"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>MinfoAI 2.0 - Partnership Discord Bot^</title^>
echo     ^<link rel="stylesheet" href="style.css"^>
echo     ^<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet"^>
echo     ^<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"^>
echo ^</head^>
echo ^<body^>
echo     ^<div class="background-glow"^>^</div^>
echo     ^<nav^>
echo         ^<div class="logo"^>
echo             ^<img src="logo.png" alt="MinfoAI" class="logo-img"^>
echo             MinfoAI ^<span class="version"^>2.0^</span^>
echo         ^</div^>
echo         ^<div class="links"^>
echo             ^<a href="#features"^>Features^</a^>
echo             ^<a href="#partnership"^>Partnership^</a^>
echo             ^<a href="#tiers"^>Tiers^</a^>
echo         ^</div^>
echo         ^<a href="#" class="btn-primary"^>Aggiungi a Discord^</a^>
echo     ^</nav^>
echo     ^<header class="hero"^>
echo         ^<div class="hero-content"^>
echo             ^<div class="badge"^>✨ Powered by Google Gemini 2.0^</div^>
echo             ^<h1^>Partnership Discord^<br^>di Nuova Generazione^</h1^>
echo             ^<p^>Automatizza le partnership con l'intelligenza artificiale. Analisi automatica, Trust Score e gestione completa.^</p^>
echo             ^<div class="cta-group"^>
echo                 ^<a href="#partnership" class="btn-primary"^>Scopri Come^</a^>
echo                 ^<a href="#features" class="btn-secondary"^>Features^</a^>
echo             ^</div^>
echo         ^</div^>
echo         ^<div class="hero-visual"^>
echo             ^<div class="card glass"^>
echo                 ^<div class="chat-bubble user"^>/partner request^</div^>
echo                 ^<div class="chat-bubble bot"^>
echo                     ✅ ^<b^>Partnership Approvata!^</b^>^<br^>
echo                     Trust Score: 85/100^<br^>
echo                     Tier: GOLD 🏆
echo                 ^</div^>
echo             ^</div^>
echo         ^</div^>
echo     ^</header^>
echo     ^<section id="features" class="features"^>
echo         ^<h2^>Potenza AI^</h2^>
echo         ^<div class="grid"^>
echo             ^<div class="feature-card"^>^<i class="fas fa-brain"^>^</i^>^<h3^>Analisi AI^</h3^>^<p^>Gemini 2.0 analizza ogni partnership^</p^>^</div^>
echo             ^<div class="feature-card"^>^<i class="fas fa-bolt"^>^</i^>^<h3^>Automazione^</h3^>^<p^>Gestione automatica completa^</p^>^</div^>
echo             ^<div class="feature-card"^>^<i class="fas fa-chart-line"^>^</i^>^<h3^>Business DNA^</h3^>^<p^>Report dettagliati^</p^>^</div^>
echo         ^</div^>
echo     ^</section^>
echo     ^<section id="tiers" class="tiers-section"^>
echo         ^<h2^>Sistema Tier^</h2^>
echo         ^<div class="tier-grid"^>
echo             ^<div class="tier-card"^>^<h3^>Bronze^</h3^>^<p class="price"^>Gratis^</p^>^</div^>
echo             ^<div class="tier-card"^>^<h3^>Silver^</h3^>^<p class="price"^>1000 Coins^</p^>^</div^>
echo             ^<div class="tier-card popular"^>^<h3^>Gold^</h3^>^<p class="price"^>2500 Coins^</p^>^</div^>
echo             ^<div class="tier-card"^>^<h3^>Platinum^</h3^>^<p class="price"^>5000 Coins^</p^>^</div^>
echo         ^</div^>
echo     ^</section^>
echo     ^<footer^>^<p^>© 2025 MinfoAI^</p^>^</footer^>
echo     ^<script src="script.js"^>^</script^>
echo ^</body^>
echo ^</html^>
) > index_new.html

echo.
echo ✅ File creato: website/index_new.html
echo.
echo Ora rinomina manualmente index_new.html in index.html
echo oppure elimina il vecchio index.html e rinomina questo.
echo.
pause
