import os
from vertexai import init as vertex_init
from vertexai.generative_models import GenerativeModel

project = os.environ.get("GOOGLE_CLOUD_PROJECT")
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

if not project:
    raise RuntimeError("GOOGLE_CLOUD_PROJECT no está definido")

vertex_init(project=project, location=location)
model = GenerativeModel("gemini-1.5-flash")

prompt = "Dame 3 ideas para mejorar una tienda online de electrónica."
resp = model.generate_content(prompt)
print(resp.text if hasattr(resp, "text") else resp)

