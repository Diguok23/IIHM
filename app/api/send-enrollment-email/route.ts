import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { EnrollmentEmailTemplate } from "@/components/enrollment-email-template"
import React from "react"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { firstName, email, courseName, courseDescription, basePrice, dstTax, totalAmount, dueDate, enrollmentDate } =
      await request.json()

    if (!email || !firstName || !courseName || !basePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Email service is not configured. Please add RESEND_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const emailHtml = React.createElement(EnrollmentEmailTemplate, {
      firstName,
      email,
      courseName,
      courseDescription: courseDescription || "Professional certification course",
      basePrice,
      dstTax,
      totalAmount,
      dueDate,
      enrollmentDate,
    })

    const result = await resend.emails.send({
      from: "enrollment@apmih.college",
      to: email,
      subject: `🎓 Enrollment Confirmed - ${courseName} at APMIH`,
      react: emailHtml,
    })

    if (result.error) {
      console.error("Resend error:", result.error)
      return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Enrollment confirmation email sent successfully",
      emailId: result.data?.id,
    })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
