from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Dict
import os

app = FastAPI(title="E-Commerce Enterprise Backend", version="1.0.0")

# Mock product database with high-end tech products
PRODUCTS = [
    {
        "id": 1,
        "name": "AeroGlow Mechanical Keyboard",
        "description": "Premium wireless mechanical keyboard with dynamic RGB lighting and hot-swappable key switches.",
        "price": 189.99,
        "category": "Peripherals",
        "badge": "Hot",
        "rating": 4.8
    },
    {
        "id": 2,
        "name": "QuantumLink ANC Headphones",
        "description": "Studio-quality active noise-canceling headphones with 45-hour battery life and spatial audio support.",
        "price": 299.99,
        "category": "Audio",
        "badge": "Best Seller",
        "rating": 4.9
    },
    {
        "id": 3,
        "name": "NovaDesk Ergonomic Chair",
        "description": "Sleek office chair featuring adaptive lumbar support, 4D armrests, and premium breathable mesh.",
        "price": 449.99,
        "category": "Furniture",
        "badge": "New",
        "rating": 4.7
    },
    {
        "id": 4,
        "name": "TitanDrive 2TB NVMe SSD",
        "description": "Ultra-fast PCIe Gen5 solid-state drive with integrated heatsink, delivering speeds up to 12,400 MB/s.",
        "price": 219.99,
        "category": "Storage",
        "badge": "Sale",
        "rating": 4.9
    },
    {
        "id": 5,
        "name": "SpectralLoop RGB Fan Kit",
        "description": "Triple pack of 120mm PWM addressable RGB fans with an advanced controller hub and silent bearings.",
        "price": 79.99,
        "category": "Cooling",
        "badge": "Featured",
        "rating": 4.6
    },
    {
        "id": 6,
        "name": "Zenith Ultra-Wide Monitor",
        "description": "34-inch curved gaming monitor with 165Hz refresh rate, 1ms response time, and HDR400 colors.",
        "price": 599.99,
        "category": "Monitors",
        "badge": "Premium",
        "rating": 4.8
    }
]

class CartItem(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, description="Quantity must be greater than 0")

class CheckoutRequest(BaseModel):
    email: str
    shipping_address: str
    payment_method: str
    cart_items: List[CartItem]

@app.get("/api/products")
async def get_products():
    return PRODUCTS

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/checkout")
async def checkout(request: CheckoutRequest):
    if not request.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total = 0.0
    for item in request.cart_items:
        product = next((p for p in PRODUCTS if p["id"] == item.product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        total += product["price"] * item.quantity
    
    # Process simulated order
    order_id = f"ORD-{os.urandom(4).hex().upper()}"
    return {
        "status": "success",
        "message": "Order processed successfully",
        "order_id": order_id,
        "total_amount": round(total, 2)
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ecommerce-app"}

# Mount frontend files after the API routes
backend_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(os.path.dirname(backend_dir), "frontend")

if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
