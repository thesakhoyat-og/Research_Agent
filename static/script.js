const CODES = {
  agent: `<span class="cm"># The research agent endpoint</span>
<span class="kw">def</span> <span class="fn">research</span>():
    topic = request.json[<span class="str">"topic"</span>]

    <span class="cm"># Give Groq the research goal</span>
    response = client.chat.completions.<span class="fn">create</span>(
        model=<span class="str">"groq/compound"</span>,
        messages=[
            {
                <span class="str">"role"</span>: <span class="str">"user"</span>,
                <span class="str">"content"</span>: topic
            }
        ],
        compound_custom={
            <span class="str">"tools"</span>: {
                <span class="str">"enabled_tools"</span>: [<span class="str">"web_search"</span>]
            }
        }
    )

    <span class="cm"># Groq handles the research + tool execution</span>
    <span class="kw">return</span> response.choices[<span class="num">0</span>].message.content`,

  tools: `<span class="cm"># Groq's built-in research tool</span>

compound_custom = {
    <span class="str">"tools"</span>: {
        <span class="str">"enabled_tools"</span>: [
            <span class="str">"web_search"</span>
        ]
    }
}

<span class="cm"># Groq decides when web search is useful.</span>
<span class="cm"># The search runs server-side, so the browser</span>
<span class="cm"># never sees our API key.</span>`,

  call: `<span class="cm"># Flask backend → Groq API</span>

<span class="kw">from</span> groq <span class="kw">import</span> Groq

client = <span class="fn">Groq</span>(
    api_key=os.<span class="fn">getenv</span>(<span class="str">"GROQ_API_KEY"</span>)
)

response = client.chat.completions.<span class="fn">create</span>(
    model=<span class="str">"groq/compound"</span>,
    messages=messages,
    compound_custom={
        <span class="str">"tools"</span>: {
            <span class="str">"enabled_tools"</span>: [<span class="str">"web_search"</span>]
        }
    }
)`
};

function showTab(name) {
  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tab === name
    );
  });

  document.getElementById("codeView").innerHTML = CODES[name];
}

function log(msg, type = "think") {
  const el = document.getElementById("log");

  if (el.querySelector(".log-empty")) {
    el.innerHTML = "";
  }

  const entry = document.createElement("div");
  entry.className = `entry ${type}`;
  entry.textContent = msg;

  el.appendChild(entry);
  el.scrollTop = el.scrollHeight;
}

function sep() {
  const el = document.getElementById("log");
  const entry = document.createElement("div");

  entry.className = "entry sep";
  entry.textContent = "─".repeat(48);

  el.appendChild(entry);
}

function setStatus(status) {
  document.getElementById("statusTxt").textContent = status;
}

async function runAgent() {
  const topicInput = document.getElementById("topic");
  const runButton = document.getElementById("runBtn");
  const resultWrap = document.getElementById("resultWrap");
  const result = document.getElementById("result");

  const topic = topicInput.value.trim();

  if (!topic) {
    topicInput.focus();
    return;
  }

  runButton.disabled = true;
  resultWrap.style.display = "none";
  result.textContent = "";
  document.getElementById("log").innerHTML = "";

  setStatus("running...");
  log(`🎯 goal: Research ${topic}`, "goal");
  sep();

  try {
    log("🧠 sending goal to Flask...", "think");
    setStatus("researching...");

    const response = await fetch("/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Research request failed.");
    }

    for (const item of data.logs || []) {
      log(item.message, item.type || "think");

      if (item.type === "tool") {
        await new Promise(resolve => setTimeout(resolve, 120));
      }
    }

    sep();

    result.textContent = data.result || "No result returned.";
    resultWrap.style.display = "block";
    setStatus("done ✓");

  } catch (error) {
    log(`✗ ${error.message}`, "err");
    setStatus("error");
  } finally {
    runButton.disabled = false;
  }
}

document.querySelectorAll(".tab-btn").forEach(button => {
  button.addEventListener("click", () => {
    showTab(button.dataset.tab);
  });
});

document.getElementById("runBtn").addEventListener("click", runAgent);

document.getElementById("topic").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    runAgent();
  }
});

showTab("agent");
