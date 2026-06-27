from fastapi.testclient import TestClient
from app.backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "ecommerce-app"}

def test_get_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert products[0]["id"] == 1
    assert "price" in products[0]

def test_get_single_product_valid():
    response = client.get("/api/products/1")
    assert response.status_code == 200
    product = response.json()
    assert product["name"] == "AeroGlow Mechanical Keyboard"

def test_get_single_product_invalid():
    response = client.get("/api/products/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"

def test_checkout_empty_cart():
    payload = {
        "email": "test@example.com",
        "shipping_address": "123 Test St",
        "payment_method": "credit_card",
        "cart_items": []
    }
    response = client.post("/api/checkout", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Cart is empty"

def test_checkout_valid_items():
    payload = {
        "email": "test@example.com",
        "shipping_address": "123 Test St",
        "payment_method": "credit_card",
        "cart_items": [
            {"product_id": 1, "quantity": 2},
            {"product_id": 2, "quantity": 1}
        ]
    }
    response = client.post("/api/checkout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "order_id" in data
    # Product 1 is 189.99 * 2 = 379.98
    # Product 2 is 299.99 * 1 = 299.99
    # Total = 679.97
    assert data["total_amount"] == 679.97

def test_checkout_invalid_items():
    payload = {
        "email": "test@example.com",
        "shipping_address": "123 Test St",
        "payment_method": "credit_card",
        "cart_items": [
            {"product_id": 999, "quantity": 1}
        ]
    }
    response = client.post("/api/checkout", json=payload)
    assert response.status_code == 404
