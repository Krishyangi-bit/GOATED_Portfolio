<div align="center">

# 💥 KRISHYANGI DIXIT 💥

### *Developer by profession. Professional bug creator by accident.*

**B.Tech CSE @ K.R. Mangalam University · Google Gemini Student Ambassador · Hackathon regular**

[![GitHub](https://img.shields.io/badge/GitHub-Krishyangi--bit-16131c?style=for-the-badge&logo=github)](https://github.com/Krishyangi-bit)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Krishyangi_Dixit-2f7de1?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/krishyangi-dixit-9527ba388/)
[![Email](https://img.shields.io/badge/Email-dixitkrishyangi@gmail.com-f07a2e?style=for-the-badge&logo=gmail&logoColor=white)](mailto:dixitkrishyangi@gmail.com)

</div>

---

> **Hi, I'm Krishyangi.** 👋
> I turn *"what if…?"* into working software. My first public repo was Python (September 2025), and I haven't stopped building since.
> I fried a Raspberry Pi by forgetting a voltage divider, and now it's the first thing I check.
>
> **Curious by default. Builder by choice. Debugger by necessity.**

This repo is **my portfolio, drawn as a comic book**. I'm the protagonist: a hand-drawn character who reacts as you scroll, talks in speech bubbles, waves, laughs ("HAHA!"), thinks ("HMMM") and gets confused ("HUH?"), just like me.

---

## ⚡ The protagonist at a glance

| | |
|---|---|
| 🎓 **Studying** | B.Tech CSE (Core), K.R. Mangalam University · 2025 – 2029 |
| 🏅 **Academics** | Dean's Honours Award: **9.12 / 10 SGPA** in Semester 2 |
| ✨ **Role** | **Google Gemini Student Ambassador**. I ran 2 sessions for 50+ students on campus |
| 🏆 **Hackathons** | **HackIIITD 2026**: reached round 3 · **Fork-IT 2026**: reached round 2 as **Team Lead** of Team Baklava |
| 🤖 **Obsessed with** | Where AI meets hardware: robotics, drones, embedded systems and system design |
| 📍 **Based in** | Haryana, India · **open to software engineering internships** |

---

## 🛠️ Things I've built

| Project | What it is | Highlight |
|---|---|---|
| **CampusFix** | Real-time campus maintenance platform (React, Node.js, Express, MongoDB, Socket.IO) | JWT with refresh-token rotation, live updates over Socket.IO, 22 integration tests |
| **Mini-Courier Planner** | Algorithms capstone: van packing and delivery routes (Python, Flask) | **20.9% shorter routes** with 2-opt (966.8 → 764.7 km) |
| **Hack Computer & Assembler** | Nand to Tetris: from logic gates up to a CPU, plus a two-pass assembler | Built in HDL + Python, with 15 unit tests |
| **SwaadSaar** *(Fork-IT 2026, team lead)* | Menu optimiser that cuts single-use kitchen ingredients using flavour science | **39 → 31 ingredients** on a 10-dish menu, 79% fewer API calls |
| **KhetKaaj** *(HackIIITD 2026)* | WhatsApp + web assistant for farmers in Hindi, Hinglish and English | I coded the safety gate that withholds unsafe or low-confidence answers |
| **MindSpace** *(team)* | Student burnout and sentiment analytics | I moved the frontend to React Query and cleaned up loading and errors |

**My toolkit:** Python · JavaScript · TypeScript · SQL · React · Node.js · Express · Flask · MongoDB · Socket.IO · Git

---

## 📖 Read the comic

Every section of the site is a chapter of my story:

| # | Chapter | What you'll find |
|---|---|---|
| 01 | **Meet the Protagonist** | Me, my tagline, and a character you can poke |
| 02 | **The Origin Story** | Curiosity, my first line of Python, and the Raspberry Pi incident |
| 03 | **The Hall of Experiments** | My projects as comic issues: MindSpace, BugSift, N.A.V.R.A.A.H |
| 04 | **Character Development** | My journey: university, Gemini ambassador, IIIT-Delhi hackathons, what's next |
| 05 | **The Arsenal** | My real skills as a field kit, with no fake skill bars |
| 06 | **The Multiverse** | Portals to my GitHub, LinkedIn and email |
| 07 | **To Be Continued…?** | A contact form that really reaches my inbox |

💼 **Recruiters:** hit **Recruiter mode** in the top bar to open my résumé instantly, with a one-click download.

### 🥚 Easter eggs (because of course)

- Click me. Repeatedly. I have opinions.
- Smash the **BAM!** sticker.
- Type `bam` anywhere on the page.
- Scroll through my origin story *really* fast.
- Hover a button without clicking. I notice.

---

## 🚀 Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

Built with **React + TypeScript + Vite**, animated with **GSAP**, with sounds generated live by the **Web Audio API** (no audio files). It deploys on **Netlify**.

<details>
<summary><b>Where things live</b></summary>

| Path | What |
|------|------|
| `src/content/` | All my copy and facts (`site.ts`, `origin.ts`, `projects.ts`, `journey.ts`, `arsenal.ts`, `dialogue.ts`). Edit text here, not in components. |
| `src/character/` | The character rig (`Character.tsx`), pose map (`poses.ts`) and expression/dialogue controller. |
| `src/components/` | Comic pieces: `ComicPanel`, `SpeechBubble`, `ComicButton`, `Burst`, `ChapterNav`, `PdfViewer`, `SecretPanel`… |
| `src/sections/` | One file per chapter. |
| `src/lib/softSound.ts` | Woosh sounds and my character's voice (HAHA! / HMMM / HUH?). |
| `public/docs/` | My résumé and certificates. |
| `assets-src/` | Original illustrations + the asset pipeline scripts. |

To add a chapter, add an entry to `CHAPTERS` in `src/content/site.ts` and render its `<section id="…">` in `App.tsx`. The navigation picks it up automatically.

</details>

---

<div align="center">

### The story's still being written.
**Got an idea, a project or an internship? [Let's write the next chapter together.](mailto:dixitkrishyangi@gmail.com)** ✍️

*Hand-inked with React, GSAP and a lot of debugging. © 2026 Krishyangi Dixit*

</div>
