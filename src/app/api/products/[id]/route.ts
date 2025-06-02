import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/models/product';
import { ProductResponse } from '@/types/types';

// GET single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json({
        success: false,
        error: "Product not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product GET Error:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch product"
    }, { status: 500 });
  }
}

// PUT update product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const updates = await request.json();
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      { ...updates },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json({
        success: false,
        error: "Product not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Product PUT Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to update product"
    }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json({
        success: false,
        error: "Product not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error('Product DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete product"
    }, { status: 500 });
  }
} 