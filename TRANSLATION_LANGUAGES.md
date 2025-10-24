🌐 Translation Languages Support
Chrome Translator API - Supported Languages

This extension uses the Chrome Translator API for real-time translation.
Below are the supported languages:

🌎 Primary Languages (Excellent Compatibility)

🇬🇧 English (en) — Main source for security analysis

🇫🇷 French (fr) — Optimal translation from English

🇪🇸 Spanish (es) — Very well supported

🇩🇪 German (de) — Very well supported

🇮🇹 Italian (it) — Very well supported

🇯🇵 Japanese (ja) — Excellent support

🇰🇷 Korean (ko) — Excellent support

🌍 Secondary Languages (Good Compatibility)

🇵🇹 Portuguese (pt)

🇳🇱 Dutch (nl)

🇵🇱 Polish (pl)

🇷🇺 Russian (ru)

🇺🇦 Ukrainian (uk)

🇨🇳 Chinese (Simplified) (zh)

🇹🇼 Chinese (Traditional) (zh-Hant)

🌐 Additional Languages

🇸🇦 Arabic (ar)

🇮🇱 Hebrew (he)

🇹🇷 Turkish (tr)

🇮🇳 Hindi (hi)

🇧🇩 Bengali (bn)

🇻🇳 Vietnamese (vi)

🇹🇭 Thai (th)

🇮🇩 Indonesian (id)

🌏 Nordic & Eastern European Languages

🇸🇪 Swedish (sv)

🇩🇰 Danish (da)

🇳🇴 Norwegian (no)

🇫🇮 Finnish (fi)

🇨🇿 Czech (cs)

🇬🇷 Greek (el)

⚙️ Fallback Mechanism

The extension uses a smart 3-level fallback system:

1️⃣ Chrome Translator API (Priority 1)

Uses Chrome’s native window.Translator

Fast and accurate translation

Checks availability with canTranslate()

Supports the most common language pairs

2️⃣ LanguageModel Fallback (Priority 2)

Uses Gemini Nano via window.LanguageModel

AI-based translation through prompt

Works with all listed languages

Preserves technical and cybersecurity terms

3️⃣ Mock Translation (Priority 3)

Used only when no AI is available

Returns an explanatory message

Indicates how to enable Chrome APIs

🧩 Checking Availability

The extension automatically logs messages in the console:

// On load
✅ Language selector populated with 28 languages, default: fr (EN→FR)
🔍 Testing some language pairs...
EN→FR: readily
EN→ES: readily
EN→DE: readily
EN→JA: readily
EN→ZH: after-download

// When changing language
🌐 Language changed to: 🇪🇸 Español (es)
🔍 Translation EN→es: readily

📊 Availability States
Status Meaning
✅ readily Available immediately
⬇️ after-download Requires model download
❌ no Unsupported pair (fallback used)
🔤 Commonly Tested Pairs
Pair Status Notes
EN → FR ✅ Excellent
EN → ES ✅ Excellent
EN → DE ✅ Excellent
EN → JA ✅ Excellent
EN → ZH ⬇️ After model download
FR → EN ✅ Bi-directional
🧠 Technical Notes

Automatic source language detection analyzes French/English words

If source = target, no translation is performed

Cybersecurity terms are preserved in all translations

Maximum: 10,000 characters per translation

🚀 Enabling Chrome Translator

To enable full functionality:

Open chrome://flags

Enable the following:

#translation-api

#optimization-guide-on-device-model

#prompt-api-for-gemini-nano

Restart Chrome

The extension will automatically download the necessary models

🛠️ Support

If a language doesn’t work properly:

Check logs in the console (F12)

The extension will automatically switch to LanguageModel

All listed languages are supported via fallback
