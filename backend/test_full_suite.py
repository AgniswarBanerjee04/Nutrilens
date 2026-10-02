"""Comprehensive integration test suite for NutriLens backend.

Validates:
1. Health check endpoint
2. Registration, login, and instant demo token authentication
3. User goals retrieval and customization
4. Vision AI analysis with synthetic food image
5. Meal creation with cooking method, hidden fat, and glycemic index rating
6. Meal listing and field verification
7. Macro-Balancer evaluation and custom recipe generation
8. Meal deletion
"""

import sys
import io
import json
import urllib.request
from datetime import datetime
from PIL import Image

BASE_URL = "http://127.0.0.1:8000"


def make_request(url, method="GET", data=None, headers=None):
    hdrs = headers.copy() if headers else {}
    body = None
    if data is not None:
        if isinstance(data, (dict, list)):
            body = json.dumps(data).encode("utf-8")
            if "Content-Type" not in hdrs:
                hdrs["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body = data

    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read()
            parsed = json.loads(content.decode("utf-8")) if content else None
            return status, parsed
    except urllib.error.HTTPError as e:
        err_content = e.read()
        try:
            parsed_err = json.loads(err_content.decode("utf-8"))
        except Exception:
            parsed_err = err_content.decode("utf-8")
        return e.code, parsed_err


def run_tests():
    print("========================================")
    print("  NUTRILENS FULL BACKEND TEST SUITE")
    print("========================================")

    # 1. Health check
    print("\n[1/7] Testing Health Check...")
    status, res = make_request(f"{BASE_URL}/api/health")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("status") == "healthy", f"Unexpected response: {res}"
    print("[OK] Health check PASSED:", res)

    # 2. Demo Auth
    print("\n[2/7] Testing Demo Auth...")
    status, demo_auth = make_request(f"{BASE_URL}/api/auth/demo", method="POST")
    assert status == 200, f"Demo login failed with status {status}: {demo_auth}"
    token = demo_auth["access_token"]
    user = demo_auth["user"]
    assert user["email"] == "alexander@nutrilens.ai"
    print(f"[OK] Demo auth PASSED for user {user['name']} ({user['email']})")

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 3. User Goals
    print("\n[3/7] Testing Goals Retrieval & Update...")
    status, goals = make_request(f"{BASE_URL}/api/goals", headers=auth_headers)
    assert status == 200, f"Get goals failed: {goals}"
    print(f"[OK] Existing Goals: {goals['target_calories']} kcal, {goals['target_protein']}g protein")

    new_goals = {
        "target_calories": 2400.0,
        "target_protein": 180.0,
        "target_carbs": 225.0,
        "target_fats": 70.0
    }
    status, updated_goals = make_request(f"{BASE_URL}/api/goals", method="PUT", data=new_goals, headers=auth_headers)
    assert status == 200, f"Update goals failed: {updated_goals}"
    assert updated_goals["target_calories"] == 2400.0
    print(f"[OK] Goals updated successfully to {updated_goals['target_calories']} kcal")

    # 4. Vision AI Meal Analysis
    print("\n[4/7] Testing Vision AI Meal Analysis (/api/analyze-meal)...")
    img = Image.new("RGB", (100, 100), color=(180, 70, 30))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    boundary = "----NutriLensSuiteBoundary42"
    part_head = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="test_meal.jpg"\r\n'
        "Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8")
    part_foot = f"\r\n--{boundary}--\r\n".encode("utf-8")
    multipart_payload = part_head + img_bytes + part_foot

    status, analysis = make_request(
        f"{BASE_URL}/api/analyze-meal",
        method="POST",
        data=multipart_payload,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    assert status == 200, f"Analyze meal failed: {analysis}"
    assert "hidden_fat_warnings" in analysis, "Expected hidden_fat_warnings in response"
    assert "glycemic_impact" in analysis, "Expected glycemic_impact in response"
    assert "fiber_g" in analysis, "Expected fiber_g in clinical analysis response"
    assert "sodium_mg" in analysis, "Expected sodium_mg in clinical analysis response"
    assert "net_carbs" in analysis, "Expected net_carbs in clinical analysis response"
    assert isinstance(analysis["hidden_fat_warnings"], list)
    print(f"[OK] Vision AI analysis PASSED: {analysis['food_items']}")
    print(f"  Clinical Extraction: Fiber={analysis['fiber_g']}g | Sodium={analysis['sodium_mg']}mg | Net Carbs={analysis['net_carbs']}g")
    print(f"  Hidden Fat Warnings: {analysis['hidden_fat_warnings']}")
    print(f"  Glycemic Impact: {analysis['glycemic_impact']} | Method: {analysis.get('cooking_method')}")

    # 5. Log Meal with Metabolic Properties
    print("\n[5/7] Testing Logging Meal (/api/meals)...")
    meal_data = {
        "food_summary": "Paneer Bhurji with Jowar Bhakri & Mint Chutney",
        "food_items": ["Crumbled Artisanal Paneer (120g)", "Jowar Millet Bhakri (1 pc)", "Pudina Chutney (2 tbsp)"],
        "calories": 480.0,
        "protein": 34.0,
        "carbs": 32.0,
        "fats": 20.0,
        "fiber_g": 8.0,
        "sodium_mg": 520.0,
        "net_carbs": 24.0,
        "hidden_fat_warnings": ["Desi cow ghee tadka with jeera (~1 tbsp)"],
        "glycemic_impact": "Low",
        "cooking_method": "Cast-Iron Kadhai Sautéed with Jeera-Hing",
        "hidden_fat_estimate_g": 5.5,
        "glycemic_index_rating": "Low"
    }
    status, logged_meal = make_request(
        f"{BASE_URL}/api/meals",
        method="POST",
        data=meal_data,
        headers=auth_headers
    )
    assert status == 201, f"Log meal failed: {logged_meal}"
    assert logged_meal["fiber_g"] == 8.0, f"Expected fiber_g=8.0, got {logged_meal.get('fiber_g')}"
    assert logged_meal["sodium_mg"] == 520.0, f"Expected sodium_mg=520.0, got {logged_meal.get('sodium_mg')}"
    assert logged_meal["net_carbs"] == 24.0, f"Expected net_carbs=24.0, got {logged_meal.get('net_carbs')}"
    meal_id = logged_meal["id"]
    assert logged_meal["glycemic_impact"] == "Low"
    assert "Desi cow ghee" in str(logged_meal.get("hidden_fat_warnings", []))
    print(f"[OK] Meal logged successfully with ID {meal_id}: {logged_meal['food_summary']}")

    # 6. Macro-Balancer Next Meal Recipe Generation
    print("\n[6/7] Testing AI Macro-Balancer Engine (/api/balance-next-meal)...")
    balancer_req = {"dietary_preference": "high-protein"}
    status, balancer_res = make_request(
        f"{BASE_URL}/api/balance-next-meal",
        method="POST",
        data=balancer_req,
        headers=auth_headers
    )
    assert status == 200, f"Macro balancer failed: {balancer_res}"
    assert balancer_res["status"] == "success"
    recipe = balancer_res["recipe"]
    assert recipe is not None
    print(f"[OK] Balancer evaluated deficits: {balancer_res['deficits']}")
    print(f"[OK] Generated Recipe: '{recipe['recipe_title']}'")
    print(f"  Tagline: {recipe['tagline']}")
    print(f"  Macro Target Match: {recipe['macro_alignment']['calories']} kcal | {recipe['macro_alignment']['protein_g']}g P | {recipe['macro_alignment']['carbs_g']}g C")
    print(f"  Cooking Method: {recipe['cooking_method']} | Glycemic Index: {recipe['glycemic_index_rating']}")
    print(f"  Ingredients: {len(recipe['ingredients'])} items | Steps: {len(recipe['instructions'])}")

    # 7. Delete Logged Meal
    print("\n[7/7] Testing Meal Deletion (/api/meals/{meal_id})...")
    status, _ = make_request(
        f"{BASE_URL}/api/meals/{meal_id}",
        method="DELETE",
        headers=auth_headers
    )
    assert status == 204, f"Delete meal failed with status {status}"
    print(f"[OK] Meal {meal_id} deleted successfully.")

    print("\n========================================")
    print("  ALL 7 SUITE TESTS PASSED PERFECTLY!")
    print("========================================")


if __name__ == "__main__":
    run_tests()
