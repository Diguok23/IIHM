interface EnrollmentEmailProps {
  firstName: string
  email: string
  courseName: string
  courseDescription: string
  basePrice: number
  dstTax: number
  totalAmount: number
  dueDate: string
  enrollmentDate: string
}

export const EnrollmentEmailTemplate = ({
  firstName,
  email,
  courseName,
  courseDescription,
  basePrice,
  dstTax,
  totalAmount,
  dueDate,
  enrollmentDate,
}: EnrollmentEmailProps) => {
  const formattedDueDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedEnrollmentDate = new Date(enrollmentDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        lineHeight: "1.6",
        color: "#333333",
        backgroundColor: "#f8fafc",
        padding: "0",
        margin: "0",
      }}
    >
      {/* Outer Container */}
      <table
        width="100%"
        border={0}
        cellPadding="0"
        cellSpacing="0"
        style={{
          backgroundColor: "#f8fafc",
          padding: "20px 0",
        }}
      >
        <tbody>
          <tr>
            <td align="center" style={{ padding: "0" }}>
              {/* Main Email Container */}
              <table
                width="600"
                border={0}
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
                  overflow: "hidden",
                }}
              >
                <tbody>
                  {/* Header - Gradient */}
                  <tr>
                    <td
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        padding: "40px 20px",
                        textAlign: "center" as const,
                      }}
                    >
                      <h1
                        style={{
                          color: "#ffffff",
                          margin: "0 0 10px 0",
                          fontSize: "32px",
                          fontWeight: "700",
                        }}
                      >
                        🎓 Enrollment Confirmed!
                      </h1>
                      <p
                        style={{
                          color: "#ecfdf5",
                          margin: "0",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        Welcome to APMIH
                      </p>
                    </td>
                  </tr>

                  {/* Content Area */}
                  <tr>
                    <td style={{ padding: "40px 30px" }}>
                      {/* Greeting */}
                      <p
                        style={{
                          margin: "0 0 25px 0",
                          fontSize: "16px",
                          color: "#333333",
                        }}
                      >
                        Hello <strong>{firstName}</strong>,
                      </p>

                      <p
                        style={{
                          margin: "0 0 25px 0",
                          fontSize: "15px",
                          color: "#666666",
                          lineHeight: "1.8",
                        }}
                      >
                        Thank you for enrolling in our certification program! We're excited to have you join our
                        community of learners. Your enrollment has been successfully processed.
                      </p>

                      {/* Course Information Card */}
                      <div
                        style={{
                          backgroundColor: "#f0fdf4",
                          border: "2px solid #dcfce7",
                          borderRadius: "8px",
                          padding: "25px",
                          margin: "30px 0",
                        }}
                      >
                        <h2
                          style={{
                            color: "#059669",
                            margin: "0 0 15px 0",
                            fontSize: "18px",
                            fontWeight: "600",
                          }}
                        >
                          📚 Course Details
                        </h2>

                        <table width="100%" border={0} cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td style={{ paddingBottom: "12px" }}>
                                <strong style={{ color: "#333333", fontSize: "15px" }}>Course Name:</strong>
                              </td>
                              <td
                                align="right"
                                style={{
                                  paddingBottom: "12px",
                                  color: "#059669",
                                  fontWeight: "600",
                                }}
                              >
                                {courseName}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingBottom: "12px" }}>
                                <strong style={{ color: "#333333", fontSize: "15px" }}>Enrollment Date:</strong>
                              </td>
                              <td align="right" style={{ paddingBottom: "12px", color: "#666666" }}>
                                {formattedEnrollmentDate}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingBottom: "12px" }}>
                                <strong style={{ color: "#333333", fontSize: "15px" }}>Email:</strong>
                              </td>
                              <td align="right" style={{ paddingBottom: "12px", color: "#666666" }}>
                                {email}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p
                          style={{
                            fontSize: "14px",
                            color: "#666666",
                            marginTop: "15px",
                            borderTop: "1px solid #dcfce7",
                            paddingTop: "15px",
                            fontStyle: "italic",
                          }}
                        >
                          {courseDescription}
                        </p>
                      </div>

                      {/* Billing Information */}
                      <h2
                        style={{
                          color: "#1f2937",
                          margin: "30px 0 15px 0",
                          fontSize: "18px",
                          fontWeight: "600",
                        }}
                      >
                        💰 Billing Information
                      </h2>

                      <div
                        style={{
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "20px",
                          margin: "15px 0",
                        }}
                      >
                        <table width="100%" border={0} cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 0", fontSize: "15px" }}>
                                <strong>Program Fee</strong>
                              </td>
                              <td
                                align="right"
                                style={{
                                  padding: "10px 0",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  color: "#059669",
                                }}
                              >
                                ${basePrice.toFixed(2)}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 0", fontSize: "15px" }}>
                                <strong>DST Tax (16%)</strong>
                              </td>
                              <td
                                align="right"
                                style={{
                                  padding: "10px 0",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  color: "#ea580c",
                                }}
                              >
                                ${dstTax.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: "15px 0", fontSize: "16px" }}>
                                <strong style={{ fontSize: "18px" }}>Total Due</strong>
                              </td>
                              <td
                                align="right"
                                style={{
                                  padding: "15px 0",
                                  fontSize: "18px",
                                  fontWeight: "700",
                                  color: "#10b981",
                                }}
                              >
                                ${totalAmount.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Important Notice */}
                      <div
                        style={{
                          backgroundColor: "#fef3c7",
                          border: "2px solid #fcd34d",
                          borderRadius: "8px",
                          padding: "20px",
                          margin: "25px 0",
                        }}
                      >
                        <h3
                          style={{
                            color: "#92400e",
                            margin: "0 0 10px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                          }}
                        >
                          ⚠️ Important Notice
                        </h3>
                        <p
                          style={{
                            color: "#78350f",
                            margin: "0 0 10px 0",
                            fontSize: "14px",
                            lineHeight: "1.6",
                          }}
                        >
                          Your enrollment is now active, and you can access course materials immediately. However, to
                          maintain active status and for full access privileges, payment must be completed by:
                        </p>
                        <p
                          style={{
                            color: "#dc2626",
                            margin: "10px 0",
                            fontSize: "15px",
                            fontWeight: "700",
                          }}
                        >
                          📅 Due Date: {formattedDueDate}
                        </p>
                      </div>

                      {/* Payment Instructions */}
                      <div
                        style={{
                          backgroundColor: "#eff6ff",
                          border: "2px solid #bfdbfe",
                          borderRadius: "8px",
                          padding: "25px",
                          margin: "25px 0",
                        }}
                      >
                        <h3
                          style={{
                            color: "#1e40af",
                            margin: "0 0 15px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                          }}
                        >
                          📧 Payment Instructions
                        </h3>
                        <p
                          style={{
                            color: "#1e3a8a",
                            margin: "0 0 12px 0",
                            fontSize: "14px",
                            lineHeight: "1.6",
                          }}
                        >
                          To complete your payment and ensure continued access:
                        </p>
                        <ol
                          style={{
                            color: "#1e3a8a",
                            margin: "0 0 12px 20px",
                            fontSize: "14px",
                            lineHeight: "1.8",
                            paddingLeft: "0",
                          }}
                        >
                          <li style={{ marginBottom: "8px" }}>
                            Send an email to{" "}
                            <strong style={{ color: "#1e40af", fontSize: "15px" }}>finance@apmih.college</strong>
                          </li>
                          <li style={{ marginBottom: "8px" }}>
                            Include your full name: <strong>{firstName}</strong>
                          </li>
                          <li style={{ marginBottom: "8px" }}>
                            Include your email: <strong>{email}</strong>
                          </li>
                          <li style={{ marginBottom: "8px" }}>
                            Include the amount due: <strong>${totalAmount.toFixed(2)}</strong>
                          </li>
                          <li style={{ marginBottom: "8px" }}>
                            Include course name: <strong>{courseName}</strong>
                          </li>
                          <li>Wait for payment instructions from our finance team</li>
                        </ol>
                        <p
                          style={{
                            color: "#1e3a8a",
                            margin: "0",
                            fontSize: "14px",
                            fontStyle: "italic",
                          }}
                        >
                          Our finance team will respond within 24 hours with payment options and guidance.
                        </p>
                      </div>

                      {/* CTA Button */}
                      <table width="100%" border={0} cellPadding="0" cellSpacing="0" style={{ margin: "30px 0" }}>
                        <tbody>
                          <tr>
                            <td align="center">
                              <a
                                href="mailto:finance@apmih.college?subject=Payment%20for%20Enrollment%20-%20${courseName}"
                                style={{
                                  display: "inline-block",
                                  backgroundColor: "#10b981",
                                  color: "#ffffff",
                                  padding: "14px 40px",
                                  textDecoration: "none",
                                  borderRadius: "6px",
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  transition: "background-color 0.3s ease",
                                }}
                              >
                                ✉️ Email Finance Team
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Next Steps */}
                      <div
                        style={{
                          backgroundColor: "#f3f4f6",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "20px",
                          margin: "25px 0",
                        }}
                      >
                        <h3
                          style={{
                            color: "#1f2937",
                            margin: "0 0 12px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                          }}
                        >
                          📋 Next Steps
                        </h3>
                        <ul
                          style={{
                            color: "#4b5563",
                            margin: "0",
                            paddingLeft: "20px",
                            fontSize: "14px",
                            lineHeight: "1.8",
                          }}
                        >
                          <li style={{ marginBottom: "8px" }}>Log in to your dashboard to access course materials</li>
                          <li style={{ marginBottom: "8px" }}>Review the course syllabus and learning outcomes</li>
                          <li style={{ marginBottom: "8px" }}>Contact finance@apmih.college to arrange payment</li>
                          <li style={{ marginBottom: "8px" }}>Download your course materials and resources</li>
                          <li>Join our online community and forums</li>
                        </ul>
                      </div>

                      {/* Support */}
                      <p
                        style={{
                          color: "#666666",
                          margin: "25px 0 0 0",
                          fontSize: "14px",
                          lineHeight: "1.6",
                        }}
                      >
                        If you have any questions or need assistance, please don't hesitate to reach out to our support
                        team at <strong>support@apmih.college</strong> or visit our dashboard for more information.
                      </p>
                    </td>
                  </tr>

                  {/* Footer */}
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#1f2937",
                        color: "#f3f4f6",
                        padding: "30px",
                        textAlign: "center" as const,
                        borderTop: "2px solid #e5e7eb",
                      }}
                    >
                      <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                        <strong>APMIH - Academy of Professional Management & Hospitality Institute</strong>
                      </p>
                      <p
                        style={{
                          margin: "0 0 15px 0",
                          fontSize: "13px",
                          color: "#d1d5db",
                        }}
                      >
                        📧 support@apmih.college | 💼 finance@apmih.college | 🌐 www.apmih.college
                      </p>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "12px",
                          color: "#9ca3af",
                          fontStyle: "italic",
                        }}
                      >
                        © 2025 APMIH. All rights reserved. This is an automated message, please do not reply to this
                        email.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
