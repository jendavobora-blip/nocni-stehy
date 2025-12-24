# 🎮 Noční Stehy

**Multiplayer Pillow Shooter - Bulánci 2025 by Jan Vobora**

Zábavná multiplayerová hra, kde hráči střílí polštáře na své protivníky! Vytvořeno pro Bulánce 2025.

## 🎯 Jak hrát

Stačí otevřít odkaz a hra se automaticky spustí! Není potřeba nic zadávat.

- **Pohyb:** Klávesy W, A, S, D
- **Střelba:** Klikni myší směrem, kam chceš vystřelit polštář
- **Cíl:** Zasáhni ostatní hráče a získej body!
- **Jméno:** Automaticky vygenerované při spuštění

## 🚀 Spuštění hry

### Lokální spuštění

1. Nainstaluj závislosti:
```bash
npm install
```

2. Spusť server:
```bash
npm start
```

3. Otevři prohlížeč na adrese:
```
http://localhost:3000
```

### Deployment na Azure

Tato aplikace je připravena pro deployment na Azure Web Apps. GitHub Actions workflow automaticky nasadí aplikaci při pushnutí do main větve.

**Konfigurace:**
1. Vytvoř Azure Web App
2. Stáhni Publish Profile z Azure
3. Přidej secret `AZURE_WEBAPP_PUBLISH_PROFILE` do GitHub repository
4. Uprav `AZURE_WEBAPP_NAME` v `.github/workflows/azure-webapps-node.yml`

## 🎮 Herní mechanika

- **Okamžité spuštění:** Hra se spustí automaticky bez nutnosti zadávání jména
- **Automatická jména:** Každý hráč dostane náhodně vygenerované české jméno (např. "RychlýMedvěd42")
- **Unikátní barvy:** Každý hráč má svou barvu
- **Střelba polštáři:** Klikni myší pro vystřelení
- **Bodování:** Zasáhni ostatní hráče pro získání bodů
- **Žebříček:** Vyhrává hráč s nejvyšším skóre
- **Neomezený počet hráčů:** Podporuje libovolný počet hráčů najednou

## 🛠️ Technologie

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** HTML5 Canvas, JavaScript
- **Real-time komunikace:** WebSockets
- **Deployment:** Azure Web Apps

## 📝 Systémové požadavky

- Node.js 20.x nebo vyšší
- Moderní webový prohlížeč s podporou HTML5 Canvas
- Internetové připojení pro multiplayer

## 🎨 Herní prvky

- **Hráči:** Barevné kruhy s unikátními jmény
- **Polštáře:** Projektily, které se pohybují napříč hracím polem
- **Skóre:** Zobrazuje se u každého hráče
- **Real-time aktualizace:** Všechny akce jsou okamžitě viditelné všem hráčům

## 📜 Licence

MIT License - Vytvořeno pro zábavu na Bulánkách 2025!

---

**Vytvořil:** Jan Vobora  
**Rok:** 2025  
**Událost:** Bulánci
