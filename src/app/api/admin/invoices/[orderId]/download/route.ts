import { NextResponse } from "next/server";

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    // Fetch order details from your database using params.orderId
    const response = await fetch(`${process.env.API_URL}/orders/${params.orderId}`);
    if (!response.ok) throw new Error("Failed to fetch order");
    
    const order = await response.json();

    // Create HTML content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 40px;
            }
            .invoice-header h1 {
              color: #1a1a1a;
              margin: 0;
            }
            .section {
              margin-bottom: 30px;
            }
            .order-details, .customer-details {
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f8f9fa;
            }
            .total {
              text-align: right;
              font-size: 1.2em;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>INVOICE</h1>
          </div>

          <div class="order-details">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <div class="customer-details">
            <h3>Bill To:</h3>
            <p>${order.customer.name}</p>
            <p>${order.customer.email}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Total: $${order.total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename=invoice-${order.orderNumber}.html`,
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { success: false, error: apiError.message },
      { status: 500 }
    );
  }
} 