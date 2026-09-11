"use strict";

const STORAGE_KEY = "battle-companies-prompter-v1";
const DEFAULT_STATE = {
  turn: 1,
  phase: 0,
  resources: { might: 3, will: 1, fate: 2, rerolls: 3 },
  checks: {}
};

const rules = {
  priority: {
    title: "Priority",
    body: "From the second turn onward, both players roll a D6. Highest has Priority; on a tie, Priority passes to the player who did not have it in the previous turn.",
    reference: "Middle-earth SBG Rules Manual, p.21"
  },
  broken: {
    title: "Broken force",
    body: "At the beginning of a turn, a force is Broken if its casualties are greater than its Break Point. Remaining eligible models then take Courage tests at the start of their moves.",
    reference: "Middle-earth SBG Rules Manual, pp.54–55"
  },
  odds: {
    title: "Against the Odds",
    body: "The lower-rated company receives one re-roll for every full 15 points of rating difference, to a maximum of 10. These may be used at any point during the game, but not in the post-game sequence.",
    reference: "Middle-earth SBG: Battle Companies, p.10"
  },
  declarations: {
    title: "Declaring Heroic Actions",
    body: "A Hero may attempt one Heroic Action at the start of the relevant Move, Shoot or Fight phase, before any dice are rolled. Declare it and spend one Might.",
    reference: "Middle-earth SBG Rules Manual, p.68"
  },
  heroicMove: {
    title: "Heroic Move",
    body: "The Hero moves before the normal Priority order. With Me! can let friendly models within 6 inches of the Hero’s starting point move too, provided they finish within 6 inches of the Hero.",
    reference: "Middle-earth SBG Rules Manual, p.69"
  },
  heroicMarch: {
    title: "Heroic March",
    body: "The Hero adds 3 inches to Infantry movement or 5 inches to Cavalry/Fly movement. Models using it cannot Charge that Move phase. At the Double! can extend the benefit to nearby friendly models under its conditions.",
    reference: "Middle-earth SBG Rules Manual, p.70"
  },
  channel: {
    title: "Heroic Channelling",
    body: "The Hero uses the Channelled versions of any Magical Powers they cast that turn.",
    reference: "Middle-earth SBG Rules Manual, p.71"
  },
  heroicShoot: {
    title: "Heroic Shoot",
    body: "The Hero shoots before other models. Loose! can allow friendly models within 6 inches to shoot with the Hero; a model that benefits but does not shoot cannot shoot later that phase.",
    reference: "Middle-earth SBG Rules Manual, p.69"
  },
  accuracy: {
    title: "Heroic Accuracy",
    body: "The Hero re-rolls failed In The Way rolls that Shoot phase. Take Aim! can extend this to friendly models within 6 inches.",
    reference: "Middle-earth SBG Rules Manual, p.71"
  },
  shooting: {
    title: "Shoot order",
    body: "The player with Priority resolves all shooting attacks they wish to make, one model at a time. Then the other player does the same.",
    reference: "Middle-earth SBG Rules Manual, p.35"
  },
  heroicCombat: {
    title: "Heroic Combat",
    body: "Resolve this Fight first. If every enemy in it is slain, the Hero and eligible friendly models in that Fight may move again, and may Charge and fight again in the normal sequence.",
    reference: "Middle-earth SBG Rules Manual, p.69"
  },
  strike: {
    title: "Heroic Strike",
    body: "Add D6 to the Hero’s Fight value for that Fight phase, to a maximum of 10. Roll at the start of the model’s Duel roll.",
    reference: "Middle-earth SBG Rules Manual, p.72"
  },
  defence: {
    title: "Heroic Defence",
    body: "For the ensuing Fight phase, the Hero is wounded only by the natural roll described by the rule. The Hero’s mount is not affected.",
    reference: "Middle-earth SBG Rules Manual, p.72"
  },
  strength: {
    title: "Heroic Strength",
    body: "Add D3 to the Hero’s Strength for that Fight phase, to a maximum of 10.",
    reference: "Middle-earth SBG Rules Manual, p.73"
  },
  challenge: {
    title: "Heroic Challenge",
    body: "A Hero in base contact may challenge an enemy Hero of the same or a higher Heroic Tier. This action has detailed accept/decline and combat restrictions—check the full rule before resolving it.",
    reference: "Middle-earth SBG Rules Manual, p.73"
  },
  fightOrder: {
    title: "Resolve a Fight",
    body: "Duel roll → loser Backs Away 1 inch → winner makes Strikes → remove casualties. Use re-rolls before Might. The player with Priority chooses the order of Fights.",
    reference: "Middle-earth SBG Rules Manual, p.43"
  },
  fate: {
    title: "Fate",
    body: "When a model with Fate is wounded, spend Fate one point at a time and roll. On 4+, the Wound has no effect. Might can alter a Fate roll before another Fate point is used.",
    reference: "Middle-earth SBG Rules Manual, p.75"
  },
  experience: {
    title: "Track Wounds and casualties",
    body: "During the game, track the Wounds each company member inflicts and which models are removed as casualties. These records matter for Injuries and Experience after the battle.",
    reference: "Middle-earth SBG: Battle Companies, pp.6–8"
  },
  end: {
    title: "End phase",
    body: "Resolve effects that last until the End phase, clear stray tokens and dice, and check your scenario’s own end conditions before starting the next turn.",
    reference: "Middle-earth SBG Rules Manual, p.19; scenario rules vary"
  }
};

const phases = [
  {
    title: "Start of turn",
    intro: "Set the order, then catch any start-of-turn effects before models move.",
    groups: [
      { label: "First things first", items: [
        ["Roll for Priority", "priority"],
        ["Mark who has Priority", "priority"],
        ["Check casualties against each Break Point", "broken"],
        ["Check scenario start effects and reinforcements", null],
        ["Check Against the Odds re-rolls remaining", "odds"]
      ]}
    ],
    note: "From Turn 2 onward, a tied Priority roll passes Priority to the player who did not have it last turn."
  },
  {
    title: "Move phase",
    intro: "Declare first. Then move the Priority player’s company, followed by the other company.",
    stop: true,
    groups: [
      { label: "Heroic Actions", items: [
        ["Heroic Move?", "heroicMove"],
        ["Heroic March?", "heroicMarch"],
        ["Heroic Channelling?", "channel"],
        ["Heroic Resolve or another listed action?", "declarations"]
      ]},
      { label: "Then move", items: [
        ["Priority player moves", null],
        ["Other player moves", null],
        ["Take Courage tests for Terror before Charging", null],
        ["Resolve Magical Powers and special rules", null],
        ["Check scenario interactions and objectives", null]
      ]}
    ],
    note: "A Heroic Action is declared at the start of its phase, before any dice are rolled."
  },
  {
    title: "Shoot phase",
    intro: "Declare first. Then the player with Priority resolves shooting before the other player.",
    stop: true,
    groups: [
      { label: "Heroic Actions", items: [
        ["Heroic Shoot?", "heroicShoot"],
        ["Heroic Accuracy?", "accuracy"],
        ["Another listed Shoot-phase action?", "declarations"]
      ]},
      { label: "Then shoot", items: [
        ["Priority player resolves shooting", "shooting"],
        ["Other player resolves shooting", "shooting"],
        ["Before accepting rolls: re-roll, then Might?", null],
        ["Record Wounds caused and casualties", "experience"]
      ]}
    ],
    note: "Against the Odds can be used at any point during the game. When modifying a roll, available re-rolls happen before Might."
  },
  {
    title: "Fight phase",
    intro: "Declare first. The player with Priority then chooses the order in which Fights are resolved.",
    stop: true,
    groups: [
      { label: "Heroic Actions", items: [
        ["Heroic Combat?", "heroicCombat"],
        ["Heroic Strike?", "strike"],
        ["Heroic Strength?", "strength"],
        ["Heroic Defence?", "defence"],
        ["Heroic Challenge or another listed action?", "challenge"]
      ]},
      { label: "For each Fight", items: [
        ["Declare Special Strikes / two-handed attacks", "fightOrder"],
        ["Roll Duel → modifiers → re-rolls → Might", "fightOrder"],
        ["Loser Backs Away 1 inch", "fightOrder"],
        ["Winner rolls Strikes / To Wound", null],
        ["Before accepting rolls: re-roll, then Might?", null],
        ["If wounded: spend Fate?", "fate"],
        ["Record Wounds and casualties", "experience"]
      ]}
    ],
    note: "Might may be spent after available re-rolls have been used. Keep Hero dice distinguishable in multiple combats."
  },
  {
    title: "End turn",
    intro: "Tidy the turn, record what matters, and check the scenario before continuing.",
    groups: [
      { label: "Close the turn", items: [
        ["Resolve effects that last until the End phase", "end"],
        ["Record all casualties and Wounds caused", "experience"],
        ["Check the scenario’s end condition", "end"],
        ["Update objectives or Victory Points if required", null],
        ["Clear temporary tokens and dice", "end"]
      ]}
    ],
    note: "Scenario endings differ. Use the scenario you are playing rather than a universal end-of-game shortcut."
  }
];

let state = loadState();

const el = {
  turnNumber: document.querySelector("#turnNumber"),
  phaseContent: document.querySelector("#phaseContent"),
  back: document.querySelector("#backButton"),
  next: document.querySelector("#nextButton"),
  track: [...document.querySelectorAll("[data-phase-jump]")],
  info: document.querySelector("#infoDialog"),
  infoTitle: document.querySelector("#infoTitle"),
  infoBody: document.querySelector("#infoBody"),
  infoReference: document.querySelector("#infoReference"),
  settings: document.querySelector("#settingsDialog"),
  confirm: document.querySelector("#confirmDialog")
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== "object") return structuredClone(DEFAULT_STATE);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      resources: { ...DEFAULT_STATE.resources, ...(parsed.resources || {}) },
      checks: parsed.checks || {}
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function checkId(phaseIndex, groupIndex, itemIndex) {
  return `t${state.turn}-p${phaseIndex}-g${groupIndex}-i${itemIndex}`;
}

function render() {
  const phase = phases[state.phase];
  el.turnNumber.textContent = state.turn;
  document.title = `Turn ${state.turn} · ${phase.title} · Battle Companies`;

  const groups = phase.groups.map((group, groupIndex) => `
    <p class="section-label">${group.label}</p>
    ${group.items.map(([label, ruleKey], itemIndex) => {
      const id = checkId(state.phase, groupIndex, itemIndex);
      return `<div class="check-row">
        <input id="${id}" type="checkbox" ${state.checks[id] ? "checked" : ""}>
        <label for="${id}">${label}</label>
        ${ruleKey ? `<button class="info-button" type="button" data-rule="${ruleKey}" aria-label="Rule reminder for ${label}">i</button>` : ""}
      </div>`;
    }).join("")}
  `).join("");

  el.phaseContent.innerHTML = `
    <article class="phase-card">
      <header class="phase-header">
        <p class="phase-kicker">${state.phase + 1} of ${phases.length}</p>
        <h2 class="phase-title">${phase.title}</h2>
        <p class="phase-intro">${phase.intro}</p>
      </header>
      ${phase.stop ? `<div class="stop-banner"><span class="stop-mark">STOP</span><span><strong>Any Heroic Actions?</strong><small>Before any dice are rolled</small></span></div>` : ""}
      <div class="checklist">${groups}</div>
      <p class="phase-note"><strong>Remember:</strong> ${phase.note}</p>
    </article>`;

  el.back.disabled = state.phase === 0;
  el.next.textContent = state.phase === phases.length - 1 ? "New turn →" : "Next →";
  el.track.forEach((button, index) => {
    button.classList.toggle("active", index === state.phase);
    button.classList.toggle("done", index < state.phase);
    button.setAttribute("aria-current", index === state.phase ? "step" : "false");
  });
  renderResources();
}

function renderResources() {
  Object.entries(state.resources).forEach(([key, value]) => {
    const valueNode = document.querySelector(`#${key}Value`);
    if (valueNode) valueNode.textContent = value;
  });
}

function setPhase(index, focus = true) {
  state.phase = Math.max(0, Math.min(phases.length - 1, index));
  saveState();
  render();
  if (focus) {
    el.phaseContent.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function newTurn() {
  state.turn += 1;
  state.phase = 0;
  state.checks = {};
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changeResource(key, delta) {
  const current = Number(state.resources[key]) || 0;
  state.resources[key] = Math.max(0, Math.min(99, current + delta));
  saveState();
  renderResources();
  const card = document.querySelector(`[data-resource="${key}"]`);
  card.classList.remove("flash");
  requestAnimationFrame(() => card.classList.add("flash"));
}

function showRule(key) {
  const rule = rules[key];
  if (!rule) return;
  el.infoTitle.textContent = rule.title;
  el.infoBody.textContent = rule.body;
  el.infoReference.textContent = rule.reference;
  el.info.showModal();
}

el.phaseContent.addEventListener("change", (event) => {
  if (event.target.matches("input[type='checkbox']")) {
    state.checks[event.target.id] = event.target.checked;
    saveState();
  }
});

el.phaseContent.addEventListener("click", (event) => {
  const infoButton = event.target.closest("[data-rule]");
  if (infoButton) showRule(infoButton.dataset.rule);
});

document.querySelectorAll(".resource-card").forEach((card) => {
  const key = card.dataset.resource;
  card.querySelector(".resource-spend").addEventListener("click", () => changeResource(key, -1));
  card.querySelector(".resource-add").addEventListener("click", () => changeResource(key, 1));
});

el.track.forEach((button) => button.addEventListener("click", () => setPhase(Number(button.dataset.phaseJump))));
el.back.addEventListener("click", () => setPhase(state.phase - 1));
el.next.addEventListener("click", () => state.phase === phases.length - 1 ? newTurn() : setPhase(state.phase + 1));
document.querySelector("#menuButton").addEventListener("click", () => el.settings.showModal());
document.querySelector("#newTurnButton").addEventListener("click", () => { el.settings.close(); newTurn(); });
document.querySelector("#resetButton").addEventListener("click", () => { el.settings.close(); el.confirm.showModal(); });
document.querySelector("#cancelReset").addEventListener("click", () => el.confirm.close());
document.querySelector("#confirmReset").addEventListener("click", () => {
  state = structuredClone(DEFAULT_STATE);
  saveState();
  el.confirm.close();
  render();
});

document.querySelectorAll(".dialog-close").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
}));

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const register = (tool) => Promise.resolve(context.registerTool(tool)).catch(() => {});
  register({
    name: "read_turn_state",
    title: "Read turn state",
    description: "Read the current turn, phase, resources and checklist progress without changing the prompter.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute() { return { turn: state.turn, phase: phases[state.phase].title, resources: { ...state.resources }, checks: { ...state.checks } }; }
  });
  register({
    name: "set_turn_phase",
    title: "Set turn phase",
    description: "Navigate the visible prompter to Start, Move, Shoot, Fight or End Turn.",
    inputSchema: { type: "object", properties: { phase: { type: "string", enum: ["Start", "Move", "Shoot", "Fight", "End Turn"] } }, required: ["phase"], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const names = ["Start", "Move", "Shoot", "Fight", "End Turn"];
      const index = names.indexOf(input?.phase);
      if (index < 0) throw new Error("Unknown phase");
      setPhase(index, false);
      return { turn: state.turn, phase: phases[state.phase].title };
    }
  });
  register({
    name: "set_resources",
    title: "Set hero resources",
    description: "Set the visible Might, Will, Fate and Against the Odds re-roll counters.",
    inputSchema: {
      type: "object",
      properties: {
        might: { type: "integer", minimum: 0, maximum: 99 },
        will: { type: "integer", minimum: 0, maximum: 99 },
        fate: { type: "integer", minimum: 0, maximum: 99 },
        rerolls: { type: "integer", minimum: 0, maximum: 10 }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const allowed = ["might", "will", "fate", "rerolls"];
      for (const [key, value] of Object.entries(input || {})) {
        if (!allowed.includes(key) || !Number.isInteger(value) || value < 0 || value > (key === "rerolls" ? 10 : 99)) throw new Error(`Invalid ${key}`);
        state.resources[key] = value;
      }
      saveState();
      renderResources();
      return { resources: { ...state.resources } };
    }
  });
}

render();
registerWebMcpTools();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
}
