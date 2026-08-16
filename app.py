import os
from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = Flask(__name__)

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY is missing. Add it to your .env file before starting Flask."
    )

client = Groq(
    api_key=api_key,
    
)

MODEL = "groq/compound-mini"


def object_to_dict(value):
    """Convert Groq SDK/Pydantic objects into JSON-safe Python data."""
    if value is None:
        return None

    if hasattr(value, "model_dump"):
        return value.model_dump()

    if isinstance(value, dict):
        return {str(k): object_to_dict(v) for k, v in value.items()}

    if isinstance(value, (list, tuple)):
        return [object_to_dict(v) for v in value]

    if hasattr(value, "__dict__"):
        return {
            str(k): object_to_dict(v)
            for k, v in vars(value).items()
            if not k.startswith("_")
        }

    return value


def build_agent_log(message):
    """Turn Groq's executed tool information into UI log entries."""
    logs = [
        {
            "message": "🧠 Groq is analyzing the research goal...",
            "type": "think",
        }
    ]

    executed_tools = getattr(message, "executed_tools", None) or []

    for tool in executed_tools:
        tool_data = object_to_dict(tool) or {}

        tool_type = tool_data.get("type", "tool")
        arguments = tool_data.get("arguments")

        logs.append(
            {
                "message": f"🛠  Groq used tool: {tool_type}",
                "type": "tool",
            }
        )

        if arguments:
            logs.append(
                {
                    "message": f"   query: {arguments}",
                    "type": "tool",
                }
            )

        output = (
            tool_data.get("output")
            or tool_data.get("search_results")
            or tool_data.get("result")
        )

        if output:
            preview = str(output).replace("\n", " ")[:180]
            logs.append(
                {
                    "message": f"👀 got result: {preview}...",
                    "type": "obs",
                }
            )

    logs.append(
        {
            "message": "✦ Groq finished the research",
            "type": "done",
        }
    )

    return logs


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/research")
def research():
    data = request.get_json(silent=True) or {}
    topic = str(data.get("topic", "")).strip()

    if not topic:
        return jsonify({"error": "Please enter a research topic."}), 400

    goal = (
        f"Research this topic: {topic}\n\n"
        "Use web search to gather current, reliable information. "
        "Then produce a clear, concise research summary with 3-5 key points. "
        "Include important dates, numbers, examples, or sources when relevant. "
        "Do not invent facts. Prefer recent and authoritative information."
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a concise research agent. "
                        "Research first, then summarize the findings clearly. "
                        "Use the available web search tool when current or "
                        "verifiable information is needed."
                    ),
                },
                {
                    "role": "user",
                    "content": goal,
                },
            ],
            compound_custom={
                "tools": {
                    "enabled_tools": ["web_search"]
                }
            },
        )

        message = response.choices[0].message
        final_text = message.content or "No research summary was returned."

        return jsonify(
            {
                "topic": topic,
                "model": MODEL,
                "logs": build_agent_log(message),
                "result": final_text,
            }
        )

    except Exception as exc:
        return jsonify(
            {
                "error": str(exc),
                "logs": [
                    {
                        "message": f"✗ Groq error: {exc}",
                        "type": "err",
                    }
                ],
            }
        ), 500


if __name__ == "__main__":
    app.run(debug=True)
