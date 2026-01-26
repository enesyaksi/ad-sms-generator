from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.customer_models import Customer, CustomerCreate, CustomerUpdate
from app.services.customer_service import CustomerService
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/customers", tags=["customers"])
customer_service = CustomerService()

@router.post("/", response_model=Customer, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    user: dict = Depends(get_current_user)
):
    """
    Create a new customer for the authenticated user.
    """
    return await customer_service.create_customer(customer_data, user["uid"])

@router.get("/", response_model=List[Customer])
async def list_customers(user: dict = Depends(get_current_user)):
    """
    List all customers belonging to the authenticated user.
    """
    try:
        return customer_service.get_customers(user["uid"])
    except Exception as e:
        # Handle cases where Firestore index is needed but not yet created
        if "FAILED_PRECONDITION" in str(e):
             raise HTTPException(
                status_code=500,
                detail="This query requires a Firestore index. Check the server logs for the creation link."
            )
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{customer_id}", response_model=Customer)
async def get_customer(
    customer_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get details of a specific customer.
    """
    customer = customer_service.get_customer(customer_id, user["uid"])
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: str,
    customer_data: CustomerUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Update a customer's information.
    """
    customer = customer_service.update_customer(customer_id, customer_data, user["uid"])
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found or unauthorized")
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a customer.
    """
    success = customer_service.delete_customer(customer_id, user["uid"])
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found or unauthorized")
    return None
