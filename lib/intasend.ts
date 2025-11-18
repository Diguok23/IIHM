import { createServerSupabaseClient } from "./supabase"

const INTASEND_API_URL = "https://api.intasend.com/api/v1"
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY

export type IntasendPaymentData = {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  amount: number
  currency: string
  invoice_id?: string
  redirect_url?: string
}

export type IntasendInitializeResponse = {
  billing: {
    id: string
    invoice_id: string
    state: string
    amount: string
    currency: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    item_id?: string
    created_at: string
    updated_at: string
    hosted_invoice_url: string
  }
}

export type IntasendPaymentStatus = {
  id: string
  invoice_id: string
  state: string
  amount: string
  currency: string
  payment_method: string
  created_at: string
  updated_at: string
  mpesa_reference?: string
  card_last_four?: string
}

// Initialize payment
export async function initializeIntasendPayment(data: IntasendPaymentData): Promise<IntasendInitializeResponse> {
  try {
    const response = await fetch(`${INTASEND_API_URL}/invoicing/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INTASEND_SECRET_KEY}`,
      },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        amount: data.amount,
        currency: data.currency,
        invoice_id: data.invoice_id || `APMIH_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.detail || responseData.message || "Failed to initialize payment")
    }

    return responseData
  } catch (error) {
    console.error("Error initializing Intasend payment:", error)
    throw new Error("Failed to initialize payment with Intasend")
  }
}

// Get payment status
export async function getIntasendPaymentStatus(invoiceId: string): Promise<IntasendPaymentStatus> {
  try {
    const response = await fetch(`${INTASEND_API_URL}/invoicing/${invoiceId}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${INTASEND_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || data.message || "Failed to get payment status")
    }

    return data
  } catch (error) {
    console.error("Error getting Intasend payment status:", error)
    throw new Error("Failed to retrieve payment status")
  }
}

// Save payment to database
export async function saveIntasendPaymentToDatabase(paymentData: any) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("payments").insert({
      application_id: paymentData.application_id,
      certification_id: paymentData.certification_id,
      reference: paymentData.invoice_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      email: paymentData.email,
      status: paymentData.state,
      payment_method: paymentData.payment_method || "intasend",
      payment_date: paymentData.updated_at,
      metadata: paymentData,
      provider: "intasend",
    })

    if (error) throw error

    // If payment is successful, update application status
    if (paymentData.state === "COMPLETED" && paymentData.application_id) {
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "payment_received" })
        .eq("id", paymentData.application_id)

      if (updateError) throw updateError
    }

    return data
  } catch (error) {
    console.error("Error saving Intasend payment to database:", error)
    throw new Error("Failed to save payment information")
  }
}
