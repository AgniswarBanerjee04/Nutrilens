import urllib.request
import io
import json
from PIL import Image

# Create synthetic food image
img = Image.new('RGB', (150, 150), color=(220, 110, 40))
buf = io.BytesIO()
img.save(buf, format='JPEG')
image_bytes = buf.getvalue()

boundary = '----NutriLensFormBoundary999'
header = (
    f'--{boundary}\r\n'
    'Content-Disposition: form-data; name="file"; filename="sample_curry.jpg"\r\n'
    'Content-Type: image/jpeg\r\n\r\n'
).encode('utf-8')
footer = f'\r\n--{boundary}--\r\n'.encode('utf-8')
payload = header + image_bytes + footer

req = urllib.request.Request(
    'http://localhost:8000/api/analyze-meal',
    data=payload,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)
res = urllib.request.urlopen(req)
data = json.loads(res.read())

print("=== /api/analyze-meal SUCCESS ===")
print("Cooking Method:", data.get("cooking_method"))
print("Hidden Fat Estimate:", data.get("hidden_fat_estimate_g"), "g")
print("Glycemic Index Rating:", data.get("glycemic_index_rating"))
print("Calories:", data.get("total_calories"))
print("Protein:", data.get("protein_g"), "g")
print("Carbs:", data.get("carbs_g"), "g")
print("Fats:", data.get("fats_g"), "g")
print("Food Items:", data.get("food_items"))
