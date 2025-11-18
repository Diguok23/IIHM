import { type NextRequest, NextResponse } from "next/server"
import { getIntasendPaymentStatus, saveIntasendPaymentToDatabase } from "@/lib/intasend"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const invoiceId = searchParams.get("invoiceId")

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 })
    }

    const paymentStatus = await getIntasendPaymentStatus(invoiceId)

    // Update payment in database
    await saveIntasendPaymentToDatabase({
      invoice_id: paymentStatus.id,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      email: paymentStatus.email,
      state: paymentStatus.state,
      payment_method: paymentStatus.payment_method,
      updated_at: paymentStatus.updated_at,
      metadata: paymentStatus,
    })

    return NextResponse.json({
      status: true,
      data: paymentStatus,
    })
  } catch (error) {
    console.error("Error verifying Intasend payment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to verify payment",
      },
      { status: 500 },
    )
  }
}
